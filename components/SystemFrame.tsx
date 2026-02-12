import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { motion } from 'framer-motion';

const Corner: React.FC<{ className?: string, rotate?: number, delay?: number }> = ({ className, rotate = 0, delay = 0 }) => (
    <motion.svg 
        viewBox="0 0 40 40" 
        className={`absolute w-6 h-6 sm:w-16 sm:h-16 text-[var(--gold)] transition-colors duration-500 opacity-30 sm:opacity-40 ${className}`}
        style={{ rotate: rotate }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
        <path d="M 1 40 L 1 10 L 10 1 H 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="square" />
        <rect x="5" y="30" width="2" height="2" fill="currentColor" opacity="0.3" />
    </motion.svg>
);

const SystemFrame: React.FC = () => {
    const { userProfile } = useUser();
    const [telemetry, setTelemetry] = useState({ cpu: 32, ram: 1.2, ping: 12 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry({
                cpu: Math.floor(Math.random() * 15) + 25,
                ram: Number((1.1 + Math.random() * 0.2).toFixed(1)),
                ping: Math.floor(Math.random() * 5) + 10
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none flex flex-col justify-between select-none p-1 sm:p-6 font-mono overflow-hidden">
            {/* Upper Telemetry Deck */}
            <div className="w-full h-6 sm:h-10 relative">
                <div className="absolute top-0 left-8 sm:left-12 right-8 sm:right-12 h-[1px] bg-white/5 overflow-hidden">
                    <motion.div 
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '300%' }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                
                <Corner className="top-0 left-0" rotate={0} delay={0.2} />
                <Corner className="top-0 right-0" rotate={90} delay={0.3} />
                
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 bg-[#050505]/95 backdrop-blur-3xl px-4 sm:px-8 py-0.5 sm:py-1 text-[6px] sm:text-[9px] font-bold text-white/40 tracking-[0.3em] sm:tracking-[0.4em] uppercase border border-t-0 border-white/10 rounded-b-lg sm:rounded-b-xl flex items-center gap-3 sm:gap-10 shadow-2xl"
                >
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse shadow-[0_0_5px_red]" />
                        <span className="text-[var(--gold)] whitespace-nowrap">{telemetry.cpu}%</span>
                    </div>
                    <span className="opacity-10 hidden xs:inline">|</span>
                    <div className="hidden xs:flex items-center gap-1 sm:gap-2">
                        <div className="w-1 h-1 rounded-full bg-cyan-500 animate-ping shadow-[0_0_5px_cyan]" />
                        <span className="text-cyan-400 font-black">SYNC</span>
                    </div>
                </motion.div>
            </div>

            {/* Lower Metadata Deck */}
            <div className="w-full h-6 sm:h-10 relative">
                <div className="absolute bottom-0 left-8 sm:left-12 right-8 sm:right-12 h-[1px] bg-white/5 overflow-hidden">
                     <motion.div 
                        className="w-1/4 h-full bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent"
                        initial={{ x: '400%' }}
                        animate={{ x: '-200%' }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <Corner className="bottom-0 right-0" rotate={180} delay={0.4} />
                <Corner className="bottom-0 left-0" rotate={270} delay={0.5} />

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-1 left-8 sm:left-20 text-[6px] sm:text-[9px] font-bold text-white/20 tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-3 sm:gap-6"
                >
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        <span className="text-white/30 hidden xs:inline uppercase">Stable_Link</span>
                    </div>
                </motion.div>
                
                <div className="absolute bottom-1 right-8 sm:right-20 flex items-center gap-4 sm:gap-6 text-[6px] sm:text-[9px] font-bold">
                    <span className="text-[var(--gold)]/20 font-black tracking-widest italic uppercase">Omega_v5_A</span>
                </div>
            </div>
        </div>
    );
};

export default SystemFrame;