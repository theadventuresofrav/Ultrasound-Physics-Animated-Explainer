
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { useSound } from '../../contexts/SoundContext';

const GlowingOrb: React.FC<{ color: string, glow: string }> = ({ color, glow }) => (
    <div
        className="w-5 h-5 rounded-full transition-all duration-300"
        style={{
            background: `radial-gradient(circle, white 20%, ${color} 80%)`,
            boxShadow: `0 0 20px 8px ${glow}`,
        }}
    />
);

// --- Section 1: The Range Equation ---
const RangeEquationSection: React.FC = () => {
  const [targetDepthPercent, setTargetDepthPercent] = useState(60);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeOfFlight, setTimeOfFlight] = useState(0);
  const [orbState, setOrbState] = useState({ color: 'rgba(250, 204, 21, 1)', glow: 'rgba(253, 224, 71, 0.7)' });
  
  const animationControls = useAnimation();
  const timelineControls = useAnimation();
  const { playClick, playScan } = useSound();

  const animationDuration = 3; // base duration for 100% depth trip
  const speedOfSound = 1540; // m/s
  const maxDepthCm = 15;

  const calculatedDepth = useMemo(() => {
    return (speedOfSound * (timeOfFlight / 1000) / 2) * 100; // cm
  }, [timeOfFlight]);
  
  const actualTimeOfFlightMs = useMemo(() => {
      return (2 * (targetDepthPercent/100 * maxDepthCm / 100) / speedOfSound) * 1000;
  }, [targetDepthPercent]);

  const handleSendPulse = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeOfFlight(0);
    setOrbState({ color: 'rgba(250, 204, 21, 1)', glow: 'rgba(253, 224, 71, 0.7)' });
    playScan();

    const totalTravelTime = animationDuration * (targetDepthPercent / 100);
    const oneWayTime = totalTravelTime / 2;

    timelineControls.set({ height: '0%' });
    animationControls.set({ y: 0, opacity: 1 });

    // 1. Transmit Phase
    await animationControls.start({
        y: (targetDepthPercent / 100) * 230,
        transition: { duration: oneWayTime, ease: 'linear' }
    });
    
    // 2. Reflect Phase
    setOrbState({ color: 'rgba(34, 211, 238, 1)', glow: 'rgba(103, 232, 249, 0.7)' });
    
    // 3. Receive Phase
    await Promise.all([
        animationControls.start({
            y: 0,
            transition: { duration: oneWayTime, ease: 'linear' }
        }),
        timelineControls.start({
            height: '100%',
            transition: { duration: oneWayTime, ease: 'linear' }
        })
    ]);

    animationControls.start({ opacity: 0 });
    setTimeOfFlight(actualTimeOfFlightMs);
    setIsAnimating(false);
  };

  return (
    <DemoSection
      title="The Range Equation Lab"
      description="Ultrasound machines calculate depth based on the 'round-trip' time of sound. Depth = (Speed × Time) / 2. Manipulate the target to analyze temporal shifts."
    >
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-2/3 flex gap-6">
            <div className="relative h-72 w-full bg-black/60 rounded-[2rem] overflow-hidden p-6 border border-white/10 shadow-inner group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-[var(--gold)] rounded-b-xl z-20 shadow-[0_5px_20px_rgba(212,175,55,0.3)]" />

                {[0, 25, 50, 75, 100].map(p => (
                    <div key={p} className="absolute left-6 text-[8px] font-mono text-white/20 uppercase tracking-widest flex items-center gap-2" style={{ top: `${p === 100 ? 92 : p}%`}}>
                        <div className="w-1 h-[1px] bg-white/20" /> {Math.round(p/100 * maxDepthCm)} CM
                    </div>
                ))}
                
                <motion.div animate={animationControls} className="absolute left-1/2 -translate-x-1/2 top-4 z-10">
                    <GlowingOrb color={orbState.color} glow={orbState.glow} />
                </motion.div>
                
                <motion.div
                    drag="y"
                    dragConstraints={{ top: 20, bottom: 240 }}
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-4 bg-cyan-400/20 border-2 border-cyan-400/80 rounded-full cursor-ns-resize z-20 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center"
                    style={{ top: `${targetDepthPercent}%`, transform: 'translate(-50%, -50%)' }}
                    onDrag={(e, info) => {
                        const newP = Math.max(10, Math.min(90, (info.point.y / 288) * 100));
                        setTargetDepthPercent(newP);
                    }}
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                </motion.div>
            </div>

             <div className="relative w-20 h-72 bg-black/60 rounded-[2rem] overflow-hidden border border-white/10 shadow-inner flex items-end">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/30 transform -rotate-90 origin-center whitespace-nowrap uppercase tracking-[0.4em] z-10">Chronometer</div>
                <motion.div 
                    className="w-full bg-[var(--gold)] opacity-50 shadow-[0_-5px_20px_rgba(212,175,55,0.4)]" 
                    initial={{ height: 0 }} 
                    animate={timelineControls} 
                />
            </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col justify-between">
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-8 shadow-2xl">
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Manual_Override_Depth</label>
                        <span className="text-lg font-black text-[var(--gold)] font-mono">{((targetDepthPercent/100) * maxDepthCm).toFixed(1)} <span className="text-[10px] opacity-40">CM</span></span>
                    </div>
                    <input
                        type="range" min="10" max="90" 
                        value={targetDepthPercent}
                        onChange={(e) => setTargetDepthPercent(Number(e.target.value))}
                        disabled={isAnimating}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--gold)]"
                    />
                </div>

                <ControlButton onClick={handleSendPulse} disabled={isAnimating} fullWidth className="h-16 group">
                    {isAnimating ? (
                        <span className="flex items-center gap-3 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-black" /> ANALYZING_BUFFER
                        </span>
                    ) : 'INITIATE_PULSE_CYCLE'}
                </ControlButton>
            </div>

            <AnimatePresence>
                {timeOfFlight > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/60 p-6 rounded-[2rem] mt-6 border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Telemetry_Result</span>
                            <div className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[8px] text-green-400 font-bold uppercase tracking-widest">Calculated</div>
                        </div>
                        <div className="space-y-4 font-mono">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/30">TIME_FLIGHT:</span>
                                <span className="text-white text-xs font-bold">{timeOfFlight.toFixed(2)} ms</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] text-white/30 mb-1">CALC_DEPTH:</span>
                                <span className="text-[var(--gold)] font-black text-2xl tracking-tighter">{calculatedDepth.toFixed(1)} <span className="text-[10px] opacity-40">CM</span></span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </DemoSection>
  );
};

