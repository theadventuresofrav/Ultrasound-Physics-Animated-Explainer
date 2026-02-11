
import React, { useState, useMemo, useCallback } from 'react';
import { motion, useAnimation, useTransform, useMotionValue } from 'framer-motion';
import ControlButton from './ControlButton';

export const PulseEchoPrincipleVisual: React.FC = () => {
    const [isAnimating, setIsAnimating] = useState(false);
    const targetY = useMotionValue(100); 
    const controls = useAnimation();
    const aModeControls = useAnimation();

    const speedOfSound = 1.54; 
    const maxDepthMm = 200; 
    const containerHeight = 256; 

    // Derived values as MotionValues
    const depthMm = useTransform(targetY, [0, containerHeight], [0, maxDepthMm]);
    const timeOfFlight = useTransform(depthMm, (d: number) => (d * 2) / speedOfSound);

    // Transforming MotionValues to strings for display
    const depthString = useTransform(depthMm, (v: number) => `${v.toFixed(1)} mm`);
    const timeString = useTransform(timeOfFlight, (v: number) => `${v.toFixed(1)} µs`);

    const handleSendPulse = useCallback(async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        const targetPosition = targetY.get();
        const durationDown = (targetPosition / containerHeight) * 1.5;
        const durationUp = durationDown;
        
        controls.set({ y: 0, opacity: 1, scale: 1 });
        aModeControls.set({ pathLength: 1 });

        await controls.start({
            y: targetPosition,
            transition: { duration: durationDown, ease: 'linear' }
        });

        controls.start({
            scale: 0.8,
            transition: { duration: 0.1 }
        });
        
        aModeControls.start({
            pathLength: 1 - ((durationDown + durationUp) / 3),
            transition: { duration: durationDown + durationUp, ease: 'linear' }
        });

        await controls.start({
            y: 0,
            transition: { duration: durationUp, ease: 'linear' }
        });
        
        controls.start({ opacity: 0, transition: { duration: 0.2 } });

        setIsAnimating(false);
    }, [isAnimating, targetY, controls, aModeControls]);

    return (
        <div className="bg-gray-800/50 rounded-xl p-4 my-4 not-prose">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4 h-80 flex gap-2">
                    <div className="relative h-full w-full bg-black rounded-lg overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-yellow-400 rounded-b-md"></div>
                        <motion.div
                            drag="y"
                            dragConstraints={{ top: 20, bottom: containerHeight - 20 }}
                            className="absolute left-1/2 -translate-x-1/2 w-10 h-2 bg-cyan-400 rounded-full cursor-grab"
                            style={{ y: targetY }}
                        />
                        <motion.div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-400 rounded-full" style={{ top: 10 }} animate={controls} />
                    </div>
                    <div className="relative h-full w-24 bg-black/50 rounded-lg p-2">
                         <svg width="100%" height="100%" viewBox="0 0 50 100" preserveAspectRatio="none">
                            <motion.path d="M 25 100 V 0" stroke="#facc15" strokeWidth="2" animate={aModeControls} />
                        </svg>
                    </div>
                </div>
                <div className="w-full md:w-1/4 flex flex-col justify-center gap-4">
                    <div className="bg-black/40 p-3 rounded-lg text-center">
                        <p className="text-xs text-white/70">Depth:</p>
                        <motion.span className="font-mono font-bold text-lg text-white">
                            {depthString}
                        </motion.span>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg text-center">
                        <p className="text-xs text-white/70">TOF:</p>
                         <motion.span className="font-mono font-bold text-lg text-white">
                            {timeString}
                        </motion.span>
                    </div>
                    <ControlButton onClick={handleSendPulse} disabled={isAnimating}>
                        {isAnimating ? "Pulsing..." : "Send Pulse"}
                    </ControlButton>
                </div>
            </div>
        </div>
    );
};
