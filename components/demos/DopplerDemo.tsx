
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import KnowledgeCheck from './KnowledgeCheck';
import { useSound } from '../../contexts/SoundContext';
import { TargetIcon, SparklesIcon, BrainIcon } from '../Icons';

// --- Doppler Equation Lab: Vector Analysis & Parabolic Flow ---
const DopplerEquationLab: React.FC = () => {
    const [direction, setDirection] = useState<'towards' | 'away'>('towards');
    const [speed, setSpeed] = useState(80);
    const [angle, setAngle] = useState(0); 
    const [transmittedFreq, setTransmittedFreq] = useState(5.0);
    const { playClick, playHover } = useSound();

    const SPEED_OF_SOUND_MS = 1540;

    const { dopplerShiftHz, color, cosineValue } = useMemo(() => {
        const angleRad = angle * (Math.PI / 180);
        const cosVal = Math.cos(angleRad);
        const velocityMS = (direction === 'towards' ? 1 : -1) * (speed / 100);
        const freqHz = transmittedFreq * 1_000_000;
        const shift = (2 * freqHz * velocityMS * cosVal) / SPEED_OF_SOUND_MS;
        const colorHex = shift > 0 ? '#f87171' : '#60a5fa';
        return { dopplerShiftHz: shift, color: colorHex, cosineValue: cosVal };
    }, [direction, speed, angle, transmittedFreq]);

    return (
        <DemoSection
            title="Doppler Equation Lab"
            description="The Doppler Shift (Δf) is directly proportional to velocity and frequency, but inversely dependent on the angle's cosine. Δf = (2 * f₀ * v * cosθ) / c."
            objectives={[
                "Identify why 90° produces ZERO shift",
                "Observe frequency's proportional effect on shift",
                "Differentiate Polarity: Red (Towards) vs Blue (Away)"
            ]}
            controls={[
                "Towards/Away direction buttons",
                "Frequency (f₀) MHz slider",
                "Flow Velocity (v) cm/s slider",
                "Insonation Angle (θ) slider"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {/* Visual Interface */}
                    <div className="relative h-64 bg-[#050505] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group/vessel">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.02),transparent)]" />
                        
                        {/* The Vessel with Parabolic Flow */}
                        <div className="absolute top-1/2 left-0 right-0 h-16 -translate-y-1/2 bg-white/5 border-y border-white/5 overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
                            {Array.from({ length: 15 }).map((_, i) => {
                                const yPos = (i / 14) * 80 + 10;
                                const distFromCenter = Math.abs(50 - yPos) / 50;
                                const particleSpeed = (1 - Math.pow(distFromCenter, 2)) * speed;
                                return (
                                    <motion.div
                                        key={`${direction}-${i}`}
                                        className="absolute w-1.5 h-1.5 rounded-full blur-[0.5px]"
                                        style={{ 
                                            backgroundColor: color, 
                                            boxShadow: `0 0 8px ${color}`,
                                            top: `${yPos}%` 
                                        }}
                                        animate={{ x: direction === 'towards' ? [-20, 600] : [600, -20] }}
                                        transition={{ 
                                            duration: 100 / (particleSpeed + 1), 
                                            repeat: Infinity, 
                                            ease: "linear", 
                                            delay: Math.random() * 2 
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* Transducer Beam & Vector Arrow */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                            <div className="w-16 h-4 bg-gray-700 rounded-t-lg border-x border-t border-white/20" />
                            <motion.div 
                                className="w-1 h-32 origin-top relative"
                                style={{ backgroundColor: '#00f3ff' }}
                                animate={{ rotate: angle }}
                                transition={{ type: 'spring', stiffness: 50 }}
                            >
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-md opacity-40" />
                                {/* Angle Indicator */}
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-400 font-bold bg-black/80 px-1 rounded border border-cyan-400/30 whitespace-nowrap">
                                    {angle}°
                                </div>
                            </motion.div>
                        </div>

                        {/* Equation HUD */}
                        <div className="absolute bottom-6 left-8 bg-black/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 space-y-1">
                             <div className="flex items-center gap-2 text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">
                                <SparklesIcon className="w-3 h-3 text-[var(--gold)]" /> Mathematical_Engine
                             </div>
                             <div className="flex items-baseline gap-1 font-mono text-[10px]">
                                <span className="text-white/60">Δf = (2 × </span>
                                <span className="text-cyan-400 font-bold">{transmittedFreq}M</span>
                                <span className="text-white/60"> × </span>
                                <span className="text-red-400 font-bold">{speed}</span>
                                <span className="text-white/60"> × </span>
                                <span className="text-yellow-400 font-bold">{cosineValue.toFixed(2)}</span>
                                <span className="text-white/60">) / 1540</span>
                             </div>
                        </div>
                    </div>

                    {/* Waveform Trace */}
                    <div className="h-24 bg-black rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
                         <div className="absolute top-3 left-6 text-[8px] font-black font-mono text-white/20 uppercase tracking-[0.4em]">Shift_Waveform_Telemetry</div>
                         <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
                         <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none">
                            <motion.path 
                                key={dopplerShiftHz}
                                d={`M 0 40 Q 25 ${40 - (dopplerShiftHz/100)}, 50 40 T 100 40 T 150 40 T 200 40 T 250 40 T 300 40`}
                                stroke={color} 
                                strokeWidth="2" 
                                fill="none"
                                className="drop-shadow-[0_0_8px_currentColor]"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                            />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-6">
                    {/* Controls HUD */}
                    <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => { setDirection('towards'); playClick(); }} 
                                className={`h-11 rounded-xl border transition-all uppercase text-[9px] font-black tracking-widest ${direction === 'towards' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/40 border-white/10 text-white/20'}`}
                            >
                                [ INC: TOWARDS ]
                            </button>
                            <button 
                                onClick={() => { setDirection('away'); playClick(); }} 
                                className={`h-11 rounded-xl border transition-all uppercase text-[9px] font-black tracking-widest ${direction === 'away' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/40 border-white/10 text-white/20'}`}
                            >
                                [ DEC: AWAY ]
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">f₀: Frequency</label>
                                <span className="text-xl font-black text-cyan-400 font-mono">{transmittedFreq.toFixed(1)} <span className="text-[10px] opacity-40">MHz</span></span>
                            </div>
                            <input type="range" min="2" max="12" step="0.5" value={transmittedFreq} onChange={e => { setTransmittedFreq(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-cyan-400 cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">v: Flow_Velocity</label>
                                <span className="text-xl font-black text-red-400 font-mono">{speed} <span className="text-[10px] opacity-40">cm/s</span></span>
                            </div>
                            <input type="range" min="10" max="250" value={speed} onChange={e => { setSpeed(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-red-400 cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">θ: Insonation_Angle</label>
                                <span className="text-xl font-black text-yellow-400 font-mono">{angle}°</span>
                            </div>
                            <input type="range" min="0" max="90" step="5" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full h-1 accent-yellow-400 cursor-pointer" />
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="bg-[#0c0c0e] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Computed_Doppler_Shift</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {dopplerShiftHz > 0 ? '+' : ''}{dopplerShiftHz.toFixed(0)}<span className="text-lg ml-1 opacity-20">Hz</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[var(--gold)]/30 transition-colors">
                            <TargetIcon className="w-5 h-5 text-[var(--gold)] opacity-60" />
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

// --- PW Doppler: Spectral Lab with CRT Sweep ---
const PWDopplerLab: React.FC = () => {
    const [prf, setPrf] = useState(5000);
    const [velocity, setVelocity] = useState(120);
    const [angle, setAngle] = useState(60);
    const [baseline, setBaseline] = useState(50);
    const { playClick, playHover } = useSound();

    const f0 = 2_500_000; // Use a typical 2.5MHz probe for Doppler
    const c = 1540;
    const nyquistLimit = prf / 2;

    const { shift, isAliasing, spectralPoints, cosineValue } = useMemo(() => {
        const angleRad = angle * (Math.PI / 180);
        const cosVal = Math.cos(angleRad);
        const vMs = velocity / 100;
        
        // Doppler Equation: Δf = (2 * f0 * v * cosθ) / c
        const df = (2 * f0 * vMs * cosVal) / c;
        
        // Simulating the spectral trace with aliasing "wrap" logic
        // We generate a distribution of frequencies around the peak shift
        const points: number[] = [];
        for (let i = 0; i < 60; i++) {
            // Add a "envelope" effect to the velocity distribution
            let val = df * (0.8 + Math.random() * 0.4);
            
            // Aliasing logic: Signal wraps to the other side of the baseline if it crosses Nyquist
            // val = frequency shift. nyquist = prf / 2.
            while (val > nyquistLimit) val -= prf;
            while (val < -nyquistLimit) val += prf;
            points.push(val);
        }

        return { 
            shift: df, 
            isAliasing: Math.abs(df) > nyquistLimit, 
            spectralPoints: points,
            cosineValue: cosVal 
        };
    }, [velocity, prf, angle, nyquistLimit]);

    return (
        <DemoSection
            title="PW Spectral Doppler & Aliasing"
            description="Pulsed Wave (PW) Doppler provides depth specificity but is limited by the Nyquist limit (PRF/2). When the shift exceeds this limit, the signal 'aliases' or wraps to the opposite side of the display."
            objectives={[
                "Identify the Nyquist Limit (PRF/2) visually",
                "Observe how increasing Angle (θ) reduces shift",
                "Resolve aliasing by increasing PRF (Scale)"
            ]}
            controls={[
                "PRF (Scale) kHz slider",
                "Input Velocity cm/s slider",
                "Doppler Angle (θ) slider",
                "Baseline Shift slider"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6">
                    {/* Spectral Display */}
                    <div className="h-80 bg-black rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group">
                        {/* CRT Screen FX */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10" />
                        
                        {/* Nyquist Limit Indicators */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/40 z-20">
                             <div className="absolute right-6 top-2 text-[8px] font-mono text-red-500 uppercase tracking-widest">+NYQUIST: {(nyquistLimit/1000).toFixed(1)} kHz</div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500/40 z-20">
                             <div className="absolute right-6 bottom-2 text-[8px] font-mono text-red-500 uppercase tracking-widest">-NYQUIST</div>
                        </div>

                        {/* Baseline */}
                        <motion.div 
                            className="absolute left-0 right-0 h-[1px] bg-white/40 z-20 shadow-[0_0_10px_white]"
                            animate={{ top: `${100 - baseline}%` }}
                        />

                        {/* Spectral Data Visualization */}
                        <div className="absolute inset-0 flex items-end px-4">
                            {spectralPoints.map((val, i) => {
                                // Map frequency shift to display height
                                // Normalized relative to Nyquist
                                const height = Math.abs(val / nyquistLimit) * 50; 
                                const bottomOffset = (val >= 0) 
                                    ? baseline 
                                    : baseline - height;
                                
                                return (
                                    <motion.div
                                        key={i}
                                        className="flex-grow bg-gradient-to-t from-[var(--gold)]/30 via-[var(--gold)] to-white rounded-t-sm"
                                        animate={{ height: `${height}%`, bottom: `${bottomOffset}%` }}
                                        transition={{ duration: 0.1 }}
                                        style={{ position: 'absolute', left: `${(i / 60) * 90 + 5}%`, width: '1.4%' }}
                                    />
                                );
                            })}
                        </div>

                        {/* CRT Sweep Line FX */}
                        <motion.div 
                            className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20"
                            animate={{ left: ['-10%', '110%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Aliasing Alert */}
                        <AnimatePresence>
                            {isAliasing && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-red-600/20 border border-red-600 rounded-xl backdrop-blur-xl z-30 shadow-[0_0_40px_rgba(220,38,38,0.3)]"
                                >
                                    <span className="text-xs font-black text-red-400 uppercase tracking-[0.4em] animate-pulse">! ALIASING_SIGNAL_DETECTED !</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Telemetry Readout */}
                        <div className="absolute bottom-6 left-8 font-mono text-[9px] text-white/30 space-y-1 z-30">
                            <p className="text-[var(--gold)]/60 font-bold uppercase tracking-widest mb-1">Spectral_Analysis_Feed</p>
                            <p>PRF: {(prf/1000).toFixed(1)} kHz</p>
                            <p>NYQUIST: ±{(nyquistLimit/1000).toFixed(1)} kHz</p>
                            <p>RAW_SHIFT: {(shift/1000).toFixed(2)} kHz</p>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-4 flex flex-col justify-center">
                    <div className="bg-white/[0.02] p-7 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
                        {/* PRF Control */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">PRF (Scale)</label>
                                <span className="text-xl font-black text-cyan-400 font-mono">{(prf/1000).toFixed(1)} <span className="text-[10px] opacity-40">kHz</span></span>
                            </div>
                            <input type="range" min="1000" max="10000" step="500" value={prf} onChange={e => { setPrf(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-cyan-400 cursor-pointer" />
                            <div className="flex justify-between text-[7px] text-white/20 font-mono uppercase">
                                <span>Low PRF (Sensitive)</span>
                                <span>High PRF (Fast Flow)</span>
                            </div>
                        </div>

                        {/* Velocity Control */}
                        <div className="space-y-3">
                             <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Input Velocity</label>
                                <span className="text-xl font-black text-red-500 font-mono">{velocity} <span className="text-[10px] opacity-40">cm/s</span></span>
                            </div>
                            <input type="range" min="10" max="350" value={velocity} onChange={e => { setVelocity(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-red-500 cursor-pointer" />
                        </div>

                        {/* Angle Control */}
                        <div className="space-y-3">
                             <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Doppler Angle (θ)</label>
                                <span className="text-xl font-black text-yellow-400 font-mono">{angle}°</span>
                            </div>
                            <input type="range" min="0" max="85" step="5" value={angle} onChange={e => { setAngle(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-yellow-400 cursor-pointer" />
                            <div className="flex justify-between text-[7px] text-white/20 font-mono uppercase">
                                <span>Cos: {cosineValue.toFixed(2)} (High Shift)</span>
                                <span>Cos: ~0 (Low Shift)</span>
                            </div>
                        </div>

                        {/* Baseline Control */}
                        <div className="space-y-3 border-t border-white/5 pt-4">
                             <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Baseline Shift</label>
                                <span className="text-sm font-bold text-white/60">{baseline}%</span>
                            </div>
                            <input type="range" min="10" max="90" value={baseline} onChange={e => { setBaseline(Number(e.target.value)); playHover(); }} className="w-full h-1 accent-white/20 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

// --- Color Doppler Steering Lab ---
const ColorDopplerLab: React.FC = () => {
    const [steerAngle, setSteerAngle] = useState(0);
    const { playClick, playHover } = useSound();

    // Actual Doppler Angle is 90 (perpendicular) minus the steer angle
    const effectiveAngle = 90 - steerAngle; 
    const cosine = Math.cos(effectiveAngle * (Math.PI / 180));
    const intensity = Math.abs(cosine);

    return (
        <DemoSection
            title="Color Steering & Angles"
            description="Color Doppler depends heavily on the angle of insonation. Steering the color box changes the angle relative to the vessel, maximizing the frequency shift and signal intensity."
            objectives={[
                "Identify why perpendicular (90°) is a 'Dead Zone'",
                "Use steering to maximize sensitivity",
                "Observe the BART convention (Blue Away, Red Towards)"
            ]}
            controls={[
                "Steer_Control slider (-20° to +20°)"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="relative h-64 bg-black rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                    {/* Vessel */}
                    <div className="absolute w-full h-12 bg-white/5 border-y border-white/5" />
                    
                    {/* Color Box */}
                    <motion.div 
                        className="relative w-48 h-32 border-2 border-dashed border-cyan-400/40 rounded bg-white/[0.02] flex items-center justify-center overflow-hidden"
                        animate={{ skewX: steerAngle }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <div className="absolute inset-0 flex">
                            <div className="flex-1 bg-red-600 transition-opacity duration-300" style={{ opacity: intensity * 0.6 }} />
                            <div className="flex-1 bg-blue-600 transition-opacity duration-300" style={{ opacity: intensity * 0.6 }} />
                        </div>
                        <div className="relative z-10 text-[7px] font-mono text-cyan-400 tracking-widest uppercase">Steer: {steerAngle}°</div>
                    </motion.div>

                    <div className="absolute top-4 left-6 text-[8px] font-mono text-white/30">EFFECTIVE_ANGLE: {effectiveAngle.toFixed(1)}°</div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-4">Steer_Control</label>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-white/30 font-mono">-20°</span>
                            <input 
                                type="range" min="-20" max="20" step="10" 
                                value={steerAngle} 
                                onChange={e => { setSteerAngle(Number(e.target.value)); playHover(); }} 
                                className="flex-grow h-2 accent-cyan-400 cursor-pointer" 
                            />
                            <span className="text-xs text-white/30 font-mono">+20°</span>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                                <p className="text-[9px] text-white/30 uppercase mb-1">Cos(θ)</p>
                                <p className="text-2xl font-black text-[var(--gold)]">{cosine.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                                <p className="text-[9px] text-white/30 uppercase mb-1">Signal_Int</p>
                                <p className={`text-2xl font-black ${intensity > 0.3 ? 'text-green-400' : 'text-red-400'}`}>
                                    {(intensity * 100).toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const DopplerDemo: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      <DopplerEquationLab />
      <PWDopplerLab />
      <ColorDopplerLab />
      <KnowledgeCheck
        moduleId="doppler"
        question="Which component of the Doppler equation is responsible for the 'dead zone' at 90 degrees?"
        options={["Velocity", "Transmitted Frequency", "Cosine of the Angle", "Speed of Sound"]}
        correctAnswer="Cosine of the Angle"
        explanation="The Doppler shift is multiplied by cos(θ). Since cos(90°) is 0, the entire shift becomes zero, making it impossible to detect flow moving perpendicular to the beam."
      />
    </div>
  );
};

export default DopplerDemo;
