
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Modality } from '@google/genai';
import { spiCoursesExpanded } from '../../spi-course-data';
import { ChevronRightIcon, BrainIcon, SparklesIcon, CardStackIcon, ListBulletIcon, TargetIcon, CheckCircleIcon } from '../Icons';
import ControlButton from './ControlButton';
import { AIStudyPlan, AIFlashcard } from '../../types';
import ConceptCheck from './ConceptCheck';
import { useAIHistory } from '../../contexts/AIHistoryContext';
import { useUser } from '../../contexts/UserContext';
import { PRE_GENERATED_FLASHCARDS } from '../../flashcard-data';
import DemoSection from './DemoSection';
import FlashcardTraining from '../FlashcardTraining';
import FlashcardLibrary from '../FlashcardLibrary';
import { decode, decodeAudioData } from '../../utils/audio';

type Tab = 'Archives' | 'Database' | 'Training' | 'Assessment';

// Global Audio Management for Study Guide
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
const NARRATION_CACHE_KEY_PREFIX = 'echoMastersStudyGuideNarration_v1';

const BriefingIcon = ({ isActive }: { isActive: boolean }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 transition-all ${isActive ? 'text-red-400' : 'text-[var(--gold)]'}`}>
            {isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            )}
        </svg>
        {isActive && <motion.div animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-400 rounded-full blur-md" />}
    </div>
);

// --- Sub-Component: Briefing Button ---
const TopicBriefingButton: React.FC<{ title: string, content: string, objectives: string[] }> = ({ title, content, objectives }) => {
    const [isNarrating, setIsNarrating] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleBriefing = async () => {
        if (isNarrating) {
            if (currentSource) {
                currentSource.stop();
                currentSource.onended = null;
            }
            currentSource = null;
            setIsNarrating(false);
            setStatus(null);
            return;
        }

        setIsNarrating(true);
        setStatus("CONNECTING...");

        const playAudio = async (base64Audio: string) => {
            if (!audioContext || audioContext.state === 'closed') {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if(audioContext.state === 'suspended') await audioContext.resume();

            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();

            currentSource = source;
            source.onended = () => {
                if (currentSource === source) {
                    setIsNarrating(false);
                    currentSource = null;
                    setStatus(null);
                }
            };
        };
        
        try {
            if (currentSource) {
                currentSource.stop();
                currentSource.onended = null;
            }
            
            const sanitizeKey = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '_');
            const cacheKey = `${NARRATION_CACHE_KEY_PREFIX}_${sanitizeKey(title)}`;
            const cachedAudio = localStorage.getItem(cacheKey);

            if (cachedAudio) {
                setStatus("PLAYING...");
                await playAudio(cachedAudio);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const briefingPrompt = `
              Act as "Mission Commander Echo", an elite ultrasound physics instructor.
              Provide a high-fidelity tactical briefing for the topic: "${title}".
              Context: ${content}
              Key Objectives: ${objectives.join(', ')}

              Keep the briefing under 120 words. Focus on the core physics mechanism and its clinical significance.
              Tone: Professional, intense, encouraging.
              Format: Plain text.
            `;

            const textResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: briefingPrompt,
            });

            const audioResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: textResponse.text,
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                },
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
                try {
                    localStorage.setItem(cacheKey, base64Audio);
                } catch (storageError) {
                    console.warn("Briefing cache failed: LocalStorage quota exceeded.");
                }
                setStatus("PLAYING...");
                await playAudio(base64Audio);
            }
        } catch (err) {
            console.error("Study Guide Narration failed:", err);
            setIsNarrating(false);
            setStatus(null);
        }
    };

    return (
        <button 
            onClick={(e) => { e.stopPropagation(); handleBriefing(); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                isNarrating 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 ring-1 ring-red-500/20' 
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white hover:border-[var(--gold)]/40'
            }`}
            aria-label={isNarrating ? "Stop briefing" : "Play briefing"}
        >
            <BriefingIcon isActive={isNarrating} />
            <span className="min-w-[60px] text-left">{status || 'BRIEFING'}</span>
        </button>
    );
};

