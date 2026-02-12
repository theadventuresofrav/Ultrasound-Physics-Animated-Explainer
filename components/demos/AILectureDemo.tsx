import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality, Type } from '@google/genai';
import { useUser } from '../../contexts/UserContext';
import { useAIHistory } from '../../contexts/AIHistoryContext';
import { useSound } from '../../contexts/SoundContext';
import ControlButton from './ControlButton';
import { BrainIcon, SparklesIcon, ListBulletIcon, TargetIcon, TrophyIcon, CheckCircleIcon } from '../Icons';

interface LectureSection {
    phase: string;
    title: string;
    content: string;
    contrast: string;
    mnemonic: string;
    analogy: string;
}

interface GeneratedLecture {
    quantifiedEffort: string;
    subject: string;
    roadmap: string[];
    sections: LectureSection[];
    behavioralMindset: string;
    finalAssessment: string[];
}

const AILectureDemo: React.FC = () => {
    const { addHistoryItem } = useAIHistory();
    const { playClick, playSuccess, playError, playBriefing, stopBriefing, isBriefingActive } = useSound();
    
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [lecture, setLecture] = useState<GeneratedLecture | null>(null);
    const [localIsNarrating, setLocalIsNarrating] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!isBriefingActive) {
            setLocalIsNarrating(false);
            setStatus(null);
        }
    }, [isBriefingActive]);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        
        setIsGenerating(true);
        setLecture(null);
        stopBriefing();
        playClick();
        setStatus("HARVESTING_ARCHIVES...");

        const prompt = `
            Act as "Commander Harvey", an elite ultrasound physics mentor. 
            Generate a high-fidelity "brain meal-prep" lecture for the subject: "${topic}".
            
            YOU MUST ADHERE TO THIS STRUCTURE IN THE TEXT:
            1. QUANTIFY EFFORT: How many complex sources were aggregated?
            2. ACTIVE LEARNING PROMISE: Warn them an assessment follows.
            3. ROADMAP: Definitions, Concepts, Practical, Insight.
            4. DEFINE BY CONTRAST: What "${topic}" is NOT.
            5. SILLY MNEMONICS: Invent an acronym.
            6. ANALOGY: Use pop culture or behavior.
            7. PRACTICAL WORKFLOW: Concrete clinical steps.
            8. BEHAVIORAL MINDSET: Focus on systems vs goals.
            9. FINAL ASSESSMENT: Diagnostic questions.
            
            CRITICAL DIRECTIVE: 
            - ENSURE all text values in the JSON output are fluid, natural sentences.
            - DO NOT include headers like "Step 1", "Section A", or "Point 3" in the text fields.
            - JUST TALK. The user will hear this as speech.
            
            Output strictly in JSON.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            quantifiedEffort: { type: Type.STRING },
                            subject: { type: Type.STRING },
                            roadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
                            sections: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        phase: { type: Type.STRING },
                                        title: { type: Type.STRING },
                                        content: { type: Type.STRING },
                                        contrast: { type: Type.STRING },
                                        mnemonic: { type: Type.STRING },
                                        analogy: { type: Type.STRING }
                                    },
                                    required: ['phase', 'title', 'content', 'contrast', 'mnemonic', 'analogy']
                                }
                            },
                            behavioralMindset: { type: Type.STRING },
                            finalAssessment: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['quantifiedEffort', 'subject', 'roadmap', 'sections', 'behavioralMindset', 'finalAssessment']
                    }
                }
            });

            const data: GeneratedLecture = JSON.parse(response.text);
            setLecture(data);
            addHistoryItem({
                type: 'aiLecture',
                content: data,
                context: `High-Fidelity Academy: ${data.subject}`
            });
            playSuccess();
            
            // Build the conversational narration string (no numbers/labels)
            const fullLectureText = `
                Briefing initiated. 
                ${data.quantifiedEffort}. 
                Before we begin, remember that passive watching is a trap; a diagnostic assessment follows this transmission.
                We will move from core definitions into mechanical concepts, then practical clinical application, before concluding with a major insight.
                ${data.sections.map(s => `
                    Let's discuss ${s.title}. 
                    To understand this, first realize what it is not: ${s.contrast}.
                    In actuality, ${s.content}.
                    Think of it like this: ${s.analogy}.
                    Use the mnemonic ${s.mnemonic} to lock this node into your long-term buffer.
                `).join(' ')}
                On a behavioral level, ${data.behavioralMindset}.
                Prepare for final synchronization.
            `;
            
            handleNarrate(data.subject, fullLectureText);

        } catch (err) {
            playError();
            setStatus("SIGNAL_LOSS");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNarrate = async (subject: string, text: string) => {
        if (localIsNarrating) {
            stopBriefing();
            return;
        }
        setLocalIsNarrating(true);
        setStatus("NEURAL_SYNCING...");
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: text,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                setStatus("UPLINK_ESTABLISHED...");
                await playBriefing(base64Audio);
                setLocalIsNarrating(false);
                setStatus(null);
            }
        } catch (err) {
            setLocalIsNarrating(false);
            setStatus(null);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in max-w-6xl mx-auto py-8 font-mono">
            <section className="bg-[#050505] border-2 border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <BrainIcon className="w-64 h-64" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_red]" />
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Tactical_Academy_V5</h2>
                    </div>
                    <p className="text-white/40 text-xs mb-8 uppercase tracking-[0.4em]">Initialize high-fidelity neural briefing</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                            placeholder="e.g. Axial Resolution vs. SPL"
                            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-5 text-white focus:border-[var(--gold)]/50 focus:outline-none transition-all uppercase text-sm tracking-widest"
                            disabled={isGenerating}
                        />
                        <ControlButton onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="h-16 px-12 bg-red-600 hover:bg-red-500 text-white border-none text-xs font-black">
                            {isGenerating ? "EXTRACTING..." : "DEPLOY_HARVEY"}
                        </ControlButton>
                    </div>
                </div>
            </section>

            <AnimatePresence mode="wait">
                {lecture && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
                        <div className="bg-white/[0.02] border border-[var(--gold)]/30 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent pointer-events-none" />
                            <div className="shrink-0 relative">
                                <div className="w-40 h-40 rounded-3xl bg-black border-2 border-[var(--gold)]/40 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                                    <BrainIcon className="w-20 h-20 text-[var(--gold)]" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-red-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg">COMMANDER_HARVEY</div>
                            </div>
                            <div className="flex-grow space-y-6 text-center md:text-left">
                                <div className="space-y-2">
                                    <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic">{lecture.subject}</h3>
                                    <p className="text-[var(--gold)] font-bold text-sm tracking-widest">[{lecture.quantifiedEffort}]</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    {lecture.roadmap.map((step, i) => (
                                        <span key={i} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white/40 uppercase tracking-widest">
                                            {step}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {lecture.sections.map((section, idx) => (
                                <div key={idx} className="bg-[#08080a] border border-white/5 rounded-[3.5rem] overflow-hidden group hover:border-[var(--gold)]/20 transition-all duration-700 shadow-2xl">
                                    <div className="p-12 flex flex-col lg:flex-row gap-16">
                                        <div className="flex-grow space-y-8">
                                            <div className="flex items-center gap-6">
                                                <span className="text-6xl font-black text-white/5 italic">0{idx+1}</span>
                                                <h4 className="text-3xl font-black text-white uppercase tracking-tight">{section.title}</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem]">
                                                    <h5 className="text-[9px] font-black text-red-400 uppercase tracking-[0.4em] mb-4">Tactical_Contrast: NOT</h5>
                                                    <p className="text-sm text-white/60 leading-relaxed italic">"{section.contrast}"</p>
                                                </div>
                                                <div className="p-8 bg-[var(--gold)]/5 border border-[var(--gold)]/10 rounded-[2.5rem]">
                                                    <h5 className="text-[9px] font-black text-[var(--gold)] uppercase tracking-[0.4em] mb-4">Neural_Anchor: MNEMONIC</h5>
                                                    <p className="text-xl font-black text-white tracking-tighter uppercase">{section.mnemonic}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em]">Intelligence_Payload</h5>
                                                <p className="text-xl text-white/80 leading-relaxed font-light">{section.content}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="lg:w-96 shrink-0 flex flex-col gap-8">
                                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 h-full flex flex-col justify-center relative overflow-hidden group/analogy">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/40" />
                                                <h5 className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">Cognitive_Analogy</h5>
                                                <p className="text-sm text-white/50 italic leading-relaxed group-hover/analogy:text-white/80 transition-colors">"{section.analogy}"</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="bg-gradient-to-br from-indigo-900/20 to-black p-12 rounded-[3.5rem] border border-white/10 relative overflow-hidden">
                                <div className="absolute top-6 right-8"><TargetIcon className="w-12 h-12 text-indigo-400/20" /></div>
                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Behavioral_Vector</h4>
                                <p className="text-lg text-white/60 font-light italic leading-relaxed">"{lecture.behavioralMindset}"</p>
                                <div className="mt-8 pt-8 border-t border-white/5 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                                    [ SYSTEMS {'>'} GOALS ]
                                </div>
                            </div>

                            <div className="bg-[var(--gold)]/10 p-12 rounded-[3.5rem] border border-[var(--gold)]/30">
                                <h4 className="text-2xl font-black text-[var(--gold)] uppercase tracking-tighter mb-8 flex items-center gap-4">
                                    <CheckCircleIcon className="w-8 h-8" /> Final_Assessment
                                </h4>
                                <div className="space-y-4">
                                    {lecture.finalAssessment.map((q, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 bg-black/40 rounded-2xl border border-white/5 group/q cursor-help">
                                            <span className="text-[var(--gold)] font-mono font-bold">0{i+1}</span>
                                            <p className="text-sm text-white/70 group-hover:text-white transition-colors">{q}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-8 text-[9px] font-black text-white/20 uppercase text-center tracking-[0.3em]">Verify synchronization via manual input</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AILectureDemo;