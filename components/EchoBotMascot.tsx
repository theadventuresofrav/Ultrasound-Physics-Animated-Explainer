
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EchoBotMascotProps {
    size?: number;
    isThinking?: boolean;
    isError?: boolean;
    isSuccess?: boolean;
    className?: string;
    showGlow?: boolean;
}

const EchoBotMascot: React.FC<EchoBotMascotProps> = ({ 
    size = 64, 
    isThinking = false, 
    isError = false, 
    isSuccess = false,
    className = '',
    showGlow = true
}) => {
    const [blink, setBlink] = useState(false);

    // Random blink cycle to simulate life
    useEffect(() => {
        const triggerBlink = () => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
            const nextBlink = Math.random() * 4000 + 2000;
            setTimeout(triggerBlink, nextBlink);
        };
        const timer = setTimeout(triggerBlink, 3000);
        return () => clearTimeout(timer);
    }, []);

    // State-based color mapping
    const baseColor = isError ? '#ef4444' : isSuccess ? '#22c55e' : 'var(--gold)';
    const auraColor = isError ? 'rgba(239, 68, 68, 0.4)' : isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'rgba(212, 175, 55, 0.4)';

    return (
        <div 
            style={{ width: size, height: size }} 
            className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
            aria-label="EchoBot Advanced Intelligence Mascot"
        >
            {/* 1. Ambient Background Aura (Theme Aware) */}
            <AnimatePresence>
                {showGlow && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                            opacity: isThinking ? [0.2, 0.5, 0.2] : 0.3,
                            scale: isThinking ? [1, 1.4, 1] : 1,
                            backgroundColor: auraColor
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full blur-[40px] z-0"
                    />
                )}
            </AnimatePresence>

            {/* 2. Main Body Container with Hovering Physics */}
            <motion.div
                animate={{ 
                    y: isThinking ? [-size * 0.1, size * 0.1, -size * 0.1] : [-size * 0.05, size * 0.05, -size * 0.05],
                    rotateX: isThinking ? [0, 15, 0] : [0, 5, 0],
                    rotateY: isThinking ? [0, -15, 0] : [0, -5, 0],
                }}
                transition={{ 
                    y: { duration: isThinking ? 2.5 : 5, repeat: Infinity, ease: "easeInOut" },
                    rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-full h-full z-10"
                style={{ perspective: '500px', transformStyle: 'preserve-3d' }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-visible">
                    <defs>
                        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2c2c2e" />
                            <stop offset="100%" stopColor="#050505" />
                        </linearGradient>
                        <filter id="neonGlow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Outer Kinetic Ring (Spinning) */}
                    <motion.g
                        animate={{ rotate: 360 }}
                        transition={{ duration: isThinking ? 4 : 12, repeat: Infinity, ease: "linear" }}
                        className="origin-center"
                    >
                        <circle cx="50" cy="50" r="48" fill="none" stroke={baseColor} strokeWidth="0.5" strokeDasharray="2, 10" opacity="0.2" />
                        <circle cx="98" cy="50" r="1.5" fill={baseColor} opacity="0.6" />
                    </motion.g>

                    {/* Inner Kinetic Ring (Counter-Spinning) */}
                    <motion.g
                        animate={{ rotate: -360 }}
                        transition={{ duration: isThinking ? 3 : 15, repeat: Infinity, ease: "linear" }}
                        className="origin-center"
                    >
                        <circle cx="50" cy="50" r="42" fill="none" stroke={baseColor} strokeWidth="0.75" strokeDasharray="20, 5" opacity="0.15" />
                        <rect x="90" y="48" width="4" height="4" fill={baseColor} opacity="0.4" rx="1" />
                    </motion.g>

                    {/* Sphere Main Chassis */}
                    <circle cx="50" cy="50" r="35" fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    
                    {/* Glass Lens Reflection */}
                    <path d="M 30 30 Q 50 15 70 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" />

                    {/* Digital Face Display Area */}
                    <circle cx="50" cy="50" r="26" fill="#000" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke={baseColor} strokeWidth="0.2" opacity="0.3" />

                    {/* Central Eye / Lens Mechanism */}
                    <g transform="translate(50, 50)">
                        <AnimatePresence mode="wait">
                            {isError ? (
                                <motion.g key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter="url(#neonGlow)" />
                                </motion.g>
                            ) : isSuccess ? (
                                <motion.g key="succ" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <path d="M -8 0 L -2 6 L 10 -6" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlow)" />
                                </motion.g>
                            ) : (
                                <motion.g key="idle-think">
                                    {/* Recursive Iris Layers */}
                                    <motion.circle 
                                        r="12" fill="none" stroke={baseColor} strokeWidth="0.5" opacity="0.1"
                                        animate={isThinking ? { scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    
                                    {/* Main Iris */}
                                    <motion.circle 
                                        r="8" fill="none" stroke={baseColor} strokeWidth="1.5" opacity="0.4"
                                        animate={isThinking ? { r: [8, 10, 8] } : {}}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    />

                                    {/* The Pupil / Core Node */}
                                    <motion.circle
                                        r={blink ? 0 : 5}
                                        fill={baseColor}
                                        filter="url(#neonGlow)"
                                        animate={isThinking ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] } : { opacity: [0.6, 0.9, 0.6] }}
                                        transition={{ duration: isThinking ? 0.4 : 2, repeat: Infinity }}
                                    />

                                    {/* Scanning Beam (Vertical Sweep) */}
                                    <AnimatePresence>
                                        {isThinking && (
                                            <motion.rect
                                                x="-18" width="36" height="1"
                                                fill={baseColor}
                                                opacity="0.6"
                                                initial={{ y: -15 }}
                                                animate={{ y: [ -18, 18, -18 ] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.g>
                            )}
                        </AnimatePresence>
                    </g>

                    {/* Data Ports Detail (Bottom LEDs) */}
                    <g transform="translate(50, 78)">
                        <circle cx="-10" cy="0" r="1.5" fill={isSuccess ? '#22c55e' : '#1c1c1e'} stroke="rgba(255,255,255,0.05)" />
                        <motion.circle 
                            cx="0" cy="0" r="1.5" fill={isThinking ? 'var(--gold)' : '#1c1c1e'} 
                            animate={isThinking ? { opacity: [0.3, 1, 0.3] } : {}} 
                            transition={{ duration: 0.5, repeat: Infinity }} 
                        />
                        <circle cx="10" cy="0" r="1.5" fill={isError ? '#ef4444' : '#1c1c1e'} stroke="rgba(255,255,255,0.05)" />
                    </g>
                </svg>

                {/* Particle Emitters (Floating Intelligence Fragments) */}
                <AnimatePresence>
                    {isThinking && Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                            key={`frag-${i}`}
                            className="absolute rounded-full"
                            style={{ 
                                width: Math.random() * 3 + 1, 
                                height: Math.random() * 3 + 1,
                                backgroundColor: baseColor,
                                left: `${20 + Math.random() * 60}%`,
                                top: '50%',
                                filter: 'blur(0.5px)'
                            }}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{ 
                                opacity: [0, 0.7, 0],
                                y: [0, -size * (0.5 + Math.random())],
                                x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                                scale: [1, 1.5, 0.5]
                            }}
                            transition={{ 
                                duration: 1.5 + Math.random(), 
                                repeat: Infinity, 
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Dynamic Interactive Shadow */}
            <motion.div
                animate={{ 
                    scaleX: isThinking ? [0.7, 0.9, 0.7] : [0.8, 1, 0.8],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: isThinking ? 2.5 : 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-15%] w-[60%] h-[5%] bg-black rounded-[100%] blur-xl z-0"
            />
        </div>
    );
};

export default EchoBotMascot;
