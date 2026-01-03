
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';

interface CinematicIntroProps {
    onComplete: () => void;
}

const BOOT_LOG = [
    "INITIALIZING ECHO KERNEL...",
    "LOADING PHYSICS ENGINE (V.4.2)...",
    "CALIBRATING PIEZOELECTRIC ELEMENTS...",
    "VERIFYING RESOLUTION [LARRD]...",
    "OPTIMIZING DYNAMIC RANGE...",
    "ESTABLISHING NEURAL LINK...",
    "SYSTEM NOMINAL.",
];

const NARRATIVE_LINES = [
    { text: "In the void of the body...", delay: 0 },
    { text: "Light cannot save you.", delay: 2.5 },
    { text: "Only sound can see.", delay: 5.0, highlight: true },
];

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
    const [stage, setStage] = useState<'boot' | 'narrative' | 'logo'>('boot');
    const [logIndex, setLogIndex] = useState(0);
    const { playTypewriter, playStartup, playSuccess, playClick } = useSound();

    useEffect(() => {
        const timer = setTimeout(() => {
            playStartup();
        }, 500);
        return () => clearTimeout(timer);
    }, [playStartup]);

    useEffect(() => {
        if (stage === 'boot') {
            if (logIndex < BOOT_LOG.length) {
                const timeout = setTimeout(() => {
                    playTypewriter();
                    setLogIndex(prev => prev + 1);
                }, 100 + Math.random() * 150);
                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => setStage('narrative'), 800);
            }
        }
    }, [logIndex, stage, playTypewriter]);

    useEffect(() => {
        if (stage === 'narrative') {
            const totalDuration = 7000;
            const timer = setTimeout(() => {
                setStage('logo');
                playSuccess();
            }, totalDuration);
            return () => clearTimeout(timer);
        }
    }, [stage, playSuccess]);

    useEffect(() => {
        if (stage === 'logo') {
            const timer = setTimeout(() => {
                onComplete();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [stage, onComplete]);

    const handleSkip = () => {
        playClick();
        onComplete();
    };

    return (
        <motion.div 
            className="fixed inset-0 z-[999] bg-[#010102] flex flex-col items-center justify-center overflow-hidden font-mono"
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
            transition={{ duration: 1.2 }}
        >
            {/* HUD Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none z-50 opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,black_100%)] pointer-events-none z-40" />

            <button 
                onClick={handleSkip}
                className="absolute bottom-12 text-[10px] text-white/20 hover:text-[var(--gold)] uppercase tracking-[0.4em] border border-white/5 px-6 py-2.5 rounded-full hover:bg-white/5 transition-all z-50 backdrop-blur-md"
            >
                [ Abort Boot Sequence ]
            </button>

            {/* STAGE 1: BOOT LOG */}
            <AnimatePresence>
                {stage === 'boot' && (
                    <motion.div 
                        className="w-full max-w-lg p-10 text-[11px] text-green-500/90 leading-relaxed bg-black/40 border border-white/5 rounded-2xl shadow-2xl"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2 opacity-50">
                            <span>System_Terminal v4.2.0</span>
                            <span className="animate-pulse">Active_Connection</span>
                        </div>
                        {BOOT_LOG.slice(0, logIndex).map((line, i) => (
                            <div key={i} className="mb-1.5 flex gap-4">
                                <span className="opacity-40 shrink-0">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                <span className="tracking-wide">{line}</span>
                            </div>
                        ))}
                        <motion.div 
                            className="w-2 h-4 bg-green-500 mt-3"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE 2: NARRATIVE */}
            <AnimatePresence>
                {stage === 'narrative' && (
                    <div className="relative z-10 text-center px-6">
                        {NARRATIVE_LINES.map((line, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ delay: line.delay * 0.4, duration: 1.2, ease: "easeOut" }}
                                className={`text-3xl sm:text-5xl md:text-6xl font-light tracking-tighter mb-8 leading-none ${line.highlight ? 'text-white font-black uppercase' : 'text-white/40 italic'}`}
                            >
                                {line.text}
                            </motion.p>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* STAGE 3: LOGO REVEAL */}
            <AnimatePresence>
                {stage === 'logo' && (
                    <motion.div 
                        className="relative z-20 flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, type: "spring", stiffness: 40 }}
                    >
                        <motion.div 
                            className="absolute inset-0 bg-[var(--gold)]/10 rounded-full blur-[120px]"
                            animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.5, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                        
                        <div className="flex items-center gap-6 mb-8">
                            <motion.div 
                                className="w-20 h-20 border border-[var(--gold)]/40 rounded-2xl flex items-center justify-center bg-black/80 shadow-[0_0_50px_rgba(212,175,55,0.2)] backdrop-blur-xl"
                                animate={{ rotate: [0, 180, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <svg width="48" height="48" viewBox="0 0 32 32" fill="none" className="text-[var(--gold)]">
                                    <path d="M2 16C2 16 6 6 10 16C14 26 18 6 22 16C26 26 30 16 30 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </motion.div>
                        </div>

                        <motion.h1 
                            className="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase text-center"
                            initial={{ letterSpacing: "0.5em", opacity: 0 }}
                            animate={{ letterSpacing: "-0.05em", opacity: 1 }}
                            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            ECHO<span className="text-[var(--gold)]">MASTERS</span>
                        </motion.h1>
                        
                        <motion.p 
                            className="mt-6 text-[var(--gold)]/50 font-mono text-[10px] uppercase tracking-[0.8em]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 1 }}
                        >
                            Elite Physics Intelligence
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CinematicIntro;
