
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
// Import missing TargetIcon
import { TargetIcon } from '../Icons';

const PiezoelectricEffectSection: React.FC = () => {
    const [animationState, setAnimationState] = useState<'idle' | 'sending' | 'receiving'>('idle');

    const handleSend = () => {
        if (animationState !== 'idle') return;
        setAnimationState('sending');
        setTimeout(() => setAnimationState('idle'), 2000);
    };

    const handleReceive = () => {
        if (animationState !== 'idle') return;
        setAnimationState('receiving');
        setTimeout(() => setAnimationState('idle'), 2000);
    };

    return (
        <DemoSection
            title="Piezoelectric Conversion"
            description="PZT crystals convert electrical energy to sound (converse effect) and sound back to electricity (direct effect)."
            objectives={[
                "Visualize energy transduction",
                "Differentiate Transmit vs Receive cycles",
                "Understand dipole alignment mechanics"
            ]}
            controls={[
                "Apply Voltage button (Converse effect)",
                "Apply Pressure button (Direct effect)"
            ]}
        >
            <div className="bg-[#0c0c0e]/60 rounded-3xl p-10 border border-white/5 shadow-inner relative overflow-hidden group">
                {/* HUD Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center h-56 relative z-10">
                    {/* Input System */}
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="text-center space-y-1">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">Module: Pulser</span>
                            <div className="h-1 w-12 bg-yellow-500/20 mx-auto rounded-full" />
                        </div>
                        <div className="relative">
                            <AnimatePresence>
                                {animationState === 'sending' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: [1, 1, 0], scale: 1.8, x: ['-20%', '80%'] }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        className="text-5xl absolute z-10 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]"
                                    >⚡</motion.div>
                                )}
                            </AnimatePresence>
                            <ControlButton onClick={handleSend} disabled={animationState !== 'idle'} secondary className="h-14 px-8 uppercase text-[10px] tracking-widest font-black">Apply Voltage</ControlButton>
                        </div>
                    </div>

                    {/* Transduction Unit */}
                    <div className="flex flex-col items-center justify-center relative">
                        <div className="text-[8px] font-black text-cyan-400/40 uppercase tracking-[0.5em] mb-4">Energy_Conversion_Cell</div>
                        <div className="relative group/crystal">
                            <motion.div
                                animate={{
                                    scaleX: animationState === 'sending' ? [1, 1.15, 0.85, 1] : 1,
                                    scaleY: animationState === 'sending' ? [1, 0.85, 1.15, 1] : 1,
                                    filter: animationState !== 'idle' ? 'brightness(1.5) drop-shadow(0 0 25px rgba(103,232,249,0.5))' : 'brightness(1)',
                                }}
                                transition={{ duration: 0.4, times: [0, 0.3, 0.7, 1], repeat: animationState === 'sending' ? 2 : 0 }}
                                className="w-40 h-16 bg-gradient-to-br from-[#1a1a1a] via-[#333] to-[#1a1a1a] rounded-xl border border-white/20 flex items-center justify-center relative shadow-2xl"
                            >
                                <div className="absolute inset-2 border border-white/5 rounded-lg opacity-40" />
                                <span className="text-[9px] font-black font-mono text-white/50 tracking-[0.4em] uppercase relative z-10">PZT_ARRAY</span>
                                
                                {/* Dynamic Dipole Feedback */}
                                {animationState !== 'idle' && (
                                    <motion.div 
                                        className="absolute inset-0 bg-cyan-400/10 rounded-xl"
                                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ duration: 0.2, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Signal Reception System */}
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="text-center space-y-1">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">Module: Receiver</span>
                            <div className="h-1 w-12 bg-cyan-500/20 mx-auto rounded-full" />
                        </div>
                        <div className="relative">
                            <AnimatePresence>
                                {animationState === 'receiving' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, x: '80%' }}
                                        animate={{ opacity: [1, 1, 0], scale: 1.8, x: ['80%', '-20%'] }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                        className="text-5xl absolute z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)]"
                                    >〰️</motion.div>
                                )}
                            </AnimatePresence>
                            <ControlButton onClick={handleReceive} disabled={animationState !== 'idle'} secondary className="h-14 px-8 uppercase text-[10px] tracking-widest font-black">Apply Pressure</ControlButton>
                        </div>
                    </div>
                </div>
                
                {/* Visual Description HUD */}
                <div className="mt-8 flex justify-center border-t border-white/5 pt-6">
                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        {animationState === 'idle' ? 'System_Ready_for_Transduction' : 
                         animationState === 'sending' ? 'Executing: Converse_Piezoelectric_Effect' : 
                         'Executing: Direct_Piezoelectric_Effect'}
                    </p>
                </div>
            </div>
        </DemoSection>
    );
};

