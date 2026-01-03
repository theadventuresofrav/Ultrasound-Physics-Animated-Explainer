
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SRSCard, AIFlashcard, UserProfile } from '../types';
import { useUser } from '../contexts/UserContext';
import { useSound } from '../contexts/SoundContext';
import ControlButton from './demos/ControlButton';
// FIX: Import missing TrophyIcon from Icons.
import { BrainIcon, CheckCircleIcon, SparklesIcon, CardStackIcon, TrophyIcon } from './Icons';
import { PRE_GENERATED_FLASHCARDS } from '../flashcard-data';

interface FlashcardTrainingProps {
    onComplete: () => void;
}

const DECK_ID = 'spi_study_guide';

const FlashcardTraining: React.FC<FlashcardTrainingProps> = ({ onComplete }) => {
    const { userProfile, updateCardPerformance, addFlashcardDeck } = useUser();
    const { playClick, playHover, playSuccess, playError } = useSound();
    
    const [isFlipped, setIsFlipped] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionComplete, setSessionComplete] = useState(false);

    // Initialize deck if empty
    useEffect(() => {
        const userDeck = userProfile?.flashcardDecks?.[DECK_ID] || [];
        if (userDeck.length === 0) {
            addFlashcardDeck(DECK_ID, PRE_GENERATED_FLASHCARDS);
        }
    }, [userProfile, addFlashcardDeck]);

    // Construct the session queue: Due cards first, then a few new ones
    const sessionQueue = useMemo(() => {
        const userDeck = userProfile?.flashcardDecks?.[DECK_ID] || [];
        const now = Date.now();
        
        const due = userDeck.filter(c => c.nextReview <= now);
        const newCards = userDeck.filter(c => c.level === 0 && c.lastReviewed === null);
        
        // Take up to 10 due cards and 5 new ones for a single session
        const queue = [...due.slice(0, 10), ...newCards.slice(0, 5)];
        
        // If still small, just take some from the rest to fill up to 10
        if (queue.length < 5 && userDeck.length > 0) {
            const others = userDeck.filter(c => !queue.find(q => q.id === c.id));
            queue.push(...others.slice(0, 10 - queue.length));
        }
        
        return queue;
    }, [userProfile]);

    const activeCard = sessionQueue[currentIndex];
    const progress = (currentIndex / sessionQueue.length) * 100;

    const handleFlip = () => {
        playClick();
        setIsFlipped(!isFlipped);
    };

    const handleFeedback = (isCorrect: boolean) => {
        if (isCorrect) playSuccess();
        else playError();

        updateCardPerformance(DECK_ID, activeCard.id, isCorrect);
        
        if (currentIndex < sessionQueue.length - 1) {
            setIsFlipped(false);
            // Slight delay for exit animation
            setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
        } else {
            setSessionComplete(true);
        }
    };

    if (sessionQueue.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Memory Bank Synchronized</h3>
                <p className="text-white/60 max-w-md mx-auto mb-8">All your current data nodes are stable. No reviews due at this time.</p>
                <ControlButton onClick={onComplete}>Return to Archives</ControlButton>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[var(--gold)]/20 blur-3xl rounded-full" />
                    <TrophyIcon className="w-24 h-24 text-[var(--gold)] relative z-10 drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">Connection Established</h3>
                <p className="text-white/70 max-w-sm mb-10 leading-relaxed font-light">
                    You've successfully processed <span className="text-[var(--gold)] font-bold">{sessionQueue.length} data nodes</span>. Your long-term memory buffer has been updated.
                </p>
                <div className="flex gap-4">
                    <ControlButton onClick={() => { setCurrentIndex(0); setSessionComplete(false); setIsFlipped(false); }}>Next Session</ControlButton>
                    <ControlButton onClick={onComplete} secondary>Exit Module</ControlButton>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-8">
            {/* Session Header */}
            <div className="flex justify-between items-end mb-8 px-2">
                <div>
                    <h3 className="text-xs font-bold text-[var(--gold)] uppercase tracking-[0.3em] mb-1">Neural Integration</h3>
                    <p className="text-lg font-black text-white tracking-tight">NODE {currentIndex + 1} / {sessionQueue.length}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Sync Progress</p>
                    <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Flashcard Area */}
            <div className="relative h-[450px] perspective-[2000px] mb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCard.id}
                        initial={{ opacity: 0, x: 50, rotateY: 10 }}
                        animate={{ opacity: 1, x: 0, rotateY: isFlipped ? 180 : 0 }}
                        exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
                        className="w-full h-full cursor-pointer relative preserve-3d"
                        onClick={handleFlip}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* FRONT FACE */}
                        <div 
                            className="absolute inset-0 bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl backface-hidden overflow-hidden"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--gold-dim),_transparent_70%)] opacity-30 pointer-events-none" />
                            <div className="absolute top-6 left-8 flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= activeCard.level ? 'bg-[var(--gold)] shadow-[0_0_5px_var(--gold)]' : 'bg-white/10'}`} />
                                ))}
                            </div>
                            <div className="absolute top-6 right-8 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">Data_Subject_ID: {activeCard.id.slice(-6)}</div>
                            
                            {activeCard.frontImage && (
                                <div className="mb-8 p-3 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                                    <img src={activeCard.frontImage} alt="Visual Aide" className="w-48 h-32 object-contain brightness-90 contrast-125" />
                                </div>
                            )}
                            
                            <h4 className="text-3xl font-black text-white leading-tight tracking-tight mb-4 px-4">
                                {activeCard.term}
                            </h4>
                            
                            <p className="text-[10px] font-mono text-[var(--gold)]/60 uppercase tracking-[0.4em] animate-pulse mt-8">
                                Click to access data
                            </p>
                        </div>

                        {/* BACK FACE */}
                        <div 
                            className="absolute inset-0 bg-[#050505] border border-[var(--gold)]/40 rounded-3xl p-8 flex flex-col shadow-2xl overflow-hidden"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                            
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 relative z-10">
                                <span className="text-[10px] font-mono text-[var(--gold)] uppercase tracking-widest font-bold">Encrypted Data Result</span>
                                <div className="w-2 h-2 rounded-full bg-[var(--gold)] animate-pulse" />
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center text-center relative z-10 overflow-y-auto px-2 custom-scrollbar">
                                <p className="text-lg sm:text-xl text-white/90 font-light leading-relaxed mb-6">
                                    {activeCard.definition}
                                </p>
                                
                                {activeCard.backImage && (
                                    <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                                        <img src={activeCard.backImage} alt="Analysis Result" className="w-40 h-24 object-contain" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-white/5 text-[8px] font-mono text-white/20 text-center uppercase tracking-[0.3em]">
                                Verification Source: SPI_CORE_ARCHIVE
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* SRS Controls */}
            <div className="flex flex-col items-center gap-6">
                <AnimatePresence>
                    {!isFlipped ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                             <ControlButton onClick={handleFlip} fullWidth className="w-64">Reveal Solution</ControlButton>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 w-full"
                        >
                            <button 
                                onClick={() => handleFeedback(false)}
                                className="flex-1 group py-4 px-6 bg-red-500/10 border border-red-500/30 rounded-2xl hover:bg-red-500/20 transition-all flex flex-col items-center gap-1"
                            >
                                <span className="text-xl">⚠️</span>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Forgot</span>
                                <span className="text-[8px] text-red-400/50 font-mono">Reset Buffer</span>
                            </button>
                            <button 
                                onClick={() => handleFeedback(true)}
                                className="flex-1 group py-4 px-6 bg-green-500/10 border border-green-500/30 rounded-2xl hover:bg-green-500/20 transition-all flex flex-col items-center gap-1"
                            >
                                <span className="text-xl">✓</span>
                                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Got it</span>
                                <span className="text-[8px] text-green-400/50 font-mono">Strengthen Link</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <button 
                    onClick={onComplete}
                    className="text-[10px] font-mono text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]"
                >
                    [ Terminate Session ]
                </button>
            </div>
        </div>
    );
};

export default FlashcardTraining;
