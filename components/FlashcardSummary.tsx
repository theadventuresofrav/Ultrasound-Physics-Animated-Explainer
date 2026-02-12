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
    <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-2 py-0.5 sm:py-1 rounded-full border border-white/5 backdrop-blur-md" title={`Mastery Level: ${level}/5`}>
        {[1, 2, 3, 4, 5].map(i => (
            <div 
                key={i} 
                className={`w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full transition-all duration-500 ${
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
        <div className="absolute top-2 left-2 w-2 h-2 sm:w-3 sm:h-3 border-t border-l border-[var(--gold)]" />
        <div className="absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 border-t border-r border-[var(--gold)]" />
        <div className="absolute bottom-2 left-2 w-2 h-2 sm:w-3 sm:h-3 border-b border-l border-[var(--gold)]" />
        <div className="absolute bottom-2 right-2 w-2 h-2 sm:w-3 sm:h-3 border-b border-r border-[var(--gold)]" />
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
        <div className="bg-[#0f0f0f]/80 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 h-full flex flex-col relative overflow-hidden group shadow-2xl">
            {/* Ambient Background Glow */}
            <div className={`absolute -top-20 -right-20 w-60 sm:w-80 h-60 sm:h-80 rounded-full blur-[100px] transition-colors duration-1000 pointer-events-none ${dueCount > 0 ? 'bg-red-500/10' : 'bg-[var(--gold)]/5'}`}></div>

            {/* Header Area */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 relative z-10 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--gold)] shadow-inner">
                        <CardStackIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h2 className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-[0.2em]">Memory Bank</h2>
                        <span className="text-[7px] sm:text-[8px] text-white/30 font-mono block tracking-widest">
                            {hasUserDeck ? 'LOCAL_SYNC' : 'GUEST_MODE'}
                        </span>
                    </div>
                </div>
                {dueCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                        <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-[9px] font-black text-red-400 tracking-tighter">{dueCount} DUE</span>
                    </div>
                )}
            </div>

            {/* Card Content Area */}
            <div className="flex-grow relative z-10 perspective-[2000px] mb-4 sm:mb-6 flex flex-col justify-center items-center">
                
                {/* Visual Stack Decoration */}
                <div className="absolute top-2 left-4 right-4 bottom-[-6px] bg-[#1a1a1a] rounded-2xl transform scale-[0.96] translate-y-1 z-0 border border-white/5 opacity-50" />
                
                {/* Main Interactive Card */}
                <div 
                    className="w-full h-64 sm:h-80 relative cursor-pointer z-20 group/card transition-all duration-500"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <motion.div
                        className="w-full h-full relative preserve-3d"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.7, type: 'spring', stiffness: 220, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* FRONT FACE */}
                        <div 
                            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-between shadow-2xl backface-hidden bg-[#0d0d0d] border border-white/10 overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <CardCorners />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--gold-dim),_transparent_75%)] opacity-30 pointer-events-none"></div>
                            
                            <motion.div 
                                className="absolute left-0 right-0 h-[1px] bg-[var(--gold)]/20 z-10 shadow-[0_0_10px_var(--gold)]"
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="w-full p-3 sm:p-4 flex justify-between items-center relative z-20">
                                {isUserCard(activeCard) ? <MasteryDots level={activeCard.level} /> : <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />}
                                <div className="text-[7px] font-mono text-[var(--gold)] uppercase tracking-[0.2em] bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                    NODE_{String(cardIndex + 1).padStart(3, '0')}
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center w-full px-6 relative z-20 text-center">
                                {activeCard.frontImage ? (
                                    <div className="mb-4 sm:mb-6 p-1.5 sm:p-2 bg-black/60 rounded-xl border border-white/5 shadow-2xl">
                                        <img src={activeCard.frontImage} alt="Visual" className="w-32 sm:w-48 h-20 sm:h-24 object-contain brightness-90 contrast-125" />
                                    </div>
                                ) : (
                                    <div className="mb-4 sm:mb-6 text-[var(--gold)]/20">
                                        <BrainIcon className="w-12 h-12 sm:w-16 sm:h-16" />
                                    </div>
                                )}
                                
                                <p className="text-[8px] text-[var(--gold)] uppercase tracking-[0.4em] font-black mb-2 opacity-50 italic">Subject</p>
                                <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight tracking-tight px-1">
                                    {activeCard.term}
                                </h3>
                            </div>
                            
                            <div className="w-full p-3 sm:p-5 relative z-20 border-t border-white/5 bg-black/20">
                                <div className="text-[7px] sm:text-[8px] text-white/30 font-mono uppercase tracking-[0.25em] text-center italic animate-pulse">
                                    [ DECRYPT_SIGNAL ]
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE */}
                        <div 
                            className="absolute inset-0 rounded-2xl flex flex-col items-center shadow-2xl backface-hidden bg-[#050505] border border-[var(--gold)]/30 overflow-hidden"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <CardCorners />
                            <div className="w-full p-3 sm:p-4 border-b border-white/10 bg-white/[0.03] flex justify-between items-center">
                                <p className="text-[8px] text-[var(--gold)] uppercase tracking-[0.4em] font-black">Data_Result</p>
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                            </div>
                            
                            <div className="flex-grow w-full overflow-y-auto p-5 sm:p-8 flex flex-col items-center justify-center custom-scrollbar">
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs sm:text-base text-white/80 leading-relaxed font-light text-center"
                                >
                                    {activeCard.definition}
                                </motion.p>
                                
                                {activeCard.backImage && (
                                     <div className="mt-4 p-1.5 bg-black/60 rounded-xl border border-white/5">
                                        <img src={activeCard.backImage} alt="Visual" className="w-32 sm:w-40 h-16 sm:h-24 object-contain brightness-90" />
                                    </div>
                                )}
                            </div>

                            <div className="w-full p-3 text-[7px] font-mono text-white/10 text-center uppercase tracking-widest">
                                SRC: SPI_ARCHIVE
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Lateral Nav Controls */}
                <div className="absolute top-1/2 left-[-8px] right-[-8px] -translate-y-1/2 flex justify-between z-30 pointer-events-none">
                    <button 
                        onClick={handlePrev}
                        className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-[var(--gold)] flex items-center justify-center backdrop-blur-md"
                    >
                        <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black/60 border border-white/10 text-white/40 hover:text-[var(--gold)] flex items-center justify-center backdrop-blur-md"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tactical Action Area */}
            <div className="relative z-10 mt-auto flex-shrink-0">
                <ControlButton 
                    onClick={() => onModuleClick('study_guide')} 
                    fullWidth
                    secondary
                    className="h-10 sm:h-12 border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em]"
                >
                    [ Deploy Study Core ]
                </ControlButton>
            </div>
        </div>
    );
};

export default FlashcardSummary;