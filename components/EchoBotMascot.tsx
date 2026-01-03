
import React from 'react';
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
    // State-based color mapping
    const baseColor = isError ? '#ef4444' : isSuccess ? '#22c55e' : 'var(--gold)';
    const irisColor = isError ? '#f87171' : isSuccess ? '#4ade80' : '#fff';
    const auraColor = isError ? 'rgba(239, 68, 68, 0.4)' : isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'rgba(212, 175, 55, 0.4)';

    return (
        <div 
            style={{ width: size, height: size }} 
            className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
            aria-label="EchoBot System Mascot"
        >
            {/* Ambient Aura Glow */}
            <AnimatePresence>
                {showGlow && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                            opacity: isThinking ? [0.3, 0.6, 0.3] : 0.4,
                            scale: isThinking ? [1, 1.3, 1] : 1,
                            backgroundColor: auraColor
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full blur-[30px]"
                    />
                )}
            </AnimatePresence>

            {/* Core Floating Movement */}
            <motion.div
                animate={{ 
                    y: isThinking ? [-size * 0.08, size * 0.08, -size * 0.08] : [-size * 0.04, size * 0.04, -size * 0.04],
                    rotate: isThinking ? [-2, 2, -2] : [0, 0]
                }}
                transition={{ 
                    y: { duration: isThinking ? 2 : 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-full h-full z-10"
            >
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] overflow-visible">
                    <defs>
                        <linearGradient id="podGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2c2c2e" />
                            <stop offset="100%" stopColor="#0a0a0b" />
                        </linearGradient>
                        <filter id="glowEffect">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Orbital Sound Wave Ring 1 */}
                    <motion.ellipse
                        cx="50" cy="50" rx="46" ry="46"
                        fill="none"
                        stroke={baseColor}
                        strokeWidth="0.75"
                        strokeDasharray="1, 15"
                        opacity="0.3"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Orbital Sound Wave Ring 2 (Thinking state) */}
                    <AnimatePresence>
                        {isThinking && (
                            <motion.circle
                                key="sonar"
                                cx="50" cy="50" r="40"
                                fill="none"
                                stroke={baseColor}
                                strokeWidth="0.5"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: [0.8, 1.2], opacity: [0.6, 0] }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Mechanical Pod Chassis */}
                    <circle cx="50" cy="50" r="32" fill="url(#podGradient)" stroke="#1c1c1e" strokeWidth="1" />
                    
                    {/* Metallic Detail Ring */}
                    <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                    {/* Lens/Face Display Area */}
                    <circle cx="50" cy="50" r="22" fill="#000" />
                    <circle cx="50" cy="50" r="21" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                    {/* Reactive Iris Graphics */}
                    <g transform="translate(50, 50)">
                        <AnimatePresence mode="wait">
                            {isError ? (
                                <motion.g key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <path d="M-1 -10 L1 -10 L1 2 L-1 2 Z M-1 5 L1 5 L1 7 L-1 7 Z" fill={baseColor} filter="url(#glowEffect)" />
                                </motion.g>
                            ) : isSuccess ? (
                                <motion.g key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <path d="M-8 0 L-2 6 L8 -6" fill="none" stroke={baseColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glowEffect)" />
                                </motion.g>
                            ) : (
                                <motion.g key="idle-thinking">
                                    {/* Concentric Lens Layers */}
                                    <motion.circle 
                                        r="6" 
                                        fill="none" 
                                        stroke={baseColor} 
                                        strokeWidth="1.5" 
                                        opacity="0.6"
                                        animate={isThinking ? { r: [6, 8, 6], opacity: [0.4, 0.8, 0.4] } : {}}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    
                                    {/* Central Pupil */}
                                    <motion.circle
                                        r="3"
                                        fill={irisColor}
                                        filter="url(#glowEffect)"
                                        animate={isThinking ? { scale: [1, 1.4, 1] } : { scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Scanning Horizon Line */}
                                    <AnimatePresence>
                                        {isThinking && (
                                            <motion.rect 
                                                x="-15" y="-0.5" width="30" height="1"
                                                fill={baseColor}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: [0, 0.8, 0], y: [ -12, 12, -12 ] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.g>
                            )}
                        </AnimatePresence>
                    </g>

                    {/* Data Ports Detail */}
                    <g transform="translate(50, 78)">
                        <circle cx="-8" cy="0" r="1.2" fill={isSuccess ? '#22c55e' : '#1c1c1e'} />
                        <motion.circle cx="0" cy="0" r="1.2" fill={isThinking ? 'var(--gold)' : '#1c1c1e'} animate={isThinking ? { opacity: [0.3, 1, 0.3] } : {}} transition={{ duration: 0.5, repeat: Infinity }} />
                        <circle cx="8" cy="0" r="1.2" fill={isError ? '#ef4444' : '#1c1c1e'} />
                    </g>
                </svg>

                {/* Micro-Holographic Sound Waves (Floaties) */}
                <AnimatePresence>
                    {isThinking && Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={`wave-${i}`}
                            className="absolute bg-white/20 rounded-full"
                            style={{ 
                                width: 2, 
                                height: 2,
                                left: `${30 + (i * 20)}%`,
                                top: '45%'
                            }}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 0],
                                y: [-40 - (i * 10), -60 - (i * 10)],
                                scale: [1, 2]
                            }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Dynamic Ground Shadow */}
            <motion.div
                animate={{ 
                    scaleX: isThinking ? [0.7, 0.9, 0.7] : [0.8, 1, 0.8],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: isThinking ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-15%] w-[60%] h-[4%] bg-black rounded-[100%] blur-md z-0"
            />
        </div>
    );
};

export default EchoBotMascot;