// --- Section 2: Duty Factor HUD ---
const DutyFactorHUD: React.FC = () => {
    const [prf, setPrf] = useState(4); // kHz
    const [pd, setPd] = useState(1); // microsec
    const { playHover } = useSound();

    const prpMs = 1 / prf; // e.g. 0.25 ms
    const prpMicro = prpMs * 1000; // 250 microsec
    const dutyFactor = (pd / prpMicro) * 100;
    
    return (
        <DemoSection
            title="Duty Factor & Pulse Rhythms"
            description="The Duty Factor is the percentage of time the system is transmitting. For imaging, it's typically < 1%. Higher PRF means less listening time."
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Pulse_Rep_Freq</label>
                            <span className="text-sm font-black text-cyan-400 font-mono">{prf} <span className="text-[10px] opacity-40">KHZ</span></span>
                        </div>
                        <input 
                            type="range" min="1" max="10" step="0.5" 
                            value={prf} 
                            onChange={e => { setPrf(Number(e.target.value)); playHover(); }}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-cyan-400"
                        />
                    </div>
                    <div className="bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Pulse_Duration</label>
                            <span className="text-sm font-black text-[var(--gold)] font-mono">{pd} <span className="text-[10px] opacity-40">µS</span></span>
                        </div>
                        <input 
                            type="range" min="0.5" max="5" step="0.1" 
                            value={pd} 
                            onChange={e => { setPd(Number(e.target.value)); playHover(); }}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[var(--gold)]"
                        />
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col items-center justify-center relative py-6">
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <motion.circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="var(--gold)" 
                                strokeWidth="8" 
                                strokeDasharray="282.7" 
                                animate={{ strokeDashoffset: 282.7 - (282.7 * (dutyFactor / 10)) }} 
                                transition={{ type: 'spring', stiffness: 50 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-white/40 font-mono uppercase tracking-widest mb-1">Duty_Factor</span>
                            <span className="text-4xl font-black text-white tracking-tighter">{dutyFactor.toFixed(2)}%</span>
                        </div>
                    </div>
                    <div className="absolute -inset-4 bg-[var(--gold)]/5 blur-3xl rounded-full pointer-events-none" />
                </div>

                <div className="lg:col-span-1 flex flex-col justify-center">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-white/40 uppercase tracking-widest font-mono">Status:</span>
                            <span className={`font-bold ${dutyFactor > 1 ? 'text-red-400' : 'text-green-400'}`}>{dutyFactor > 1 ? 'UNSAFE_FOR_BIO' : 'OPTIMAL_IMAGING'}</span>
                        </div>
                        <div className="h-[1px] w-full bg-white/10" />
                        <p className="text-xs text-white/60 leading-relaxed font-light italic">
                           "At this cycle rate, the system is listening for { (100 - dutyFactor).toFixed(2) }% of the period. This maximizes range resolution while adhering to ALARA."
                        </p>
                    </div>
                </div>
            </div>
        </DutyFactorHUD>
    );
};

const PulsedWaveDemo: React.FC = () => {
  return (
    <div className="space-y-16 py-4">
      <RangeEquationSection />
      <DutyFactorHUD />
      <KnowledgeCheck
        moduleId="pulsed"
        question="Which of the following is true regarding Duty Factor in clinical ultrasound?"
        options={["It is typically 100%", "It decreases as imaging depth increases", "It increases as PRF decreases", "It is unrelated to Pulse Duration"]}
        correctAnswer="It decreases as imaging depth increases"
        explanation="Duty Factor = Pulse Duration / PRP. As imaging depth increases, the PRP must also increase (to allow for longer listening), which makes the denominator larger and the Duty Factor smaller."
      />
    </div>
  );
};

export default PulsedWaveDemo;
