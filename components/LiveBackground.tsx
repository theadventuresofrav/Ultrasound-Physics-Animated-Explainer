
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Space Asset Components ---

const SpaceShip: React.FC<{ color?: string; type?: 'scout' | 'fighter' }> = ({ color = "var(--gold)", type = 'scout' }) => (
    <div className="relative w-full h-full">
        <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {type === 'fighter' ? (
                <g>
                    <path d="M 20 30 L 80 30 L 95 45 L 5 45 Z" fill="#222" stroke={color} strokeWidth="2" />
                    <path d="M 30 30 L 50 5 L 70 30" fill="#333" stroke={color} strokeWidth="1.5" />
                    <rect x="15" y="35" width="10" height="5" fill={color} opacity="0.8" />
                    <rect x="75" y="35" width="10" height="5" fill={color} opacity="0.8" />
                    <motion.circle cx="35" cy="45" r="2" fill="#ff0000" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.2, repeat: Infinity }} />
                    <motion.circle cx="65" cy="45" r="2" fill="#ff0000" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }} />
                </g>
            ) : (
                <g>
                    <motion.ellipse 
                        cx="50" cy="35" rx="20" ry="4" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="1.5"
                        animate={{ rx: [20, 30, 20], opacity: [0.2, 0.6, 0.2] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <path d="M 30 25 Q 50 2 70 25" fill="#e5e5e5" stroke="#fff" strokeWidth="1" opacity="0.9" />
                    <ellipse cx="50" cy="25" rx="45" ry="12" fill="#111" stroke="#444" strokeWidth="2" />
                    {[15, 32, 50, 68, 85].map((x, i) => (
                        <motion.circle 
                            key={i} 
                            cx={x} cy="25" r="3" 
                            fill={color}
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                        />
                    ))}
                </g>
            )}
            <defs>
                <linearGradient id={`beamGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const Alien: React.FC = () => (
    <div className="w-full h-full relative">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(74,222,128,0.6)] overflow-visible">
            <defs>
                <radialGradient id="emeraldCore" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#064e3b" stopOpacity="1" />
                </radialGradient>
            </defs>
            
            {/* Rotating Kinetic Shrouds */}
            <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="origin-center"
            >
                <path d="M 50 5 L 60 25 L 40 25 Z" fill="#065f46" stroke="#4ade80" strokeWidth="1" />
                <path d="M 50 95 L 60 75 L 40 75 Z" fill="#065f46" stroke="#4ade80" strokeWidth="1" />
                <path d="M 5 50 L 25 40 L 25 60 Z" fill="#065f46" stroke="#4ade80" strokeWidth="1" />
                <path d="M 95 50 L 75 40 L 75 60 Z" fill="#065f46" stroke="#4ade80" strokeWidth="1" />
            </motion.g>

            {/* Main Bio-Interceptor Body */}
            <motion.path 
                d="M 50 20 L 80 50 L 50 80 L 20 50 Z" 
                fill="url(#emeraldCore)" 
                stroke="#4ade80" 
                strokeWidth="2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Central Optic Sensor */}
            <circle cx="50" cy="50" r="10" fill="#000" stroke="#4ade80" strokeWidth="1" />
            <motion.circle 
                cx="50" cy="50" r="4" 
                fill="#fff" 
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
            />

            {/* Plasma Wings */}
            <g opacity="0.6">
                <motion.path 
                    d="M 20 50 Q 5 30 20 10" 
                    fill="none" 
                    stroke="#4ade80" 
                    strokeWidth="1.5"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    strokeDasharray="4 4"
                />
                <motion.path 
                    d="M 80 50 Q 95 30 80 10" 
                    fill="none" 
                    stroke="#4ade80" 
                    strokeWidth="1.5"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    strokeDasharray="4 4"
                />
            </g>
        </svg>
    </div>
);

const LaserBeam: React.FC<{ color: string; isLeft: boolean }> = ({ color, isLeft }) => (
    <motion.div
        className="absolute w-12 h-1 rounded-full z-30"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        initial={{ x: 0, opacity: 1 }}
        animate={{ x: isLeft ? 400 : -400, opacity: 0 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
    />
);

const ShootingStar: React.FC<{ startX: number, startY: number }> = ({ startX, startY }) => (
    <motion.div
        className="absolute w-[200px] h-[2px] z-10"
        initial={{ left: `${startX}%`, top: `${startY}%`, opacity: 0, scaleX: 0 }}
        animate={{ 
            left: [`${startX}%`, `${startX + 30}%`],
            top: [`${startY}%`, `${startY + 20}%`],
            opacity: [0, 1, 0],
            scaleX: [0, 1.5, 0]
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ 
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.8), white)',
            rotate: '30deg',
            transformOrigin: 'left center'
        }}
    />
);

const Nebula: React.FC<{ color: string, size: string, delay: number }> = ({ color, size, delay }) => (
    <motion.div
        className="absolute rounded-full pointer-events-none blur-[120px] mix-blend-screen opacity-30"
        initial={{ scale: 0.8, x: '0%', y: '0%' }}
        animate={{ 
            scale: [1, 1.3, 1],
            x: ['-5%', '5%', '-5%'],
            y: ['-5%', '5%', '-5%'],
            rotate: [0, 360]
        }}
        transition={{ 
            duration: 30 + delay,
            repeat: Infinity,
            ease: "linear"
        }}
        style={{ 
            width: size, 
            height: size,
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
        }}
    />
);

// --- Types ---

interface Entity {
    id: string;
    type: 'ship' | 'alien' | 'shootingStar' | 'dogfight';
    x: number;
    y: number;
    scale: number;
    duration: number;
    rotation?: number;
    color?: string;
    pathVariant?: number;
}

const LiveBackground: React.FC = () => {
    const [entities, setEntities] = useState<Entity[]>([]);

    const stars = useMemo(() => 
        Array.from({ length: 300 }).map((_, i) => ({
            id: i,
            size: Math.random() * 2.5 + 0.5,
            x: Math.random() * 100,
            y: Math.random() * 100,
            blink: Math.random() * 4 + 1.5,
            color: Math.random() > 0.8 ? '#a5f3fc' : Math.random() > 0.9 ? '#fde047' : '#ffffff'
        })), []);

    useEffect(() => {
        const spawn = () => {
            const id = Math.random().toString(36).substr(2, 9);
            const seed = Math.random();
            
            let newEntity: Entity;

            if (seed > 0.7) {
                // Dogfight Scenario
                newEntity = {
                    id,
                    type: 'dogfight',
                    x: Math.random() > 0.5 ? -20 : 120,
                    y: Math.random() * 60 + 20,
                    scale: Math.random() * 0.3 + 0.5,
                    duration: Math.random() * 8 + 6,
                    color: Math.random() > 0.5 ? '#ff0099' : '#00f3ff'
                };
            } else if (seed > 0.4) {
                // Cartoon Alien
                newEntity = {
                    id,
                    type: 'alien',
                    x: Math.random() * 100,
                    y: Math.random() > 0.5 ? -20 : 120,
                    scale: Math.random() * 0.4 + 0.6,
                    duration: Math.random() * 20 + 15,
                    rotation: Math.random() * 360
                };
            } else if (seed > 0.1) {
                // Regular Scout Ship
                newEntity = {
                    id,
                    type: 'ship',
                    x: Math.random() > 0.5 ? -20 : 120,
                    y: Math.random() * 100,
                    scale: Math.random() * 0.3 + 0.4,
                    duration: Math.random() * 15 + 15,
                    rotation: Math.random() * 20 - 10
                };
            } else {
                // Shooting Star
                newEntity = {
                    id,
                    type: 'shootingStar',
                    x: Math.random() * 80,
                    y: Math.random() * 80,
                    scale: 1,
                    duration: 1
                };
            }

            setEntities(prev => [...prev, newEntity]);

            setTimeout(() => {
                setEntities(prev => prev.filter(e => e.id !== id));
            }, 30000);
        };

        const interval = setInterval(spawn, 2500); 
        spawn();
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#010103]">
            {/* 1. Nebula Layers */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%]"><Nebula color="rgba(212, 175, 55, 0.3)" size="70vw" delay={0} /></div>
                <div className="absolute bottom-[-10%] right-[-10%]"><Nebula color="rgba(59, 130, 246, 0.2)" size="60vw" delay={5} /></div>
                <div className="absolute top-[20%] right-[10%]"><Nebula color="rgba(168, 85, 247, 0.1)" size="80vw" delay={10} /></div>
                <div className="absolute bottom-[20%] left-[10%]"><Nebula color="rgba(6, 182, 212, 0.1)" size="50vw" delay={15} /></div>
            </div>

            {/* 2. Twinkling Star Field */}
            <div className="absolute inset-0 z-10">
                {stars.map(star => (
                    <motion.div
                        key={star.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            backgroundColor: star.color,
                            boxShadow: `0 0 ${star.size * 2}px ${star.color}`
                        }}
                        animate={{ opacity: [0.1, 0.8, 0.1], scale: [1, 1.2, 1] }}
                        transition={{ duration: star.blink, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>

            {/* 3. Moving Entities */}
            <AnimatePresence>
                {entities.map(entity => {
                    if (entity.type === 'shootingStar') {
                        return <ShootingStar key={entity.id} startX={entity.x} startY={entity.y} />;
                    }

                    if (entity.type === 'alien') {
                        const isTopToBottom = entity.y < 0;
                        return (
                            <motion.div
                                key={entity.id}
                                className="absolute z-20"
                                initial={{ left: `${entity.x}vw`, top: `${entity.y}vh`, scale: entity.scale, opacity: 0, rotate: entity.rotation }}
                                animate={{ 
                                    top: isTopToBottom ? '120vh' : '-20vh', 
                                    left: [`${entity.x}vw`, `${entity.x + 10}vw`, `${entity.x - 10}vw`, `${entity.x}vw`],
                                    opacity: [0, 1, 1, 0],
                                    rotate: [entity.rotation || 0, (entity.rotation || 0) + 360]
                                }}
                                transition={{ duration: entity.duration, ease: "easeInOut" }}
                                style={{ width: 80, height: 80 }}
                            >
                                <Alien />
                            </motion.div>
                        );
                    }

                    if (entity.type === 'dogfight') {
                        const isLeftToRight = entity.x < 0;
                        const startX = entity.x;
                        const endX = isLeftToRight ? 120 : -20;
                        return (
                            <div key={entity.id} className="absolute z-20">
                                {/* Attacker */}
                                <motion.div
                                    className="absolute"
                                    initial={{ left: `${startX}vw`, top: `${entity.y}vh`, scale: entity.scale, opacity: 0 }}
                                    animate={{ left: `${endX}vw`, top: `${entity.y + 10}vh`, opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: entity.duration, ease: "linear" }}
                                    style={{ width: 100, height: 60 }}
                                >
                                    <div style={{ transform: isLeftToRight ? 'none' : 'scaleX(-1)' }}>
                                        <SpaceShip color="#ff0099" type="fighter" />
                                        <div className="absolute top-1/2 left-full">
                                            <LaserBeam color="#ff0099" isLeft={isLeftToRight} />
                                        </div>
                                    </div>
                                </motion.div>
                                {/* Target (Dodge motion) */}
                                <motion.div
                                    className="absolute"
                                    initial={{ left: `${startX + (isLeftToRight ? 15 : -15)}vw`, top: `${entity.y}vh`, scale: entity.scale * 0.9, opacity: 0 }}
                                    animate={{ 
                                        left: `${endX + (isLeftToRight ? 15 : -15)}vw`, 
                                        top: [`${entity.y}vh`, `${entity.y - 10}vh`, `${entity.y + 10}vh`, `${entity.y}vh`],
                                        opacity: [0, 1, 1, 0] 
                                    }}
                                    transition={{ duration: entity.duration + 0.5, ease: "linear" }}
                                    style={{ width: 100, height: 60 }}
                                >
                                    <div style={{ transform: isLeftToRight ? 'none' : 'scaleX(-1)' }}>
                                        <SpaceShip color="#00f3ff" type="scout" />
                                    </div>
                                </motion.div>
                            </div>
                        );
                    }

                    const isLeftToRight = entity.x < 0;
                    return (
                        <motion.div
                            key={entity.id}
                            className="absolute z-20"
                            initial={{ 
                                left: `${entity.x}vw`, 
                                top: `${entity.y}vh`,
                                scale: entity.scale,
                                opacity: 0,
                                rotate: entity.rotation
                            }}
                            animate={{ 
                                left: `${isLeftToRight ? 120 : -20}vw`,
                                opacity: [0, 1, 1, 0],
                                rotate: (entity.rotation || 0) + (isLeftToRight ? 5 : -5)
                            }}
                            transition={{ 
                                duration: entity.duration, 
                                ease: "linear"
                            }}
                            style={{ width: 100, height: 60 }}
                        >
                            <div style={{ transform: isLeftToRight ? 'none' : 'scaleX(-1)' }}>
                                <SpaceShip color={Math.random() > 0.5 ? 'var(--gold)' : '#ffffff'} />
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* 4. Scanning Grid & UI Texture */}
            <div className="absolute inset-0 z-30 opacity-[0.04]">
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px',
                  }}
                />
            </div>

            {/* 5. Depth Overlays */}
            <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
            <div className="absolute inset-0 z-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.06] pointer-events-none mix-blend-overlay" />
        </div>
    );
};

export default LiveBackground;
