
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { useUser } from '../../contexts/UserContext';
import { useAIHistory } from '../../contexts/AIHistoryContext';
import { useSound } from '../../contexts/SoundContext';
import { decode, decodeAudioData } from '../../utils/audio';
import ControlButton from './ControlButton';
import DemoSection from './DemoSection';
import { BrainIcon, SparklesIcon, ListBulletIcon, TargetIcon } from '../Icons';

interface LectureSection {
    title: string;
    content: string;
    analogy: string;
    clinicalPearl: string;
}

interface GeneratedLecture {
    subject: string;
    briefingSummary: string;
    sections: LectureSection[];
}

const AILectureDemo: React.FC = () => {
    const { addHistoryItem } = useAIHistory();
    const { playClick, playTypewriter, playSuccess, playError } = useSound();
    
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [lecture, setLecture] = useState<GeneratedLecture | null>(null);
    const [isNarrating, setIsNarrating] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopAudio = () => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current = null;
        }
        setIsNarrating(false);
        setStatus(null);
    };

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        
        setIsGenerating(true);
        setLecture(null);
        stopAudio();
        playClick();
        setStatus("ACCESSING_PHYSICS_CORE...");

        const prompt = `
            Act as "Mission Commander Echo", an elite instructor for ultrasound physics.
            Generate a comprehensive high-fidelity tactical lecture on the following subject: "${topic}".
            
            The lecture must follow this JSON structure:
            {
                "subject": "Topic Title",
                "briefingSummary": "A concise (2-3 sentences) tactical overview for the audio briefing.",
                "sections": [
                    {
                        "title": "Module Title (e.g., The Physics Mechanism)",
                        "content": "Detailed technical explanation.",
                        "analogy": "A simple real-world analogy to anchor the concept.",
                        "clinicalPearl": "The 'so what?' - why this matters to a sonographer during a scan."
                    }
                ]
            }
            
            Generate 3 detailed sections. Use professional, intense, and encouraging language. 
            Focus on SPI board exam high-yield concepts.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            briefingSummary: { type: Type.STRING },
                            sections: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        content: { type: Type.STRING },
                                        analogy: { type: Type.STRING },
                                        clinicalPearl: { type: Type.STRING }
                                    },
                                    required: ['title', 'content', 'analogy', 'clinicalPearl']
                                }
                            }
                        },
                        required: ['subject', 'briefingSummary', 'sections']
                    }
                }
            });

            const data: GeneratedLecture = JSON.parse(response.text);
            setLecture(data);
            addHistoryItem({
                type: 'aiLecture',
                content: data,
                context: `Lecture: ${data.subject}`
            });
            playSuccess();
            
            // Automatically trigger narration of the briefing
            handleNarrate(data.subject, data.briefingSummary);

        } catch (err) {
            console.error("Lecture generation failed:", err);
            playError();
            setStatus("SIGNAL_INTERRUPTED");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNarrate = async (subject: string, summary: string) => {
        if (isNarrating) {
            stopAudio();
            return;
        }

        setIsNarrating(true);
        setStatus("SYNCHRONIZING_AUDIO...");

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const speechPrompt = `Tactical Briefing for ${subject}. ${summary} Engage the data core now.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: speechPrompt,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
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
                setStatus("PLAYING_BRIEFING");

                source.onended = () => {
                    if (sourceRef.current === source) {
                        setIsNarrating(false);
                        setStatus(null);
                    }
                };
            }
        } catch (err) {
            console.error("Narration failed:", err);
            setIsNarrating(false);
            setStatus(null);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in max-w-6xl mx-auto py-6">
            {/* Input Hub */}
            <section className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <BrainIcon className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Academy Initialization</h2>
                    <p className="text-white/50 mb-8 font-light leading-relaxed">Enter a concept (e.g., "Nonlinear Propagation", "Axial Resolution Trade-offs") and the system will reconstruct a high-fidelity tactical briefing.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow group">
                            <input 
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                placeholder="Concept Target..."
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[var(--gold)]/50 focus:outline-none transition-all pr-12 font-mono uppercase text-sm tracking-widest"
                                disabled={isGenerating}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                                <SparklesIcon className="w-5 h-5 text-[var(--gold)]" />
                            </div>
                        </div>
                        <ControlButton onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="h-14 px-10">
                            {isGenerating ? "PROCESSING..." : "ENGAGE"}
                        </ControlButton>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        {['Nyquist Limit', 'Axial vs Lateral', 'Piezoelectricity'].map(suggested => (
                            <button 
                                key={suggested}
                                onClick={() => setTopic(suggested)}
                                className="text-[9px] font-mono text-white/30 hover:text-[var(--gold)] border border-white/5 hover:border-[var(--gold)]/30 rounded-lg px-3 py-1.5 transition-all uppercase tracking-widest"
                            >
                                [ {suggested} ]
                            </button>
                        ))}
                    </div>
                </div>

                {isGenerating && (
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[var(--gold)] to-cyan-400 shadow-[0_0_20px_var(--gold)]"
                    />
                )}
            </section>

            {/* Content Display */}
            <AnimatePresence mode="wait">
                {lecture && (
                    <motion.div 
                        key={lecture.subject}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-12"
                    >
                        {/* Summary / Audio Controls */}
                        <div className="bg-black/40 border border-[var(--gold)]/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="shrink-0 w-32 h-32 rounded-3xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-[var(--gold)] opacity-0 group-hover:opacity-10 blur-xl transition-opacity" />
                                <BrainIcon className="w-16 h-16 text-[var(--gold)]" />
                            </div>
                            <div className="flex-grow space-y-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{lecture.subject}</h3>
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black text-cyan-400 uppercase tracking-widest">Neural_Extract_v4.2</span>
                                </div>
                                <p className="text-white/70 font-light leading-relaxed italic">"{lecture.briefingSummary}"</p>
                                <div className="flex items-center gap-6 pt-2">
                                    <button 
                                        onClick={() => handleNarrate(lecture.subject, lecture.briefingSummary)}
                                        className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all ${isNarrating ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-white/5 text-white/60 border-white/10 hover:border-[var(--gold)]/40 hover:text-white'}`}
                                    >
                                        <div className="relative">
                                            {isNarrating ? <div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse" /> : <ListBulletIcon className="w-4 h-4" />}
                                            {isNarrating && <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50" />}
                                        </div>
                                        {isNarrating ? (status || 'TERMINATE') : 'MISSION_BRIEFING'}
                                    </button>
                                    {isNarrating && (
                                        <div className="flex items-end gap-[2px] h-4">
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <motion.div key={i} className="w-[1.5px] bg-red-400/60 rounded-full" animate={{ height: [4, 16, 6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lecture Modules */}
                        <div className="grid grid-cols-1 gap-12">
                            {lecture.sections.map((section, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-xl"
                                >
                                    <div className="p-10 flex flex-col lg:flex-row gap-12">
                                        {/* Main Content */}
                                        <div className="flex-grow space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-white/40 text-lg">0{idx + 1}</div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-tight">{section.title}</h4>
                                            </div>
                                            <p className="text-white/60 leading-relaxed font-light text-lg">
                                                {section.content}
                                            </p>
                                            
                                            {/* Analogy HUD */}
                                            <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden group-hover:border-cyan-500/40 transition-colors">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                                                <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <TargetIcon className="w-3 h-3" /> Cognitive Anchor
                                                </h5>
                                                <p className="text-sm text-cyan-100/70 italic leading-relaxed">"{section.analogy}"</p>
                                            </div>
                                        </div>

                                        {/* Clinical Sidebar */}
                                        <div className="lg:w-80 shrink-0 space-y-6">
                                            <div className="bg-[var(--gold)]/5 border border-[var(--gold)]/20 p-8 rounded-[2rem] h-full flex flex-col justify-between group-hover:border-[var(--gold)]/40 transition-colors">
                                                <div>
                                                    <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] mb-6 shadow-inner">
                                                        <SparklesIcon className="w-6 h-6" />
                                                    </div>
                                                    <h5 className="text-xs font-black text-white uppercase tracking-widest mb-4">Clinical Extraction</h5>
                                                    <p className="text-sm text-white/60 leading-relaxed font-light">
                                                        {section.clinicalPearl}
                                                    </p>
                                                </div>
                                                <div className="pt-8 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                                                    <span className="text-[9px] font-mono text-white tracking-widest uppercase">Verified Objective</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer Status */}
                        <div className="text-center pt-8 opacity-20">
                            <p className="text-[9px] font-mono text-white tracking-[1em] uppercase">ECHO_MASTERS_ACADEMY_END_STREAM</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!lecture && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 animate-pulse">
                    <div className="w-20 h-20 border-2 border-dashed border-white/50 rounded-full flex items-center justify-center mb-6">
                        <BrainIcon className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-mono uppercase tracking-[0.4em]">Waiting for concept target input...</p>
                </div>
            )}
        </div>
    );
};

export default AILectureDemo;
