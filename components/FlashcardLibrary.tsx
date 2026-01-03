
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SRSCard, AIFlashcard, UserProfile } from '../types';
import { useUser } from '../contexts/UserContext';
import { PRE_GENERATED_FLASHCARDS } from '../flashcard-data';
import { ListBulletIcon, SparklesIcon, CheckCircleIcon } from './Icons';

interface FlashcardLibraryProps {
    onStartTraining: () => void;
}

const FlashcardLibrary: React.FC<FlashcardLibraryProps> = ({ onStartTraining }) => {
    const { userProfile } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');

    const DECK_ID = 'spi_study_guide';
    const userDeck = userProfile?.flashcardDecks?.[DECK_ID] || [];

    const filteredCards = useMemo(() => {
        // Use user deck or fall back to pre-generated
        let baseCards = userDeck.length > 0 ? [...userDeck] : PRE_GENERATED_FLASHCARDS.map((c, i) => ({
            ...c,
            id: `static-${i}`,
            level: 0,
            lastReviewed: null,
            nextReview: 0
        } as SRSCard));

        // Apply Global System Overrides if present
        const overrides = userProfile?.systemOverrides.flashcards;
        if (overrides && overrides.length > 0) {
            baseCards = baseCards.map((card, idx) => {
                const override = overrides[idx];
                if (!override) return card;
                return {
                    ...card,
                    term: override.term || card.term,
                    definition: override.definition || card.definition,
                    frontImage: override.frontImage || card.frontImage,
                    backImage: override.backImage || card.backImage
                };
            });
        }

        return baseCards.filter(card => {
            const matchesSearch = card.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               card.definition.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (filter === 'all') return matchesSearch;
            if (filter === 'new') return matchesSearch && card.level === 0 && !card.lastReviewed;
            if (filter === 'learning') return matchesSearch && card.level > 0 && card.level < 5;
            if (filter === 'mastered') return matchesSearch && card.level >= 5;
            
            return matchesSearch;
        }).sort((a, b) => a.term.localeCompare(b.term));
    }, [userDeck, searchTerm, filter, userProfile?.systemOverrides.flashcards]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="relative w-full md:w-64">
                    <input 
                        type="text"
                        placeholder="Search archives..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[var(--gold)]/50 focus:outline-none transition-all pl-10"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                    {(['all', 'new', 'learning', 'mastered'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-[var(--gold)] text-black' : 'text-white/40 hover:text-white/70'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCards.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-[var(--gold)]/30 hover:bg-white/[0.06] transition-all flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-1 h-1 rounded-full ${i <= (card.level || 0) ? 'bg-[var(--gold)]' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                                <span className="text-[8px] font-mono text-white/20 uppercase">#{idx + 1}</span>
                            </div>
                            
                            <h5 className="font-bold text-white text-sm mb-2 group-hover:text-[var(--gold)] transition-colors line-clamp-2">{card.term}</h5>
                            <p className="text-xs text-white/50 line-clamp-3 leading-relaxed mb-4 flex-grow">{card.definition}</p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                                    {card.level === 0 ? 'New Entry' : card.level === 5 ? 'Mastered' : `Level ${card.level}`}
                                </span>
                                {card.level === 5 && <CheckCircleIcon className="w-3 h-3 text-green-500" />}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCards.length === 0 && (
                <div className="py-20 text-center text-white/30 border border-dashed border-white/10 rounded-3xl">
                    <p className="text-sm italic">No matching data nodes found in the archives.</p>
                </div>
            )}
        </div>
    );
};

export default FlashcardLibrary;
