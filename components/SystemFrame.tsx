
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { motion } from 'framer-motion';

const Corner: React.FC<{ className?: string, rotate?: number, delay?: number }> = ({ className, rotate = 0, delay = 0 }) => (
    <motion.svg 
        viewBox="0 0 40 40" 
        className={`absolute w-8 h-8 sm:w-16 sm:h-16 text-[var(--gold)] transition-colors duration-500 opacity-60 ${className}`}
        style={{ rotate: rotate }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
        <path d="M 1 40 L 1 10 L 10 1 H 40" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" />
        <rect x="5" y="30" width="3" height="3" fill="currentColor" opacity="0.4" />
    </motion.svg>
);

const SystemFrame: React.FC = () => {
    const { userProfile } = useUser();
    const isNeon = userProfile?.theme === 'Neon';
    const [telemetry, setTelemetry] = useState({ x: 0, y: 0, cpu: 42 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry({
                x: Math.floor(Math.random() * 9999),
                y: Math.floor(Math.random() * 9999),
                cpu: Math.floor(Math.random() * 20) + 30
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[60] pointer-events-none flex flex-col justify-between select-none p-3 sm:p-6">
            {/* Global Scanline Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] opacity-10" />

            <div className="w-full h-10 relative">
                <div className="absolute top-0 left-12 right-12 h-[1px] bg-white/10 overflow-hidden">
                    <motion.div 
                        className="w-full h-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-50"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                    />
                </div>
                
                <Corner className="top-0 left-0" rotate={0} delay={0.2} />
                <Corner className="top-0 right-0" rotate={90} delay={0.3} />
                
                <motion.div 
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 bg-[#050505]/95 backdrop-blur-2xl px-6 py-1 text-[9px] font-mono text-[var(--gold)]/80 tracking-[0.4em] uppercase border border-t-0 border-white/10 rounded-b-2xl flex items-center gap-6 shadow-2xl shadow-[var(--gold)]/5"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span>ECHO_OS_V5.0_CMD</span>
                    </div>
                    <span className="text-white/10">/</span>
                    <span className="text-white/40">CPU: {telemetry.cpu}%</span>
                    <span className="text-white/10">/</span>
                    <span className="hidden md:inline">NAV_LOC: {telemetry.x}:{telemetry.y}</span>
                </motion.div>
            </div>

            <div className="flex-grow relative w-full">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-16"
                >
                    <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                    <div className="w-0.5 h-1 bg-white" />
                    <div className="w-0.5 h-1 bg-white" />
                    <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-16 items-end"
                >
                    <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                    <div className="w-0.5 h-1 bg-white" />
                    <div className="w-0.5 h-1 bg-white" />
                    <div className="w-1 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                </motion.div>
            </div>

            <div className="w-full h-10 relative">
                <div className="absolute bottom-0 left-12 right-12 h-[1px] bg-white/10 overflow-hidden">
                     <motion.div 
                        className="w-full h-full bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-30"
                        initial={{ x: '100%' }}
                        animate={{ x: '-100%' }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                </div>

                <Corner className="bottom-0 right-0" rotate={180} delay={0.4} />
                <Corner className="bottom-0 left-0" rotate={270} delay={0.5} />

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-1 left-14 sm:left-16 text-[9px] font-mono text-white/20 tracking-[0.3em] flex items-center gap-6"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                        <span className="text-white/60 font-black">KERNEL: OPTIMAL</span>
                    </div>
                    <span className="hidden sm:inline text-white/5">|</span>
                    <span className="hidden sm:inline">BUFFER_SYNC: NOMINAL</span>
                </motion.div>
                
                <div className="absolute bottom-1 right-14 sm:right-16 flex gap-6 text-[9px] font-mono">
                    <span className="text-white/20 uppercase tracking-widest">SIGNAL_LINK: 100%</span>
                    <span className="text-[var(--gold)]/40 font-black">ENCRYPTION: AES_OS_PRO</span>
                </div>
            </div>
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
        </div>
    );
};

export default SystemFrame;
