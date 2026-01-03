
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, DemoId, SRSCard, AIFlashcard } from '../types';
import ControlButton from './demos/ControlButton';
import { PRE_GENERATED_FLASHCARDS } from '../flashcard-data';
import { BrainIcon, ChevronRightIcon, CardStackIcon, SparklesIcon } from './Icons';

interface FlashcardSummaryProps {
    userProfile: UserProfile | null;
    onModuleClick: (moduleId: DemoId) => void;
}

const isUserCard = (card: any): card is SRSCard => {
    return (card as SRSCard).level !== undefined;
};

const MasteryDots: React.FC<{ level: number }> = ({ level }) => (
    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md" title={`Mastery Level: ${level}/5`}>
        {[1, 2, 3, 4, 5].map(i => (
            <div 
                key={i} 
                className={`w-1 h-1 rounded-full transition-all duration-500 ${
                    i <= level 
                        ? 'bg-[var(--gold)] shadow-[0_0_8px_var(--gold)] scale-125' 
                        : 'bg-white/10 scale-100'
                }`} 
            />
        ))}
    </div>
);

const CardCorners = () => (
    <div className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500">
        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[var(--gold)]" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[var(--gold)]" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[var(--gold)]" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[var(--gold)]" />
    </div>
);

const FlashcardSummary: React.FC<FlashcardSummaryProps> = ({ userProfile, onModuleClick }) => {
    const DECK_ID = 'spi_study_guide';
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardIndex, setCardIndex] = useState(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const { displayQueue, dueCount, totalCount, hasUserDeck } = useMemo(() => {
        const userDeck = userProfile?.flashcardDecks?.[DECK_ID] || [];
        const now = Date.now();
        const dueCards = userDeck.filter(card => card.nextReview <= now);
        
        let queue: (SRSCard | AIFlashcard)[] = [];

        if (userDeck.length > 0) {
            const sortedDue = [...dueCards].sort((a, b) => a.nextReview - b.nextReview);
            queue = [...sortedDue];
            if (queue.length < 5) {
                const others = userDeck.filter(c => !dueCards.includes(c));
                const shuffled = [...others].sort(() => 0.5 - Math.random());
                queue = [...queue, ...shuffled.slice(0, 5 - queue.length)];
            }
        } else {
            const shuffled = [...PRE_GENERATED_FLASHCARDS].sort(() => 0.5 - Math.random());
            queue = shuffled.slice(0, 10);
        }

        return {
            displayQueue: queue,
            dueCount: dueCards.length,
            totalCount: userDeck.length,
            hasUserDeck: userDeck.length > 0
        };
    }, [userProfile]);

    const activeCard = displayQueue[cardIndex % displayQueue.length];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCardIndex(prev => (prev + 1) % displayQueue.length), 150);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped(false);
        setTimeout(() => setCardIndex(prev => (prev - 1 + displayQueue.length) % displayQueue.length), 150);
    };

    if (!isClient || !activeCard) return null;

    return (
        <div className="bg-[#0f0f0f]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group shadow-2xl">
            {/* Ambient Background Glow */}
            <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] transition-colors duration-1000 pointer-events-none ${dueCount > 0 ? 'bg-red-500/10' : 'bg-[var(--gold)]/5'}`}></div>

            {/* Header Area */}
            <div className="flex justify-between items-center mb-6 relative z-10 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-[var(--gold)] shadow-inner group-hover:scale-110 transition-transform">
                        <CardStackIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Memory Bank</h2>
                        <span className="text-[8px] text-white/30 font-mono block mt-0.5 tracking-widest">
                            {hasUserDeck ? 'LOCAL_ACCESS_GRANTED' : 'GUEST_ARCHIVE_PREVIEW'}
                        </span>
                    </div>
                </div>
                {dueCount > 0 ? (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] font-black text-red-400 tracking-tighter">{dueCount} OVERDUE</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20">
                        <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
                        <span className="text-[9px] font-mono text-green-500/70 uppercase tracking-widest">Buffer Clear</span>
                    </div>
                )}
            </div>

            {/* Card Content Area */}
            <div className="flex-grow relative z-10 perspective-[2000px] mb-6 flex flex-col justify-center items-center px-4">
                
                {/* Visual Stack Decoration */}
                <div className="absolute top-2 left-6 right-6 bottom-[-8px] bg-[#1a1a1a] rounded-2xl transform scale-[0.96] translate-y-1 z-0 border border-white/5 opacity-50" />
                
                {/* Main Interactive Card */}
                <div 
                    className="w-full h-80 relative cursor-pointer z-20 group/card transition-all duration-500"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <motion.div
                        className="w-full h-full relative preserve-3d"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.7, type: 'spring', stiffness: 220, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* FRONT FACE: DATA RETRIEVAL */}
                        <div 
                            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-between shadow-2xl backface-hidden bg-[#0d0d0d] border border-white/10 overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {/* Technical Overlays */}
                            <CardCorners />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--gold-dim),_transparent_75%)] opacity-30 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay"></div>
                            
                            {/* Scanning Animation */}
                            <motion.div 
                                className="absolute left-0 right-0 h-[1px] bg-[var(--gold)]/30 z-10 shadow-[0_0_10px_var(--gold)]"
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Top Metadata */}
                            <div className="w-full p-4 flex justify-between items-center relative z-20">
                                {isUserCard(activeCard) ? <MasteryDots level={activeCard.level} /> : <div className="w-2 h-2 bg-white/10 rounded-full" />}
                                <div className="text-[8px] font-mono text-[var(--gold)]/80 tracking-[0.2em] bg-black/40 px-2 py-1 rounded border border-white/5 shadow-inner">
                                    NODE_{String(cardIndex + 1).padStart(3, '0')} // SRC:SPI_DATA
                                </div>
                            </div>

                            {/* Main Subject */}
                            <div className="flex-grow flex flex-col items-center justify-center w-full px-8 relative z-20 text-center">
                                {activeCard.frontImage ? (
                                    <div className="mb-6 relative group/img w-full max-w-[180px] p-2 bg-black/60 rounded-xl border border-white/5 shadow-2xl transition-transform duration-500 group-hover/card:scale-105">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)]/10 to-transparent rounded-xl blur opacity-20"></div>
                                        <img src={activeCard.frontImage} alt="Visual" className="w-full h-24 object-contain brightness-90 contrast-125" />
                                        <div className="absolute bottom-1 right-2 text-[6px] font-mono text-white/20 uppercase">RENDER_001</div>
                                    </div>
                                ) : (
                                    <div className="mb-6 text-[var(--gold)]/20 animate-pulse">
                                        <BrainIcon className="w-16 h-16" />
                                    </div>
                                )}
                                
                                <p className="text-[9px] text-[var(--gold)] uppercase tracking-[0.4em] font-black mb-4 opacity-50">Active Subject</p>
                                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight px-2 group-hover/card:text-[var(--gold-light)] transition-colors">
                                    {activeCard.term}
                                </h3>
                            </div>
                            
                            {/* Interaction Hint */}
                            <div className="w-full p-5 relative z-20 border-t border-white/5 bg-black/20">
                                <div className="text-[8px] text-white/30 font-mono uppercase tracking-[0.25em] flex items-center justify-center gap-3">
                                    <span className="w-8 h-[1px] bg-white/10" />
                                    <span className="animate-pulse">ENGAGE TO ANALYZE</span>
                                    <span className="w-8 h-[1px] bg-white/10" />
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE: ANALYSIS DATA */}
                        <div 
                            className="absolute inset-0 rounded-2xl flex flex-col items-center shadow-2xl backface-hidden bg-[#050505] border border-[var(--gold)]/30 overflow-hidden"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <CardCorners />
                            {/* Internal Grid texture */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
                            
                            <div className="w-full p-4 border-b border-white/10 bg-white/[0.03] flex justify-between items-center">
                                <p className="text-[8px] text-[var(--gold)] uppercase tracking-[0.4em] font-black">Analysis Data</p>
                                <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse shadow-[0_0_5px_var(--gold)]" />
                            </div>
                            
                            <div className="flex-grow w-full overflow-y-auto p-8 flex flex-col items-center justify-center custom-scrollbar">
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm sm:text-base text-white/80 leading-relaxed font-light text-center max-w-[280px]"
                                >
                                    {activeCard.definition}
                                </motion.p>
                                
                                {activeCard.backImage && (
                                     <div className="mt-6 w-full max-w-[200px] p-3 bg-black/60 rounded-xl border border-white/5 shadow-inner">
                                        <img src={activeCard.backImage} alt="Visual" className="w-full h-24 object-contain brightness-90" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full p-4 text-[7px] font-mono text-white/20 text-center uppercase tracking-widest">
                                ARCHIVE_REF: {activeCard.term.substring(0, 10).replace(/\s/g, '_').toUpperCase()}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Lateral Nav Controls */}
                <div className="absolute top-1/2 left-[-10px] right-[-10px] -translate-y-1/2 flex justify-between z-30 pointer-events-none">
                    <button 
                        onClick={handlePrev}
                        className="pointer-events-auto w-10 h-10 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-[var(--gold)] hover:border-[var(--gold)]/50 flex items-center justify-center transition-all shadow-xl hover:scale-110 backdrop-blur-md"
                    >
                        <ChevronRightIcon className="w-5 h-5 rotate-180" />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="pointer-events-auto w-10 h-10 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-[var(--gold)] hover:border-[var(--gold)]/50 flex items-center justify-center transition-all shadow-xl hover:scale-110 backdrop-blur-md"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tactical Action Area */}
            <div className="relative z-10 mt-auto flex-shrink-0 flex gap-2">
                <ControlButton 
                    onClick={() => onModuleClick('study_guide')} 
                    fullWidth
                    secondary
                    className={dueCount > 0 
                        ? "border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10" 
                        : "border-white/5 bg-white/5 hover:border-[var(--gold)]/20 hover:text-[var(--gold)]"}
                >
                    <div className="flex items-center justify-center gap-3 py-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {hasUserDeck ? "Start Training Session" : "Deploy Study Core"}
                        </span>
                        <BrainIcon className="w-4 h-4 opacity-50" />
                    </div>
                </ControlButton>
            </div>
        </div>
    );
};

export default FlashcardSummary;
