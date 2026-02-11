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

// Updated version from v2 to v3 to force regeneration of intro audio
const MODULE_INTRO_CACHE_PREFIX = 'echoMastersModuleIntroCache_v3';

const DataCloud = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Foreground sharp particles */}
        {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
                key={`p1-${i}`}
                className="absolute w-1 h-1 bg-[var(--gold)]/30 rounded-full"
                initial={{ 
                    x: Math.random() * 100 + "%", 
                    y: Math.random() * 100 + "%",
                    opacity: 0
                }}
                animate={{ 
                    y: ["-10%", "110%"],
                    opacity: [0, 0.6, 0],
                }}
                transition={{ 
                    duration: Math.random() * 8 + 4, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

const HUDFrame = () => (
    <div className="absolute inset-0 pointer-events-none p-6 sm:p-12">
        <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full border border-white/5 relative rounded-[2rem]"
        >
            {/* Corner Markers */}
            <div className="absolute -top-[1px] -left-[1px] w-12 h-12 border-t border-l border-[var(--gold)]/40 rounded-tl-3xl" />
            <div className="absolute -top-[1px] -right-[1px] w-12 h-12 border-t border-r border-[var(--gold)]/40 rounded-tr-3xl" />
            <div className="absolute -bottom-[1px] -left-[1px] w-12 h-12 border-b border-l border-[var(--gold)]/40 rounded-bl-3xl" />
            <div className="absolute -bottom-[1px] -right-[1px] w-12 h-12 border-b border-r border-[var(--gold)]/40 rounded-br-3xl" />
            
            {/* Top Telemetry */}
            <div className="absolute top-6 left-8 flex items-center gap-6 font-mono text-[9px] uppercase tracking-[0.4em] text-white/30">
                <span className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                    Tactical_Briefing
                </span>
                <span className="opacity-10">|</span>
                <span>Neural_Link: COMMITTING</span>
            </div>

            {/* Vertical Scale */}
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 flex flex-col gap-12 opacity-10">
                {[...Array(6)].map((_, i) => <div key={i} className="w-2 h-[1px] bg-white" />)}
            </div>
        </motion.div>
    </div>
);

const ModuleIntroSequence: React.FC<ModuleIntroSequenceProps> = ({ moduleId, onComplete }) => {
    const introData = getModuleIntro(moduleId);
    const { playScan, playClick } = useSound();
    const { handleApiError, isQuotaExhausted } = useUser();
    const [isNarrating, setIsNarrating] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        const narrateIntro = async () => {
            const cacheKey = `${MODULE_INTRO_CACHE_PREFIX}_${moduleId}`;
            // MODIFIED: Instruct TTS model to speak naturally.
            const fullText = `Narrate this intro naturally without calling out titles or bullet markers: Mission Objective: ${introData.title}. ${introData.lines.join(' ')}`;

            const playAudio = async (base64Audio: string) => {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                const ctx = audioContextRef.current;
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.start();
                sourceRef.current = source;
                setIsNarrating(true);
                playScan();

                source.onended = () => {
                    if (!isSkipping) setTimeout(onComplete, 1500);
                };
            };

            // Check Cache First
            const cachedAudio = localStorage.getItem(cacheKey);
            if (cachedAudio) {
                await playAudio(cachedAudio);
                return;
            }

            // Halt network request if we know we are out of quota
            if (isQuotaExhausted) {
                console.warn("[Quota Throttled] Skipping audio briefing.");
                setTimeout(onComplete, 3500);
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
                    try { localStorage.setItem(cacheKey, base64Audio); } catch (e) {}
                    await playAudio(base64Audio);
                } else {
                    throw new Error("No audio payload");
                }
            } catch (err: any) {
                handleApiError(err);
                setIsNarrating(false);
                if (!isSkipping) {
                    setTimeout(onComplete, 3500);
                }
            }
        };

        narrateIntro();

        return () => {
            if (sourceRef.current) {
                sourceRef.current.stop();
            }
        };
    }, [moduleId, onComplete, introData, playScan, handleApiError, isQuotaExhausted]);

    const handleSkip = () => {
        setIsSkipping(true);
        playClick();
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        onComplete();
    };

    return (
        <div className="absolute inset-0 z-[100] bg-[#010102] flex flex-col items-center justify-center overflow-hidden">
            {/* Visual Atmosphere Layers */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay z-20" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none z-30" />
            
            <DataCloud />
            <HUDFrame />

            {/* Skip Action - High Fidelity */}
            <motion.button 
                onClick={handleSkip}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-16 sm:bottom-20 z-50 flex flex-col items-center group cursor-pointer"
            >
                <div className="flex items-center gap-3 px-8 py-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl group-hover:border-[var(--gold)]/40 transition-all duration-500 shadow-2xl">
                    <span className="text-[11px] font-black text-white/30 group-hover:text-white uppercase tracking-[0.3em] transition-colors">
                        Bypass_Briefing
                    </span>
                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path d="M13 5l7 7-7 7M5 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </motion.button>

            <div className="relative z-30 max-w-5xl px-12 w-full text-center">
                {/* Main Subject Branding */}
                <motion.div
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center"
                >
                    <div className="relative mb-4">
                        <motion.div 
                            className="absolute -inset-12 bg-[var(--gold)]/5 blur-[80px] rounded-full"
                            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.4, 1] }}
                            transition={{ duration: 5, repeat: Infinity }}
                        />
                        
                        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--gold)] uppercase tracking-[0.8em] opacity-40 mb-6">
                             <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-current" />
                             <span>Neural_Academy_V5</span>
                             <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-current" />
                        </div>

                        <h1 className="text-6xl sm:text-9xl font-black text-white tracking-tighter uppercase leading-[0.85] italic">
                            {introData.title}
                        </h1>
                    </div>
                </motion.div>
                
                {/* Real-time Audio Reactive Spectral Visualizer */}
                <div className="mt-16 flex justify-center items-end gap-[4px] h-20 px-10">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-[3px] rounded-full bg-gradient-to-t from-[var(--gold)] to-white`}
                            animate={isNarrating ? { 
                                height: [8, Math.random() * 80 + 8, 8],
                                opacity: [0.2, 0.9, 0.2]
                            } : { height: 4, opacity: 0.05 }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 0.2 + Math.random() * 0.4,
                                delay: i * 0.01
                            }}
                        />
                    ))}
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1.5 }}
                    className="mt-12 flex items-center justify-center gap-4"
                >
                    <div className="h-[1px] w-12 bg-white/10" />
                    <p className="text-[10px] font-mono text-white uppercase tracking-[0.6em] font-light">
                        Mission_Directive: Syncing_Intelligence
                    </p>
                    <div className="h-[1px] w-12 bg-white/10" />
                </motion.div>
            </div>

            {/* Background Symbols */}
            <div className="absolute top-1/2 left-12 -translate-y-1/2 opacity-5 select-none pointer-events-none">
                 <BrainIcon className="w-64 h-64 text-white" />
            </div>
            <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 select-none pointer-events-none">
                 <SparklesIcon className="w-64 h-64 text-white rotate-12" />
            </div>

            {/* Tactical Metadata Grid */}
            <div className="absolute bottom-12 left-0 right-0 px-16 flex justify-between items-center z-40 pointer-events-none opacity-20 font-mono text-[9px] uppercase tracking-[0.4em] font-black">
                <div className="flex items-center gap-8">
                    <span>Buffer: {isNarrating ? 'SYNC' : 'IDLE'}</span>
                    <span>Link_Quality: 100%</span>
                </div>
                <div className="flex items-center gap-8 text-right">
                    <span>Sec_Sector: {moduleId.toUpperCase()}</span>
                    <span>Version: 5.0.2-OMEGA</span>
                </div>
            </div>
        </div>
    );
};

export default ModuleIntroSequence;