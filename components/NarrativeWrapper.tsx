
import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';

interface NarrativeWrapperProps {
    children: React.ReactNode;
    text: string;
    title?: string;
    className?: string;
}

const NarrativeWrapper: React.FC<NarrativeWrapperProps> = ({ children, text, title, className = "" }) => {
    const { narrateText, isBriefingActive, briefingStatus } = useSound();

    return (
        <div className={`group/narrative relative ${className}`}>
            <button 
                onClick={() => narrateText(text, title)}
                className={`absolute -left-10 top-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 opacity-0 group-hover/narrative:opacity-100 hover:scale-110 active:scale-95 z-20 ${
                    isBriefingActive 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-[var(--gold)]/40 hover:text-[var(--gold)]'
                }`}
                title="Neural Narration"
            >
                {isBriefingActive ? (
                    <div className="w-2 h-2 bg-red-400 rounded-sm animate-pulse" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                )}
            </button>
            <div className={`transition-all duration-300 ${isBriefingActive ? 'text-white' : ''}`}>
                {children}
            </div>
            {isBriefingActive && (
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-30 origin-left"
                />
            )}
        </div>
    );
};

export default NarrativeWrapper;
