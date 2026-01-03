
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Assets (SVGs as Components) ---

const FlyingSaucer = ({ color = "#00f3ff" }: { color?: string }) => (
    <svg viewBox="0 0 100 60" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]">
        <motion.ellipse 
            cx="50" cy="35" rx="15" ry="3" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
            animate={{ rx: [15, 25, 15], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
        <path d="M 30 25 Q 50 5 70 25" fill="#d4d4d4" stroke="#fff" strokeWidth="1" opacity="0.9" />
        <ellipse cx="50" cy="25" rx="45" ry="10" fill="#1a1a1a" stroke="#333" strokeWidth="2" />
        <path d="M 5 25 Q 50 40 95 25" fill="none" stroke="#444" strokeWidth="1" />
        {[15, 32, 50, 68, 85].map((x, i) => (
            <motion.circle 
                key={i} 
                cx={x} cy="25" r="2.5" 
                fill={color}
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
            />
        ))}
        <motion.path 
            d="M 35 30 L 65 30 L 55 45 L 45 45 Z" 
            fill={`url(#beamGrad-${color})`}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.2, repeat: Infinity }}
        />
        <defs>
            <linearGradient id={`beamGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
        </defs>
    </svg>
);

const ScientificProbe = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="45" y="20" width="10" height="60" fill="#333" stroke="#555" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" fill="#1a1a1a" stroke="#fff" strokeWidth="1" />
        <motion.path 
            d="M 50 35 L 30 10 M 50 35 L 70 10" 
            stroke="#facc15" 
            strokeWidth="1" 
            animate={{ rotate: [0, 5, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle 
            cx="50" cy="50" r="5" 
            fill="#facc15" 
            animate={{ opacity: [0.4, 1, 0.4] }} 
            transition={{ duration: 1, repeat: Infinity }}
        />
    </svg>
);

const DataCluster = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
        {[0, 1, 2].map(i => (
            <motion.rect
                key={i}
                x={30 + i * 15}
                y={30 + i * 15}
                width="20"
                height="20"
                fill="none"
                stroke="#00f3ff"
                strokeWidth="1"
                animate={{ rotate: 360, x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
            />
        ))}
    </svg>
);

const GallstoneAsteroid = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
        <path 
            d="M 20 20 Q 40 5 60 20 T 90 50 Q 80 80 50 90 T 10 60 Q 5 40 20 20" 
            fill="#5a5a5a" 
            stroke="#333" 
            strokeWidth="3"
        />
        <circle cx="40" cy="40" r="5" fill="#444" />
        <circle cx="70" cy="60" r="8" fill="#444" />
        <path d="M 10 60 L -20 120 L 120 120 L 90 50" fill="black" opacity="0.3" />
    </svg>
);

const CometArtifact = () => (
    <svg viewBox="0 0 200 50" className="w-full h-full">
        <defs>
            <linearGradient id="cometTail" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
        </defs>
        <motion.rect 
            x="20" y="22" width="180" height="6" 
            fill="url(#cometTail)"
            animate={{ opacity: [0.6, 1, 0.6], width: ["80%", "95%", "80%"] }}
            transition={{ duration: 0.1, repeat: Infinity }}
        />
        <circle cx="20" cy="25" r="8" fill="#fff" filter="drop-shadow(0 0 5px white)" />
    </svg>
);

// --- Types ---

type EntityType = 'ship' | 'stone' | 'comet' | 'probe' | 'cluster';

interface SpaceEntity {
    id: string;
    type: EntityType;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    scale: number;
    duration: number;
    delay: number;
    rotation?: number;
    rotationSpeed?: number;
}

const SpaceBackground: React.FC = () => {
    const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, blink: number}[]>([]);
    const [entities, setEntities] = useState<SpaceEntity[]>([]);

    useEffect(() => {
        const starCount = 80;
        const newStars = Array.from({ length: starCount }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            blink: Math.random() * 2 + 1
        }));
        setStars(newStars);
    }, []);

    useEffect(() => {
        const spawnEvent = () => {
            const seed = Math.random();
            const id = Date.now().toString() + Math.random();
            
            let newEntities: SpaceEntity[] = [];

            if (seed > 0.8) {
                // Event: Flying Saucer Squadron
                const count = 3;
                for (let i = 0; i < count; i++) {
                    newEntities.push({
                        id: `${id}-saucer-${i}`,
                        type: 'ship',
                        startX: -20,
                        startY: Math.random() * 60 + 10 + (i * 15),
                        endX: 120,
                        endY: Math.random() * 70 + 10,
                        scale: Math.random() * 0.3 + 0.7,
                        duration: Math.random() * 5 + 25,
                        delay: i * 3,
                        rotation: Math.random() * 10 - 5
                    });
                }
            } else if (seed > 0.6) {
                // Event: Science Probes
                newEntities.push({
                    id: `${id}-probe`,
                    type: 'probe',
                    startX: Math.random() * 100,
                    startY: -20,
                    endX: Math.random() * 100,
                    endY: 120,
                    scale: 0.6,
                    duration: 40,
                    delay: 0,
                    rotationSpeed: 5
                });
            } else if (seed > 0.45) {
                // Event: Data Cluster
                newEntities.push({
                    id: `${id}-cluster`,
                    type: 'cluster',
                    startX: Math.random() * 80 + 10,
                    startY: 120,
                    endX: Math.random() * 80 + 10,
                    endY: -20,
                    scale: 1,
                    duration: 50,
                    delay: 0
                });
            } else if (seed > 0.25) {
                // Event: Gallstone Field
                const count = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < count; i++) {
                    const fromBackground = Math.random() > 0.5;
                    newEntities.push({
                        id: `${id}-stone-${i}`,
                        type: 'stone',
                        startX: Math.random() * 100,
                        startY: fromBackground ? 40 : -20,
                        endX: Math.random() * 120 - 10,
                        endY: 120,
                        scale: fromBackground ? 0.1 : Math.random() * 0.8 + 0.2,
                        duration: Math.random() * 20 + 20,
                        delay: i * 1.5,
                        rotationSpeed: Math.random() * 30 + 10
                    });
                }
            } else {
                // Event: Comet Artifact (Fast)
                newEntities.push({
                    id: `${id}-comet`,
                    type: 'comet',
                    startX: -10,
                    startY: Math.random() * 60 + 20,
                    endX: 120,
                    endY: Math.random() * 60 + 20,
                    scale: Math.random() * 0.5 + 0.8,
                    duration: 5,
                    delay: 0,
                    rotation: 15
                });
            }

            setEntities(prev => [...prev, ...newEntities]);

            setTimeout(() => {
                setEntities(prev => prev.filter(e => !e.id.startsWith(id)));
            }, 55000); 
        };

        const interval = setInterval(spawnEvent, 4000); 
        spawnEvent();
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#020204]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,243,255,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,55,0.05),transparent_50%)]" />

            {stars.map(star => (
                <motion.div
                    key={star.id}
                    className="absolute bg-white rounded-full opacity-60"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: star.blink, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}

            <AnimatePresence>
                {entities.map(entity => (
                    <motion.div
                        key={entity.id}
                        className="absolute"
                        initial={{ 
                            left: `${entity.startX}vw`, 
                            top: `${entity.startY}vh`,
                            scale: entity.type === 'stone' && entity.scale < 0.2 ? 0 : entity.scale,
                            opacity: 0,
                            rotate: entity.rotation || 0
                        }}
                        animate={{ 
                            left: `${entity.endX}vw`, 
                            top: `${entity.endY}vh`,
                            scale: entity.type === 'stone' && entity.scale < 0.2 ? entity.scale * 10 : entity.scale,
                            opacity: entity.type === 'cluster' ? 0.3 : 1,
                            rotate: entity.rotationSpeed ? entity.rotationSpeed * 10 : entity.rotation
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                            duration: entity.duration, 
                            delay: entity.delay,
                            ease: entity.type === 'ship' ? "easeInOut" : "linear"
                        }}
                        style={{
                            width: entity.type === 'stone' ? 80 : entity.type === 'cluster' ? 150 : 120,
                            height: entity.type === 'stone' ? 80 : 60,
                            zIndex: Math.floor(entity.scale * 10)
                        }}
                    >
                        {entity.type === 'ship' && <FlyingSaucer />}
                        {entity.type === 'stone' && <GallstoneAsteroid />}
                        {entity.type === 'comet' && <CometArtifact />}
                        {entity.type === 'probe' && <ScientificProbe />}
                        {entity.type === 'cluster' && <DataCluster />}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SpaceBackground;