const DampingResolutionSection: React.FC = () => {
    const [damping, setDamping] = useState(70);

    const { pulseCycles, sensitivity, axialResolutionMicrons, isResolved } = useMemo(() => {
        const cycles = Math.max(2, 8 - (damping / 100) * 6);
        const sens = 100 - damping * 0.5;
        // Calculation: 1540 m/s / 5 MHz = 0.3mm wavelength. SPL = cycles * 0.3. Axial Res = SPL/2.
        const wavelength = 0.3; // mm (at 5MHz)
        const spl = cycles * wavelength;
        const res = (spl / 2) * 1000; // in microns
        return {
            pulseCycles: cycles,
            sensitivity: sens,
            axialResolutionMicrons: res,
            isResolved: res < 400 // target separation is 0.4mm
        };
    }, [damping]);

    return (
        <DemoSection
            title="Damping & Resolution"
            description="The backing material shortens the pulse (improving axial resolution) but decreases sensitivity."
            objectives={[
                "Analyze SPL reduction mechanics",
                "Observe the sensitivity trade-off",
                "Calibrate axial precision"
            ]}
            controls={[
                "Backing_Interface_Drive [Damping Efficiency] slider"
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                <div className="space-y-6 flex flex-col">
                    <div className="h-44 bg-black rounded-[2rem] p-6 flex items-center justify-center relative overflow-hidden border border-white/10 shadow-2xl">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.03),transparent)]" />
                         
                         {/* Backing Unit */}
                         <div className="h-28 w-16 bg-[#1a1a1a] rounded-l-2xl border-r border-black relative flex items-center justify-center overflow-hidden" style={{ opacity: 0.3 + damping/140 }}>
                             <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] bg-[size:8px_8px]" />
                             <div className="rotate-90 text-[8px] text-white/20 font-black uppercase tracking-[0.5em] whitespace-nowrap relative z-10">DAMPING_CORE</div>
                         </div>
                         {/* PZT Cell */}
                         <div className="h-28 w-5 bg-gradient-to-b from-cyan-600 to-cyan-400 border-x border-cyan-300 relative z-10">
                             <div className="absolute inset-y-0 right-0 w-[1px] bg-white/40" />
                         </div>
                         {/* Pulse Emission */}
                         <div className="flex-grow flex items-center justify-center relative">
                            <motion.div
                                    animate={{ x: [0, 250], opacity: [1, 1, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0"
                                >
                                    <svg height="60" viewBox={`0 0 ${pulseCycles * 15} 60`}>
                                         <path d={`M0 30 C ${pulseCycles*4} 0, ${pulseCycles*11} 0, ${pulseCycles*15} 30`} stroke="#facc15" strokeWidth="4" fill="none" className="drop-shadow-[0_0_10px_var(--gold)]" />
                                         <path d={`M0 30 C ${pulseCycles*4} 60, ${pulseCycles*11} 60, ${pulseCycles*15} 30`} stroke="#facc15" strokeWidth="4" fill="none" className="drop-shadow-[0_0_10px_var(--gold)]" />
                                    </svg>
                            </motion.div>
                         </div>
                    </div>
                    
                    {/* Real-time Result HUD */}
                    <div className="h-40 bg-[#050505] rounded-[2rem] p-6 relative flex items-center justify-around border border-white/10 shadow-2xl">
                        <div className="text-center">
                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-3">Spatial_Sampling</p>
                            <div className="flex items-center gap-5 transition-all duration-500" style={{ filter: `blur(${Math.max(0, (axialResolutionMicrons - 300) / 100)}px)` }}>
                                <div className="w-2.5 h-16 bg-white shadow-[0_0_15px_white] rounded-full" />
                                <div className="w-2.5 h-16 bg-white shadow-[0_0_15px_white] rounded-full" />
                            </div>
                        </div>
                        <div className="h-16 w-[1px] bg-white/10" />
                        <div className="text-left">
                            <p className="text-[9px] font-black text-[var(--gold)] uppercase tracking-[0.2em] mb-1">Status_Report</p>
                            <h4 className={`text-2xl font-black uppercase tracking-tighter transition-colors ${isResolved ? 'text-green-400' : 'text-red-400'}`}>
                                {isResolved ? 'RESOLVED' : 'CLUTTERED'}
                            </h4>
                            <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">Threshold: 0.4 mm</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-8">
                    <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                        <div className="flex justify-between items-end mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black font-mono text-white/40 uppercase tracking-[0.4em]">Backing_Interface_Drive</label>
                                <p className="text-[8px] font-mono text-[var(--gold)]/40 uppercase tracking-widest">[DAMPING_EFFICIENCY]</p>
                            </div>
                            <span className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">{damping}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={damping} 
                            onChange={e => setDamping(Number(e.target.value))} 
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-400" 
                        />
                        <div className="flex justify-between mt-5 text-[8px] font-black font-mono text-white/20 uppercase tracking-widest px-1">
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-red-500 rounded-full" /> Pure_Ring (Low_Res)</span>
                            <span className="flex items-center gap-2">Dead_Stop (High_Res) <div className="w-1 h-1 bg-green-500 rounded-full" /></span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="p-6 rounded-[2rem] border border-white/5 bg-black/40 shadow-2xl relative overflow-hidden group/stat">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 font-mono">Axial_Res [µm]</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {axialResolutionMicrons.toFixed(0)}
                            </p>
                        </div>
                        <div className="p-6 rounded-[2rem] border border-white/5 bg-black/40 shadow-2xl relative overflow-hidden group/stat">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-400/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 font-mono">Sensitivity [XP]</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {sensitivity.toFixed(0)}<span className="text-sm opacity-20 ml-1">%</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const FrequencySelectionSection: React.FC = () => {
    const [frequency, setFrequency] = useState(7);
    const c = 1540;

    const stats = useMemo(() => {
        const wavelength_mm = (c / (frequency * 1_000_000)) * 1000;
        const cycles = 3;
        const spl = cycles * wavelength_mm;
        const axialPrecision_um = (spl / 2) * 1000;
        const penetrationCm = Math.max(2, 20 - (frequency - 2) * 1.5);
        const resolutionBlur = Math.max(0.1, 4 - (frequency / 15 * 4));
        const gridDensity = frequency * 2;

        return { wavelength_mm, spl, axialPrecision_um, gridDensity, penetrationCm, resolutionBlur };
    }, [frequency]);

    return (
        <DemoSection
            title="Frequency Selection Lab"
            description="Physics Law: Attenuation is directly proportional to frequency ($A \propto f$). High frequencies offer clarity but lack depth."
            objectives={[
                "Identify penetration limits",
                "Analyze resolution thresholds",
                "Select optimal clinical frequency"
            ]}
            controls={[
                "Resonance_Command [Kernel Frequency] MHz slider"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="h-96 bg-black rounded-[3rem] relative overflow-hidden border border-white/10 shadow-2xl group/display">
                    {/* Beam Profile HUD Overlay */}
                    <div className="absolute top-8 left-8 z-30 font-mono text-[9px] space-y-1 text-cyan-400 opacity-60">
                        <p>PULSE_FRQ: {frequency} MHz</p>
                        <p>LAMBDA: {stats.wavelength_mm.toFixed(3)} mm</p>
                    </div>

                    {/* Attenuation Gradient Layer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none z-10" />
                    
                    {/* Resolution Reference Grid - Changes Density with Frequency */}
                    <div 
                        className="absolute inset-0 transition-all duration-700 pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                            backgroundSize: `${200 / stats.gridDensity}px ${200 / stats.gridDensity}px`,
                            opacity: 0.4
                        }}
                    />

                    {/* The Ultrasound Beam Visual */}
                    <div 
                        className="absolute top-0 w-48 h-full left-1/2 -translate-x-1/2 origin-top bg-gradient-to-b from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent blur-md z-0" 
                        style={{ 
                            clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)',
                            maskImage: `linear-gradient(to bottom, black 0%, black ${stats.penetrationCm * 5}%, transparent ${stats.penetrationCm * 6}%)`,
                            WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${stats.penetrationCm * 5}%, transparent ${stats.penetrationCm * 6}%)`
                        }}
                    />

                    {/* Magnified Precision Sample */}
                    <div className="absolute bottom-10 right-10 w-44 h-44 bg-black/80 rounded-3xl border border-white/20 p-6 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl z-40 group-hover/display:scale-105 transition-transform duration-500">
                        <div className="absolute top-3 left-6 flex items-center gap-2">
                            <div className="w-1 h-3 bg-cyan-400" />
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Precision_Extract</span>
                        </div>
                        <div className="flex items-center gap-4 transition-all duration-700" style={{ filter: `blur(${stats.resolutionBlur}px)` }}>
                            <div className="w-2.5 h-16 bg-white rounded-full shadow-[0_0_20px_white]" />
                            <div className="w-2.5 h-16 bg-white rounded-full shadow-[0_0_20px_white]" />
                        </div>
                        <div className="absolute bottom-4 text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest font-bold">
                            Δ: {stats.axialPrecision_um.toFixed(1)} µm
                        </div>
                    </div>
                    
                    {/* Beam Limit Marker */}
                    <div 
                        className="absolute w-full h-[1px] bg-red-500/40 border-t border-dashed border-red-500/60 z-20 flex items-center justify-end px-6 transition-all duration-700"
                        style={{ top: `${stats.penetrationCm * 5}%` }}
                    >
                        <span className="text-[7px] font-mono text-red-400 uppercase tracking-widest bg-black px-2 -translate-y-1/2">Penetration_Floor</span>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-10">
                    <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group/knob">
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/5 to-transparent opacity-0 group-hover/knob:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-end mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">Resonance_Command</label>
                                <p className="text-[8px] font-mono text-[var(--gold)]/40 uppercase tracking-widest">[KERNEL_FREQUENCY]</p>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-[var(--gold)] font-mono tracking-tighter tabular-nums">{frequency}</span>
                                <span className="text-xs font-mono text-white/30 uppercase tracking-widest font-black">MHz</span>
                            </div>
                        </div>
                        <input 
                            type="range" min="2" max="15" step="0.5" 
                            value={frequency} 
                            onChange={e => setFrequency(Number(e.target.value))} 
                            className="w-full h-2.5 bg-white/10 rounded-full appearance-none accent-[var(--gold)] cursor-pointer" 
                        />
                        <div className="flex justify-between mt-6 text-[9px] font-black font-mono text-white/20 uppercase tracking-[0.3em] px-1">
                            <span className="flex items-center gap-2">Max_Penetration <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" /></span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[var(--gold)] rounded-full animate-pulse" /> Max_Precision</span>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-8 rounded-[2.5rem] border border-white/5 flex items-start gap-6 relative shadow-2xl overflow-hidden group/note">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 shadow-inner group-hover/note:scale-110 transition-transform duration-500">
                            <TargetIcon className="w-7 h-7" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h5 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Physics_Alert: Penetration_Loss</h5>
                            <p className="text-[11px] text-white/40 leading-relaxed font-light italic">
                                "Warning: At <span className="text-white font-bold">{frequency} MHz</span>, high scatter coefficients impede deep tissue signal. Use this for superficial scans like thyroid or carotids."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const TransducersDemo: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      <PiezoelectricEffectSection />
      <DampingResolutionSection />
      <FrequencySelectionSection />
      <KnowledgeCheck
        moduleId="transducers"
        question="Which component primarily responsible for improving axial resolution by shortening the pulse?"
        options={["Matching layer", "PZT crystal", "Backing material", "Acoustic lens"]}
        correctAnswer="Backing material"
        explanation="The backing material stops the crystal from ringing for too long, creating a shorter spatial pulse length (SPL), which directly improves axial resolution."
      />
    </div>
  );
};

export default TransducersDemo;
