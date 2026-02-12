import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import KnowledgeCheck from './KnowledgeCheck';
import { useSound } from '../../contexts/SoundContext';
import { TargetIcon, SparklesIcon, BrainIcon } from '../Icons';
import ControlButton from './ControlButton';

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
      description="Master the Doppler Equation: Δf = (2 * f₀ * v * cosθ) / c. Learn how the Doppler shift is proportional to flow velocity and transducer frequency, but dependent on the cosine of the insonation angle. See how measuring at 90 degrees produces a ZERO shift, regardless of flow speed."
      objectives={[
        "Analyze why 90° produces ZERO shift (cos 90 = 0)",
        "Observe how doubling frequency doubles the measured shift",
        "Correlate red (positive shift) and blue (negative shift) with flow direction"
      ]}
      controls={[
        "Towards/Away direction buttons",
        "Frequency (f₀) MHz slider",
        "Flow Velocity (v) cm/s slider",
        "Insonation Angle (θ) slider"
      ]}
    >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                <div className="space-y-4 sm:space-y-6">
                    {/* Visual Interface */}
                    <div className="relative h-48 sm:h-64 bg-[#050505] rounded-[1.25rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group/vessel">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.02),transparent)]" />
                        
                        {/* The Vessel with Parabolic Flow */}
                        <div className="absolute top-1/2 left-0 right-0 h-12 sm:h-16 -translate-y-1/2 bg-white/5 border-y border-white/5 overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
                            {Array.from({ length: 15 }).map((_, i) => {
                                const yPos = (i / 14) * 80 + 10;
                                const distFromCenter = Math.abs(50 - yPos) / 50;
                                const particleSpeed = (1 - Math.pow(distFromCenter, 2)) * speed;
                                return (
                                    <motion.div
                                        key={`${direction}-${i}`}
                                        className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full blur-[0.5px]"
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
                        <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
                            <div className="w-12 sm:w-16 h-2 sm:h-4 bg-gray-700 rounded-t-lg border-x border-t border-white/20" />
                            <motion.div 
                                className="w-0.5 sm:w-1 h-20 sm:h-32 origin-top relative"
                                style={{ backgroundColor: '#00f3ff' }}
                                animate={{ rotate: angle }}
                                transition={{ type: 'spring', stiffness: 50 }}
                            >
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400 rounded-full blur-md opacity-40" />
                                {/* Angle Indicator */}
                                <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-[7px] sm:text-[8px] font-mono text-cyan-400 font-bold bg-black/80 px-1 rounded border border-cyan-400/30 whitespace-nowrap">
                                    {angle}°
                                </div>
                            </motion.div>
                        </div>

                        {/* Equation HUD */}
                        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 right-4 sm:right-auto bg-black/60 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 space-y-0.5 sm:space-y-1 overflow-hidden">
                             <div className="flex items-center gap-2 text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">
                                <SparklesIcon className="w-2.5 h-2.5 sm:w-3 h-3 text-[var(--gold)]" /> Math_Process
                             </div>
                             <div className="flex items-baseline gap-1 font-mono text-[8px] sm:text-[10px] truncate">
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
                    <div className="h-20 sm:h-24 bg-black rounded-[1rem] sm:rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
                         <div className="absolute top-2 sm:top-3 left-4 sm:left-6 text-[7px] sm:text-[8px] font-black font-mono text-white/20 uppercase tracking-[0.3em] sm:tracking-[0.4em]">Shift_Telemetry</div>
                         <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
                         <svg className="absolute inset-0 w-full h-full p-3 sm:p-4" preserveAspectRatio="none">
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

                <div className="flex flex-col justify-center gap-4 sm:gap-6">
                    {/* Controls HUD */}
                    <div className="bg-white/[0.02] p-5 sm:p-8 rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/5 space-y-5 sm:space-y-6 shadow-inner">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <button 
                                onClick={() => { setDirection('towards'); playClick(); }} 
                                className={`h-11 sm:h-11 rounded-lg sm:rounded-xl border transition-all uppercase text-[8px] sm:text-[9px] font-black tracking-widest ${direction === 'towards' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg' : 'bg-black/40 border-white/10 text-white/20'}`}
                            >
                                [ TOWARDS ]
                            </button>
                            <button 
                                onClick={() => { setDirection('away'); playClick(); }} 
                                className={`h-11 sm:h-11 rounded-lg sm:rounded-xl border transition-all uppercase text-[8px] sm:text-[9px] font-black tracking-widest ${direction === 'away' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg' : 'bg-black/40 border-white/10 text-white/20'}`}
                            >
                                [ AWAY ]
                            </button>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">f₀: Frequency</label>
                                <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono">{transmittedFreq.toFixed(1)} <span className="text-[8px] sm:text-[10px] opacity-40">MHz</span></span>
                            </div>
                            <input type="range" min="2" max="12" step="0.5" value={transmittedFreq} onChange={e => { setTransmittedFreq(Number(e.target.value)); playHover(); }} className="w-full h-1.5 accent-cyan-400 cursor-pointer" />
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">v: Flow_Velocity</label>
                                <span className="text-lg sm:text-xl font-black text-red-400 font-mono">{speed} <span className="text-[8px] sm:text-[10px] opacity-40">cm/s</span></span>
                            </div>
                            <input type="range" min="10" max="250" value={speed} onChange={e => { setSpeed(Number(e.target.value)); playHover(); }} className="w-full h-1.5 accent-red-400 cursor-pointer" />
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">θ: Insonation_Angle</label>
                                <span className="text-lg sm:text-xl font-black text-yellow-400 font-mono">{angle}°</span>
                            </div>
                            <input type="range" min="0" max="90" step="5" value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full h-1.5 accent-yellow-400 cursor-pointer" />
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="bg-[#0c0c0e] p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
                        <div className="space-y-0.5 sm:space-y-1 min-w-0">
                            <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Result_Shift</p>
                            <p className="text-2xl sm:text-4xl font-black text-white tracking-tighter tabular-nums truncate">
                                {dopplerShiftHz > 0 ? '+' : ''}{dopplerShiftHz.toFixed(0)}<span className="text-base sm:text-lg ml-1 opacity-20 uppercase font-mono">Hz</span>
                            </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[var(--gold)]/30 transition-colors shrink-0">
                            <TargetIcon className="w-6 h-6 text-[var(--gold)] opacity-60" />
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

// --- PW Doppler: Spectral Lab with Cardiac Cycle Waveforms ---
const PWDopplerLab: React.FC = () => {
    const [prf, setPrf] = useState(5000);
    const [baseVelocity, setBaseVelocity] = useState(80);
    const [gateX, setGateX] = useState(25); // Position along vessel (0-100)
    const [angle, setAngle] = useState(60);
    const [baseline, setBaseline] = useState(50);
    const [isFrozen, setIsFrozen] = useState(false);
    
    // Caliper states
    const [psvCaliper, setPsvCaliper] = useState<number | null>(null);
    const [edvCaliper, setEdvCaliper] = useState<number | null>(null);
    const [meanCaliper, setMeanCaliper] = useState<number | null>(null);
    const [activeCaliper, setActiveCaliper] = useState<'psv' | 'edv' | 'mean' | null>(null);

    const { playClick, playHover } = useSound();
    const f0 = 2_500_000; // 2.5MHz Doppler probe
    const c = 1540;
    const nyquistLimit = prf / 2;

    const localVelocity = useMemo(() => {
        const stenosisPos = 60;
        const narrowingFactor = 1 + 2.5 * Math.exp(-Math.pow(gateX - stenosisPos, 2) / 100);
        return baseVelocity * narrowingFactor;
    }, [gateX, baseVelocity]);

    const { shiftHz, isAliasing, spectralPoints } = useMemo(() => {
        const angleRad = angle * (Math.PI / 180);
        const cosVal = Math.cos(angleRad);
        const vMs = localVelocity / 100;
        const peakDf = (2 * f0 * vMs * cosVal) / c;
        
        const points: number[] = [];
        const numPoints = 80;
        
        for (let i = 0; i < numPoints; i++) {
            const phase = (i / numPoints) * Math.PI * 4;
            const pulsatility = 0.2 + 0.8 * Math.max(0, 
                Math.pow(Math.sin(phase), 2) * Math.exp(-((phase % Math.PI) / 2))
            );
            
            let val = peakDf * pulsatility * (0.85 + Math.random() * 0.3);
            while (val > nyquistLimit) val -= prf;
            while (val < -nyquistLimit) val += prf;
            points.push(val);
        }

        const aliasingDetected = Math.abs(peakDf) > nyquistLimit;
        return { 
            shiftHz: peakDf, 
            isAliasing: aliasingDetected, 
            spectralPoints: points 
        };
    }, [localVelocity, prf, angle, nyquistLimit]);

    const handleFreezeToggle = () => {
        playClick();
        setIsFrozen(!isFrozen);
        if (isFrozen) {
            setPsvCaliper(null);
            setEdvCaliper(null);
            setMeanCaliper(null);
        }
    };

    const handleDisplayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isFrozen || !activeCaliper) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const percentFromBottom = 100 - (y / rect.height) * 100;
        const valFromBaseline = percentFromBottom - baseline;
        
        if (activeCaliper === 'psv') setPsvCaliper(valFromBaseline);
        if (activeCaliper === 'edv') setEdvCaliper(valFromBaseline);
        if (activeCaliper === 'mean') setMeanCaliper(valFromBaseline);
        playClick();
    };

    const pulsatilityIndex = useMemo(() => {
        if (psvCaliper !== null && edvCaliper !== null && meanCaliper !== null && meanCaliper !== 0) {
            return Math.abs((psvCaliper - edvCaliper) / meanCaliper);
        }
        return null;
    }, [psvCaliper, edvCaliper, meanCaliper]);

    return (
        <DemoSection
            title="PW Spectral Doppler Lab"
            description="Observe pulsatile waveforms and aliasing. [FREEZE] to activate calipers and calculate PI = (PSV - EDV) / Mean."
            objectives={[
                "Determine peak systolic and end diastolic velocities",
                "Visualize and calculate PI index",
                "Identify spectral wrap-around"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6">
                    {/* Vessel & Gate Visualization */}
                    <div className="h-32 bg-[#050505] rounded-[1.25rem] sm:rounded-[2rem] border border-white/10 relative overflow-hidden shadow-inner flex items-center p-4">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                        <svg width="100%" height="60" viewBox="0 0 1000 60" preserveAspectRatio="none" className="relative z-10">
                            <path d="M 0 10 Q 300 10 500 25 Q 600 28 700 25 Q 800 10 1000 10 L 1000 50 Q 800 50 700 35 Q 600 32 500 35 Q 300 50 0 50 Z" fill="#111" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                            {!isFrozen && Array.from({ length: 30 }).map((_, i) => {
                                const startX = (i * 35) % 1000;
                                const isNearStenosis = Math.abs(startX - 600) < 150;
                                return (
                                    <motion.circle key={i} cx={startX} cy={30 + (Math.random() - 0.5) * 15} r="2.5" fill="#ef4444" opacity="0.4" animate={{ x: [startX, startX + 1000] }} transition={{ duration: isNearStenosis ? 0.8 : 3, repeat: Infinity, ease: "linear", delay: i * 0.1 }} />
                                );
                            })}
                        </svg>
                        <div className="absolute top-1/2 -translate-y-1/2 h-20 w-8 border-x-2 border-cyan-400 bg-cyan-400/10 transition-all pointer-events-none" style={{ left: `${gateX}%`, transform: 'translate(-50%, -50%)' }}>
                            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-400" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-cyan-400 text-[7px] font-mono text-cyan-400 px-1 rounded shadow-xl uppercase">Gate</div>
                        </div>
                    </div>

                    {/* Spectral Display */}
                    <div 
                        onClick={handleDisplayClick}
                        className={`h-64 sm:h-80 bg-black rounded-[1.25rem] sm:rounded-[2.5rem] border-2 relative overflow-hidden shadow-2xl transition-all duration-500 cursor-crosshair ${isAliasing ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'border-white/10'} ${isFrozen ? 'ring-2 ring-cyan-500/50' : ''}`}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] sm:bg-[size:40px_40px] pointer-events-none z-10" />
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/40 z-20"><div className="absolute right-4 top-2 text-[7px] font-mono text-red-500 uppercase tracking-widest">+NYQ</div></div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-500/40 z-20"><div className="absolute right-4 bottom-2 text-[7px] font-mono text-red-500 uppercase tracking-widest">-NYQ</div></div>
                        <motion.div className="absolute left-0 right-0 h-[1px] bg-white/40 z-20 shadow-[0_0:10px_white]" animate={{ top: `${100 - baseline}%` }} />

                        {/* Spectral Points */}
                        <div className="absolute inset-0 flex items-end px-4">
                            {spectralPoints.map((val, i) => {
                                const height = Math.abs(val / prf) * 100; 
                                const valRelativeToBaselinePercent = (val / prf) * 100;
                                const bottomOffset = baseline + (val >= 0 ? 0 : valRelativeToBaselinePercent);
                                return (
                                    <div key={i} className={`flex-grow rounded-sm transition-colors duration-300 ${isAliasing ? 'bg-red-500' : 'bg-gradient-to-t from-[var(--gold)]/30 via-[var(--gold)] to-white'}`} style={{ position: 'absolute', left: `${(i / spectralPoints.length) * 90 + 5}%`, width: '0.8%', height: `${height}%`, bottom: `${bottomOffset}%`, opacity: isFrozen ? 0.9 : 1 }} />
                                );
                            })}
                        </div>

                        {isFrozen && (
                            <div className="absolute inset-0 z-30">
                                {psvCaliper !== null && <div className="absolute w-full h-[1px] bg-green-400 shadow-[0_0:8px_green]" style={{ bottom: `${baseline + psvCaliper}%` }}><span className="text-[7px] text-green-400 ml-4 font-black uppercase">PSV</span></div>}
                                {edvCaliper !== null && <div className="absolute w-full h-[1px] bg-cyan-400 shadow-[0_0:8px_cyan]" style={{ bottom: `${baseline + edvCaliper}%` }}><span className="text-[7px] text-cyan-400 ml-4 font-black uppercase">EDV</span></div>}
                                {meanCaliper !== null && <div className="absolute w-full h-[1px] bg-yellow-400 shadow-[0_0:8px_yellow]" style={{ bottom: `${baseline + meanCaliper}%` }}><span className="text-[7px] text-yellow-400 ml-4 font-black uppercase">MEAN</span></div>}
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 sm:left-8 font-mono text-[8px] text-white/30 space-y-0.5 z-30">
                            <p className="text-[var(--gold)]/60 font-bold uppercase tracking-widest mb-1 italic">Spectral_Core</p>
                            <p className="uppercase">Vel: {localVelocity.toFixed(0)} cm/s</p>
                            <p className="uppercase">Stat: {isFrozen ? 'Buffered' : 'Live'}</p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isFrozen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2 justify-center bg-white/5 p-4 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-xl">
                                {(['psv', 'edv', 'mean'] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => { playClick(); setActiveCaliper(type); }}
                                        className={`px-4 py-2 rounded-lg sm:rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeCaliper === type ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-black/40 border-white/10 text-white/40'}`}
                                    >
                                        [ {type} ]
                                    </button>
                                ))}
                                <button onClick={() => { setPsvCaliper(null); setEdvCaliper(null); setMeanCaliper(null); setActiveCaliper(null); playClick(); }} className="px-4 py-2 rounded-lg sm:rounded-xl text-[9px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/30">Clear</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="xl:col-span-4 space-y-4 flex flex-col">
                    <div className="bg-white/[0.02] p-6 sm:p-7 rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner flex-grow">
                        <ControlButton onClick={handleFreezeToggle} fullWidth className={`h-14 sm:h-16 ${isFrozen ? 'bg-cyan-500 text-black ring-4 ring-cyan-500/20' : ''}`}>
                            {isFrozen ? 'Resume_Stream' : 'Freeze_Frame'}
                        </ControlButton>

                        <div className="space-y-3">
                            <label className="text-[8px] sm:text-[9px] font-black text-cyan-400 uppercase tracking-widest">Gate Position</label>
                            <input type="range" min="5" max="95" value={gateX} onChange={e => { setGateX(Number(e.target.value)); !isFrozen && playHover(); }} disabled={isFrozen} className="w-full h-1.5 accent-cyan-400 cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">PRF (Scale)</label>
                            <input type="range" min="1000" max="10000" step="500" value={prf} onChange={e => { setPrf(Number(e.target.value)); !isFrozen && playHover(); }} disabled={isFrozen} className="w-full h-1.5 accent-cyan-400 cursor-pointer" />
                        </div>

                        <div className="space-y-3">
                             <label className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-widest">Doppler Angle (θ)</label>
                            <input type="range" min="0" max="85" step="5" value={angle} onChange={e => { setAngle(Number(e.target.value)); !isFrozen && playHover(); }} disabled={isFrozen} className="w-full h-1.5 accent-yellow-400 cursor-pointer" />
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-6 rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 shadow-[0_0:15px_rgba(34,211,238,0.5)]" />
                        <h4 className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Hemodynamic_Data</h4>
                        <div className="space-y-4 font-mono">
                            <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                                <span className="text-white/20 uppercase">Peak_Systolic</span>
                                <span className="text-green-400 font-bold">{psvCaliper !== null ? (Math.abs(psvCaliper * prf / 1000)).toFixed(1) : '---'} cm/s</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                                <span className="text-white/20 uppercase">End_Diastolic</span>
                                <span className="text-cyan-400 font-bold">{edvCaliper !== null ? (Math.abs(edvCaliper * prf / 1000)).toFixed(1) : '---'} cm/s</span>
                            </div>
                            <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                                <span className="text-[8px] sm:text-[9px] font-black text-yellow-400/80 uppercase">PI_Index</span>
                                <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter tabular-nums">{pulsatilityIndex !== null ? pulsatilityIndex.toFixed(2) : '---'}</span>
                            </div>
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

    const effectiveAngle = 90 - steerAngle; 
    const cosine = Math.cos(effectiveAngle * (Math.PI / 180));
    const intensity = Math.abs(cosine);

    return (
        <DemoSection
            title="Color Steering & Angles"
            description="Observe beam steering in Color Doppler. Tilting the color box minimizes the angle relative to flow, maximizing frequency shift. Perpendicular (90°) incidence results in total signal dropout."
            objectives={[
                "Identify signal dropout at 90-degree angles",
                "Maximize signal intensity via steering",
                "Analyze flow direction via BART"
            ]}
            controls={["Steer_Control slider (-20° to +20°)"]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-10">
                <div className="relative flex flex-col gap-6">
                    <div className="relative h-48 sm:h-64 bg-black rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                        <div className="absolute w-full h-10 sm:h-12 bg-white/5 border-y border-white/5" />
                        
                        <motion.div 
                            className="relative w-40 sm:w-48 h-28 sm:h-32 border-2 border-dashed border-cyan-400/40 rounded bg-white/[0.02] flex items-center justify-center overflow-hidden"
                            animate={{ skewX: steerAngle }}
                            transition={{ type: 'spring', stiffness: 100 }}
                        >
                            <div className="absolute inset-0 flex">
                                <div className="flex-1 bg-red-600 transition-opacity duration-300" style={{ opacity: intensity * 0.6 }} />
                                <div className="flex-1 bg-blue-600 transition-opacity duration-300" style={{ opacity: intensity * 0.6 }} />
                            </div>
                            <div className="relative z-10 text-[7px] font-mono text-cyan-400 tracking-widest uppercase">Steer: {steerAngle}°</div>
                        </motion.div>

                        <div className="absolute top-4 left-6 text-[7px] font-mono text-white/30 uppercase">Eff_Angle: {effectiveAngle.toFixed(0)}°</div>
                    </div>

                    {/* Color Legend HUD */}
                    <div className="bg-black/60 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-3 bg-[var(--gold)]" />
                            <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] italic">Color_Map_Legend</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="w-6 h-6 rounded-lg bg-red-600 shadow-[0_0:10px_rgba(220,38,38,0.5)] shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-white/70 uppercase truncate">Towards</span>
                                    <span className="text-[7px] font-mono text-red-400/80 tracking-tighter truncate">+Shift</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                <div className="w-6 h-6 rounded-lg bg-blue-600 shadow-[0_0:10px_rgba(37,99,235,0.5)] shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-white/70 uppercase truncate">Away</span>
                                    <span className="text-[7px] font-mono text-blue-400/80 tracking-tighter truncate">-Shift</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                                <div className="w-6 h-6 rounded-lg bg-green-500 shadow-[0_0:10px_rgba(34,197,94,0.5)] shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[8px] font-black text-white/70 uppercase truncate">Variance</span>
                                    <span className="text-[7px] font-mono text-green-400/80 tracking-tighter truncate">Turbulence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white/[0.02] p-8 rounded-[1.25rem] sm:rounded-[2.5rem] border border-white/5 shadow-inner">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-4">Steer_Control</label>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-white/30 font-mono">-20°</span>
                            <input 
                                type="range" min="-20" max="20" step="10" 
                                value={steerAngle} 
                                onChange={e => { setSteerAngle(Number(e.target.value)); playHover(); }} 
                                className="flex-grow h-2 accent-cyan-400 cursor-pointer" 
                            />
                            <span className="text-[10px] text-white/30 font-mono">+20°</span>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-white/30 uppercase mb-1">Cos(θ)</p>
                                <p className="text-2xl font-black text-[var(--gold)] font-mono">{cosine.toFixed(2)}</p>
                            </div>
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-center">
                                <p className="text-[8px] text-white/30 uppercase mb-1">Sig_Intensity</p>
                                <p className={`text-2xl font-black font-mono ${intensity > 0.3 ? 'text-green-400' : 'text-red-400'}`}>
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
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      <DopplerEquationLab />
      <PWDopplerLab />
      <ColorDopplerLab />
      <KnowledgeCheck
        moduleId="doppler"
        title="Hemodynamic Principle Review"
        description="Verify your mastery of the Doppler shift relationship and the cosine theta variable."
        question="Which component of the Doppler equation is responsible for the 'dead zone' at 90 degrees?"
        options={["Velocity", "Transmitted Frequency", "Cosine of the Angle", "Speed of Sound"]}
        correctAnswer="Cosine of the Angle"
        explanation="The Doppler shift is multiplied by cos(θ). Since cos(90°) is 0, the entire shift becomes zero, making it impossible to detect flow moving perpendicular to the beam."
      />
    </div>
  );
};

export default DopplerDemo;