// --- Sub-Component: Chapter Card ---
const ChapterCard: React.FC<{ module: any, index: number, isExpanded: boolean, onToggle: () => void }> = ({ module, index, isExpanded, onToggle }) => {
    return (
        <div className={`transition-all duration-500 border rounded-2xl overflow-hidden ${isExpanded ? 'border-[var(--gold)]/50 bg-white/5 ring-1 ring-[var(--gold)]/20 shadow-[0_0_40px_rgba(0,0,0,0.4)]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'}`}>
            <button 
                onClick={onToggle}
                className="w-full p-5 flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg transition-colors ${isExpanded ? 'bg-[var(--gold)] text-black' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                        <h4 className={`font-bold transition-colors ${isExpanded ? 'text-[var(--gold)]' : 'text-white/90'}`}>{module.title}</h4>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{module.topics.length} CORE NODES</p>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'rotate-90 bg-[var(--gold)]/20 text-[var(--gold)]' : 'text-white/20'}`}>
                    <ChevronRightIcon className="w-5 h-5" />
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5 pt-0 border-t border-white/5">
                            <div className="py-4 space-y-2">
                                {module.topics.map((topic: any) => (
                                    <TopicNode key={topic.id} topic={topic} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TopicNode: React.FC<{ topic: any }> = ({ topic }) => {
    const [isNodeOpen, setIsNodeOpen] = useState(false);
    
    // Extract plain text for narration
    const plainTextContent = useMemo(() => {
        if (typeof topic.content === 'string') return topic.content;
        return "Diagnostic intelligence node active. Access content for detailed analysis.";
    }, [topic.content]);

    return (
        <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsNodeOpen(!isNodeOpen)}>
                <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-sm font-semibold truncate ${isNodeOpen ? 'text-white' : 'text-white/70'}`}>{topic.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    {isNodeOpen && (
                        <TopicBriefingButton 
                            title={topic.title} 
                            content={plainTextContent} 
                            objectives={topic.keyPoints} 
                        />
                    )}
                    <span className={`text-[10px] font-mono transition-colors ${isNodeOpen ? 'text-[var(--gold)]' : 'text-white/20'}`}>
                        {isNodeOpen ? '[ CLOSE ]' : '[ ACCESS ]'}
                    </span>
                </div>
            </div>
            <AnimatePresence>
                {isNodeOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-4 pt-0 space-y-4 border-t border-white/5">
                            <div className="text-sm text-white/60 leading-relaxed py-2">
                                {topic.content}
                            </div>
                            <div className="bg-[var(--gold)]/5 p-4 rounded-xl border border-[var(--gold)]/20">
                                <h5 className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TargetIcon className="w-3 h-3" /> Mission Directives
                                </h5>
                                <ul className="space-y-1.5">
                                    {topic.keyPoints.map((kp: string, i: number) => (
                                        <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 bg-[var(--gold)]/40 rounded-full shrink-0" />
                                            {kp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {topic.conceptCheck && <ConceptCheck {...topic.conceptCheck} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Sub-Component: Intelligence Archive (Glossary) ---
const IntelligenceArchive: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTerm, setSelectedTerm] = useState<AIFlashcard | null>(PRE_GENERATED_FLASHCARDS[0]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const filteredTerms = useMemo(() => {
        return PRE_GENERATED_FLASHCARDS
            .filter(card => 
                card.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                card.definition.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.term.localeCompare(b.term));
    }, [searchTerm]);

    const handleAIEnhance = async () => {
        if (!selectedTerm) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Act as an elite ultrasound clinical specialist. Enhance the following definition for a medical professional. Explain the clinical "why" and provide a practical tip for the machine knobology.
            TERM: ${selectedTerm.term}
            DEFINITION: ${selectedTerm.definition}`;
            
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            setAnalysis(response.text);
        } catch (e) {
            setAnalysis("Error retrieving neural expansion. Check uplink.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
            {/* Left: Directory */}
            <div className="lg:col-span-4 flex flex-col h-full bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Filter Database..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-[var(--gold)]/50 focus:outline-none transition-all pl-9"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {filteredTerms.map((term, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedTerm(term); setAnalysis(null); }}
                            className={`w-full p-4 text-left border-b border-white/5 transition-all flex items-center justify-between group ${selectedTerm?.term === term.term ? 'bg-[var(--gold)]/10' : 'hover:bg-white/5'}`}
                        >
                            <span className={`text-xs font-bold tracking-tight ${selectedTerm?.term === term.term ? 'text-[var(--gold)]' : 'text-white/60'}`}>{term.term}</span>
                            <ChevronRightIcon className={`w-3 h-3 transition-all ${selectedTerm?.term === term.term ? 'text-[var(--gold)] opacity-100 translate-x-1' : 'opacity-0'}`} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Data Viewer */}
            <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--gold-dim),_transparent_70%)] opacity-20" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
                
                <AnimatePresence mode="wait">
                    {selectedTerm ? (
                        <motion.div 
                            key={selectedTerm.term}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 relative z-10 flex flex-col h-full"
                        >
                            <header className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                                    <span className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-[0.4em]">Intelligence Core</span>
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tighter uppercase">{selectedTerm.term}</h3>
                            </header>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8 shadow-inner">
                                <p className="text-lg text-white/80 font-light leading-relaxed italic">"{selectedTerm.definition}"</p>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Enhanced Neural Analysis</h5>
                                    <button 
                                        onClick={handleAIEnhance}
                                        disabled={isAnalyzing}
                                        className="text-[10px] font-bold text-[var(--gold)] hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
                                    >
                                        <SparklesIcon className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                                        {isAnalyzing ? 'Expanding Link...' : 'Request AI Insights'}
                                    </button>
                                </div>
                                
                                <div className="min-h-[150px] bg-black/60 rounded-2xl border border-white/5 p-6 relative overflow-hidden">
                                    {analysis ? (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/70 leading-relaxed">
                                            {analysis}
                                        </motion.p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                            <BrainIcon className="w-12 h-12 mb-2" />
                                            <p className="text-xs">Awaiting EchoBot directive...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/20 italic">Select a subject from the archive.</div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Main Study Guide Component ---
const StudyGuideDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Archives');
    const [expandedModule, setExpandedModule] = useState<string | null>(spiCoursesExpanded.courses[0].modules[0].id);
    const { userProfile } = useUser();

    // Clean up audio on unmount
    useEffect(() => {
        return () => {
            if (currentSource) {
                currentSource.stop();
                currentSource = null;
            }
        };
    }, []);

    const progressPercent = useMemo(() => {
        const completed = userProfile?.completedModules.length || 0;
        return (completed / spiCoursesExpanded.courses[0].modules.length) * 100;
    }, [userProfile]);

    const renderTab = () => {
        switch (activeTab) {
            case 'Archives': 
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white px-2 flex items-center gap-3">
                                <ListBulletIcon className="w-5 h-5 text-[var(--gold)]" />
                                Physics Data Modules
                            </h3>
                            <div className="space-y-3">
                                {spiCoursesExpanded.courses[0].modules.map((module, i) => (
                                    <ChapterCard 
                                        key={module.id} 
                                        module={module} 
                                        index={i} 
                                        isExpanded={expandedModule === module.id}
                                        onToggle={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="sticky top-8 space-y-6">
                                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <TargetIcon className="w-32 h-32" />
                                    </div>
                                    <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Mastery Goal</h4>
                                    <p className="text-white/50 text-sm mb-6 font-light">Complete all core physics modules to synchronize your diagnostic intuition.</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-mono text-[var(--gold)]">
                                            <span>SYNCHRONIZATION</span>
                                            <span>{Math.round(progressPercent)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                                    <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Tactical Tip</h5>
                                    <p className="text-xs text-white/70 leading-relaxed italic">"Repetition is the motherboard of learning. Use the Memory Bank daily to reinforce neural pathways."</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'Database': return <IntelligenceArchive />;
            case 'Training': return <FlashcardTab />;
            case 'Assessment': return <StudyQuiz />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Mission Intelligence Navbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.03] border border-white/10 p-2 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {(['Archives', 'Database', 'Training', 'Assessment'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === tab 
                                    ? 'bg-white text-black shadow-lg' 
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab === 'Archives' && <ListBulletIcon className="w-4 h-4" />}
                            {tab === 'Database' && <SparklesIcon className="w-4 h-4" />}
                            {tab === 'Training' && <CardStackIcon className="w-4 h-4" />}
                            {tab === 'Assessment' && <BrainIcon className="w-4 h-4" />}
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono text-white/40 uppercase tracking-widest hidden lg:block">
                    Status: <span className="text-green-500 animate-pulse">Encryption Active</span>
                </div>
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderTab()}
            </motion.div>
        </div>
    );
};

// --- Reused Quiz Tab Component (Refined) ---
const StudyQuiz: React.FC = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const allQuestions = useMemo(() => {
        return spiCoursesExpanded.courses[0].modules.flatMap(m => m.quiz?.questions || []);
    }, []);

    const sessionQuestions = useMemo(() => {
        return [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [allQuestions]);

    const handleAnswer = (answer: string) => {
        if (showResult) return;
        setSelectedAnswer(answer);
        setShowResult(true);
        if (answer === sessionQuestions[currentQuestionIndex].correctAnswer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < sessionQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            alert(`Simulation Finished. Score: ${score}/${sessionQuestions.length}`);
            setCurrentQuestionIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const currentQuestion = sessionQuestions[currentQuestionIndex];
    if (!currentQuestion) return <div>No diagnostic nodes available.</div>;

    return (
        <div className="bg-gray-800/50 p-8 rounded-3xl border border-white/10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Rapid Assessment</h3>
                <span className="text-[10px] font-mono bg-white/10 px-3 py-1 rounded-full text-white/60">{currentQuestionIndex + 1} / {sessionQuestions.length}</span>
            </div>
            
            <p className="text-2xl font-bold text-white mb-10 leading-tight tracking-tight text-center">{currentQuestion.questionText}</p>
            
            <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedAnswer;
                    let bgClass = "bg-white/5 hover:bg-white/10 border-white/10";
                    
                    if (showResult) {
                        if (isCorrect) bgClass = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                        else if (isSelected) bgClass = "bg-red-500/20 border-red-500 text-red-300";
                        else bgClass = "bg-white/5 opacity-30 border-transparent";
                    } else if (isSelected) {
                        bgClass = "bg-[var(--gold)]/10 border-[var(--gold)] text-white";
                    }

                    return (
                        <button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={showResult}
                            className={`w-full p-5 rounded-2xl text-center font-bold border-2 transition-all duration-300 ${bgClass}`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {showResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 pt-6 border-t border-white/5"
                    >
                        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 mb-6">
                            <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest mb-2">Neural Logic</p>
                            <p className="text-sm text-white/70 leading-relaxed">{currentQuestion.explanation}</p>
                        </div>
                        <ControlButton onClick={handleNext} fullWidth>
                            {currentQuestionIndex < sessionQuestions.length - 1 ? 'NEXT SUBJECT' : 'FINALIZE ASSESSMENT'}
                        </ControlButton>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FlashcardTab: React.FC = () => {
    const [mode, setMode] = useState<'intro' | 'training' | 'library'>('intro');

    return (
        <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
                {mode === 'intro' && (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="text-center py-16 px-6 bg-white/[0.02] border border-white/5 rounded-[3rem]"
                    >
                        <div className="mb-10 relative inline-block">
                            <div className="absolute inset-0 bg-[var(--gold)]/20 blur-3xl rounded-full scale-150 animate-pulse" />
                            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl">
                                <CardStackIcon className="w-12 h-12 text-[var(--gold)]" />
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Memory Bank</h3>
                        <p className="text-white/50 max-w-lg mx-auto mb-12 leading-relaxed font-light text-lg">
                            Engage the Spaced Repetition System (SRS) to permanently encode ultrasound physics nodes into your long-term memory.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <ControlButton onClick={() => setMode('training')} className="px-10 h-14 text-base">
                                <span className="flex items-center gap-2">START TRAINING <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" /></span>
                            </ControlButton>
                            <ControlButton onClick={() => setMode('library')} secondary className="px-10 h-14 text-base">
                                BROWSE ARCHIVES
                            </ControlButton>
                        </div>
                    </motion.div>
                )}

                {mode === 'training' && (
                    <motion.div key="training" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <FlashcardTraining onComplete={() => setMode('intro')} />
                    </motion.div>
                )}

                {mode === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                                <ListBulletIcon className="w-7 h-7 text-[var(--gold)]" />
                                <span>Library</span>
                            </h3>
                            <button 
                                onClick={() => setMode('intro')}
                                className="text-[10px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-[0.3em]"
                            >
                                [ TERMINATE_ACCESS ]
                            </button>
                        </div>
                        <FlashcardLibrary onStartTraining={() => setMode('training')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StudyGuideDemo;
