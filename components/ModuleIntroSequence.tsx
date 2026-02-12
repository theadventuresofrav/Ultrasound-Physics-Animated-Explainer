import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from '@google/genai';
import { DemoId } from '../types';
import { getModuleIntro } from '../data/moduleIntros';
import { useSound } from '../contexts/SoundContext';
import { useUser } from '../contexts/UserContext';
import { decode, decodeAudioData } from '../utils/audio';
import { BrainIcon, SparklesIcon } from './Icons';

interface ModuleIntroSequenceProps {
    moduleId: DemoId;
    onComplete: () => void;
}

const DataCloud = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
                key={`p1-${i}`}
                className="absolute w-1 h-1 bg-[var(--gold)]/20 rounded-full"
                initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%",
                    opacity: 0,
                    scale: Math.random() * 2
                }}
                animate={{ 
                    y: ["-10%", "110%"],
                    x: (Math.random() > 0.5 ? ["0%", "5%", "0%"] : ["0%", "-5%", "0%"]),
                    opacity: [0, 0.4, 0],
                }}
                transition={{ 
                    duration: Math.random() * 10 + 6, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

const HUDFrame = () => (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-12">
        <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full border border-white/5 relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden"
        >
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            
            <div className="absolute top-0 left-0 w-8 sm:w-16 h-8 sm:h-16 border-t border-l border-[var(--gold)]/30 rounded-tl-xl sm:rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-8 sm:w-16 h-8 sm:h-16 border-t border-r border-[var(--gold)]/30 rounded-tr-xl sm:rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-8 sm:w-16 h-8 sm:h-16 border-b border-l border-[var(--gold)]/30 rounded-bl-xl sm:rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-8 sm:w-16 h-8 sm:h-16 border-b border-r border-[var(--gold)]/30 rounded-br-xl sm:rounded-br-3xl" />
            
            <div className="absolute top-6 sm:top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-10 font-mono text-[7px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.5em] text-white/20 whitespace-nowrap px-4 sm:px-10 py-1.5 sm:py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
                <span className="flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                    Briefing
                </span>
                <span className="opacity-10">|</span>
                <span className="text-white/40 truncate max-w-[80px] sm:max-w-none uppercase">Established</span>
            </div>
        </motion.div>
    </div>
);

const ModuleIntroSequence: React.FC<ModuleIntroSequenceProps> = ({ moduleId, onComplete }) => {
    const introData = getModuleIntro(moduleId);
    const { playScan, playClick, getAudioFromCache, playBriefing } = useSound();
    const { handleApiError, isQuotaExhausted } = useUser();
    const [isNarrating, setIsNarrating] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    const hasStartedRef = useRef(false);
    
    useEffect(() => {
        if (hasStartedRef.current) return;
        hasStartedRef.current = true;

        const narrateIntro = async () => {
            const fullText = `Narrate this naturally: Mission Objective: ${introData.title}. ${introData.lines.join(' ')}`;
            
            const startPlayback = async (base64Audio: string) => {
                setIsNarrating(true);
                playScan();
                await playBriefing(base64Audio);
                if (!isSkipping) setTimeout(onComplete, 1200);
            };

            const cachedAudio = await getAudioFromCache(fullText);
            if (cachedAudio) {
                await startPlayback(cachedAudio);
                return;
            }

            if (isQuotaExhausted) {
                setTimeout(onComplete, 4000);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text: fullText }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: { voiceName: 'Charon' },
                            },
                        },
                    },
                });

                const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64Audio) {
                    await startPlayback(base64Audio);
                } else {
                    onComplete();
                }
            } catch (err: any) {
                handleApiError(err);
                setIsNarrating(false);
                if (!isSkipping) setTimeout(onComplete, 4000);
            }
        };

        narrateIntro();
    }, [moduleId, onComplete, introData, playScan, handleApiError, isQuotaExhausted, getAudioFromCache, playBriefing, isSkipping]);

    const handleSkip = () => {
        setIsSkipping(true);
        playClick();
        onComplete();
    };

    return (
        <div className="absolute inset-0 z-[100] bg-[#010102] flex flex-col items-center justify-center overflow-hidden px-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_80%)] pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_6px] pointer-events-none z-30 opacity-40" />
            
            <DataCloud />
            <HUDFrame />

            <motion.button 
                onClick={handleSkip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-20 sm:bottom-20 z-50 group flex flex-col items-center gap-2"
            >
                <div className="px-6 sm:px-10 py-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl group-hover:border-[var(--gold)]/40 transition-all duration-500 shadow-2xl flex items-center gap-3 sm:gap-4">
                    <span className="text-[8px] sm:text-[10px] font-black text-white/30 group-hover:text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] transition-colors">
                        Bypass_Transmission
                    </span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                        <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </motion.button>

            <div className="relative z-30 max-w-6xl w-full text-center px-4 sm:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 50, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                >
                    <div className="relative mb-4 sm:mb-6">
                        <motion.div 
                            className="absolute -inset-8 sm:-inset-20 bg-[var(--gold)]/5 blur-[40px] sm:blur-[100px] rounded-full"
                            animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.6, 1] }}
                            transition={{ duration: 6, repeat: Infinity }}
                        />
                        
                        <div className="flex items-center justify-center gap-2 sm:gap-4 text-[7px] sm:text-[11px] font-mono text-[var(--gold)] uppercase tracking-[0.4em] sm:tracking-[1em] opacity-40 mb-4 sm:mb-10">
                             <div className="w-4 sm:w-12 h-[1px] bg-gradient-to-r from-transparent to-current" />
                             <span className="shrink-0">Syncing_Node</span>
                             <div className="w-4 sm:w-12 h-[1px] bg-gradient-to-l from-transparent to-current" />
                        </div>

                        <h1 className="text-3xl sm:text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.9] italic drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] break-words">
                            {introData.title}
                        </h1>
                    </div>
                </motion.div>
                
                <div className="mt-8 sm:mt-20 flex justify-center items-end gap-[3px] sm:gap-[6px] h-12 sm:h-24 px-4 sm:px-10">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-[2px] sm:w-[4px] rounded-full bg-gradient-to-t from-[var(--gold)]/80 to-white/40 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                            animate={isNarrating ? { 
                                height: [6, Math.random() * 48 + 8, 6],
                                opacity: [0.3, 1, 0.3],
                            } : { height: 4, opacity: 0.1 }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 0.15 + Math.random() * 0.3,
                                delay: i * 0.012
                            }}
                        />
                    ))}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1.8 }}
                    className="mt-8 sm:mt-16 flex flex-col items-center gap-3 sm:gap-4"
                >
                    <p className="text-[7px] sm:text-[11px] font-mono text-white uppercase tracking-[0.3em] sm:tracking-[0.8em] font-black italic">
                        Neural_Briefing_Ready
                    </p>
                    <div className="h-[1px] sm:h-[2px] w-24 sm:w-64 bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
                </motion.div>
            </div>

            <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 px-6 sm:px-20 flex justify-between items-center z-40 pointer-events-none opacity-30 font-mono text-[6px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.5em] font-black text-white/50">
                <div className="flex items-center gap-4 sm:gap-12">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                        <span className="hidden xs:inline">Buffer:</span> {isNarrating ? 'STREAM' : 'WAIT'}
                    </span>
                    <span className="hidden sm:inline">Link: 1.2 GB/S</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-12 text-right">
                    <span className="truncate max-w-[60px] sm:max-w-none">Node: {moduleId.toUpperCase()}</span>
                    <span className="hidden sm:inline">Arch: OMEGA_5</span>
                </div>
            </div>
        </div>
    );
};

export default ModuleIntroSequence;