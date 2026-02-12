import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '../contexts/SoundContext';

interface CinematicIntroProps {
    onComplete: () => void;
}

const CALIBRATION_LOGS = [
    { block: "APERTURE", lines: ["SYNCING_PZT_ARRAY...", "CALIBRATING_NEAR_FIELD...", "APERTURE_LOCK: 100%"] },
    { block: "RESOLUTION", lines: ["RESOLVING_LARRD_AXIS...", "DEBLURRING_LATA_VECTOR...", "PRECISION_NOMINAL"] },
    { block: "SIGNAL", lines: ["BOOSTING_SNR_RATIO...", "ELIMINATING_CLUTTER...", "SIGNAL_CLEAN"] },
];

const NARRATIVE_HITS = [
    { text: "STATIC IS THE ENEMY.", sub: "FILTER_ACTIVE", color: "text-white/40" },
    { text: "PRECISION IS THE WEAPON.", sub: "LARRD_CALIBRATED", color: "text-[var(--gold)]" },
    { text: "MASTER THE WAVE.", sub: "NEURAL_LINK_ESTABLISHED", color: "text-white", highlight: true },
];

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
    const [stage, setStage] = useState<'init' | 'calibration' | 'narrative' | 'pulse' | 'ready'>('init');
    const [logBlockIndex, setLogBlockIndex] = useState(0);
    const { playTypewriter, playStartup, playSuccess, playClick, playError, playScan } = useSound();

    useEffect(() => {
        const sequence = async () => {
            playStartup();
            await new Promise(r => setTimeout(r, 800));
            setStage('calibration');
        };
        sequence();
    }, [playStartup]);

    useEffect(() => {
        if (stage === 'calibration') {
            if (logBlockIndex < CALIBRATION_LOGS.length) {
                const timer = setTimeout(() => {
                    playTypewriter();
                    setLogBlockIndex(prev => prev + 1);
                }, 800);
                return () => clearTimeout(timer);
            } else {
                setTimeout(() => setStage('narrative'), 500);
            }
        }
    }, [stage, logBlockIndex, playTypewriter]);

    useEffect(() => {
        if (stage === 'narrative') {
            const timer = setTimeout(() => {
                playScan();
                setStage('pulse');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [stage, playScan]);

    useEffect(() => {
        if (stage === 'pulse') {
            playSuccess();
            const timer = setTimeout(() => {
                onComplete();
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [stage, onComplete, playSuccess]);

    return (
        <motion.div 
            className="fixed inset-0 z-[999] bg-[#020204] flex flex-col items-center justify-center overflow-hidden font-mono px-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(30px)" }}
            transition={{ duration: 1.2 }}
        >
            {/* 3D PERSPECTIVE GRID */}
            <div className="absolute inset-0 z-0 opacity-20" style={{ perspective: '1000px' }}>
                <motion.div 
                    className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]"
                    animate={{ 
                        rotateX: [60, 70, 60],
                        y: ['-10%', '0%', '-10%']
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* SCANNING REVEAL LINE */}
            <motion.div 
                className="absolute left-0 right-0 h-[2px] bg-cyan-400 z-50 shadow-[0_0_20px_cyan]"
                initial={{ top: '-10%' }}
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* ABORT BUTTON */}
            <button 
                onClick={() => { playClick(); onComplete(); }}
                className="absolute bottom-10 sm:bottom-12 z-[100] text-[8px] sm:text-[9px] text-white/10 hover:text-red-500 uppercase tracking-[0.4em] sm:tracking-[0.5em] border border-white/5 px-6 py-2 rounded-full backdrop-blur-xl transition-all font-black"
            >
                [ TERMINATE_INGEST ]
            </button>

            {/* STAGE: CALIBRATION BLOCKS */}
            <AnimatePresence>
                {stage === 'calibration' && (
                    <motion.div 
                        className="relative z-10 w-full max-w-sm sm:max-w-lg space-y-4 sm:space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
                    >
                        {CALIBRATION_LOGS.map((block, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ 
                                    opacity: idx < logBlockIndex ? 1 : 0,
                                    x: idx < logBlockIndex ? 0 : -20 
                                }}
                                className={`p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md transition-all ${idx < logBlockIndex ? 'border-l-4 border-l-cyan-500' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[7px] sm:text-[8px] font-black text-cyan-400/60 uppercase tracking-widest">{block.block}_SUBSYSTEM</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    {block.lines.map((line, lIdx) => (
                                        <div key={lIdx} className="text-[9px] sm:text-[11px] text-white/70 flex gap-3 sm:gap-4 uppercase font-bold tracking-tighter">
                                            <span className="opacity-20 shrink-0">0{idx}-{lIdx}</span>
                                            <span className="truncate">{line}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE: NARRATIVE IMPACTS */}
            <AnimatePresence>
                {stage === 'narrative' && (
                    <div className="relative z-20 text-center px-2 w-full flex flex-col items-center">
                        {NARRATIVE_HITS.map((hit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="mb-8 sm:mb-12 last:mb-0"
                            >
                                <motion.p className="text-[7px] sm:text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] sm:tracking-[0.6em] mb-2 sm:mb-3 opacity-50">
                                    [{hit.sub}]
                                </motion.p>
                                <h2 className={`text-2xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase italic break-words ${hit.color} ${hit.highlight ? 'drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]' : ''}`}>
                                    {hit.text}
                                </h2>
                                {hit.highlight && (
                                    <motion.div 
                                        className="h-0.5 sm:h-1 bg-white mt-4 sm:mt-6 shadow-[0_0_20px_white]"
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ delay: index * 1.5 + 0.4, duration: 1 }}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* STAGE: EXPLOSIVE PULSE RESOLVE */}
            <AnimatePresence>
                {stage === 'pulse' && (
                    <motion.div 
                        className="relative z-30 flex flex-col items-center w-full px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div 
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {[...Array(3)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    className="absolute rounded-full border border-white/10"
                                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                                    animate={{ width: '300vw', height: '300vw', opacity: 0 }}
                                    transition={{ duration: 2, delay: i * 0.4, ease: "easeOut", repeat: Infinity }}
                                />
                            ))}
                        </motion.div>

                        <div className="flex flex-col items-center gap-6 sm:gap-12 relative">
                            <motion.div 
                                className="w-20 h-20 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[3rem] bg-black border-4 border-[var(--gold)] flex items-center justify-center relative shadow-[0_0_100px_rgba(212,175,55,0.3)]"
                                initial={{ rotateY: 90, scale: 0.5 }}
                                animate={{ rotateY: 0, scale: 1 }}
                                transition={{ duration: 0.8, type: "spring" }}
                            >
                                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" className="sm:w-[80px] sm:h-[80px] text-[var(--gold)]">
                                    <path d="M2 16C2 16 6 6 10 16C14 26 18 6 22 16C26 26 30 16 30 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <motion.div 
                                    className="absolute -inset-3 sm:-inset-4 border-2 border-cyan-400 rounded-[2rem] sm:rounded-[3.5rem] opacity-20"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                            </motion.div>
                            
                            <div className="text-center space-y-2 sm:space-y-4">
                                <motion.h1 
                                    className="text-3xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter uppercase italic whitespace-nowrap"
                                    initial={{ letterSpacing: '0.2em', filter: 'blur(20px)' }}
                                    animate={{ letterSpacing: '-0.02em', filter: 'blur(0px)' }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                >
                                    ECHO<span className="text-[var(--gold)] drop-shadow-[0_0_30px_var(--gold)]">MASTERS</span>
                                </motion.h1>
                                
                                <motion.div 
                                    className="flex items-center justify-center gap-3 sm:gap-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-r from-transparent to-white/40" />
                                    <span className="text-white font-mono text-[8px] sm:text-[11px] uppercase tracking-[0.4em] sm:tracking-[0.8em] font-black italic">
                                        SYSTEM_READY
                                    </span>
                                    <div className="h-[1px] w-8 sm:w-24 bg-gradient-to-l from-transparent to-white/40" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CinematicIntro;