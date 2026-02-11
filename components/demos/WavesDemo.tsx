
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { useUser } from '../../contexts/UserContext';
import { SparklesIcon, TargetIcon } from '../Icons';

const NatureOfSoundWaveSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [attenuation, setAttenuation] = useState(0.5);
  const [showTactical, setShowTactical] = useState(false);
  
  // HUD Stats
  const intensityDecay = useMemo(() => (1 - Math.exp(-attenuation * 2)) * 100, [attenuation]);
  const penetrableDepth = useMemo(() => (12 / (attenuation + 0.1)).toFixed(1), [attenuation]);

  return (
    <DemoSection
      title="Wave Mechanics Lab"
      description="Sound is a mechanical, longitudinal wave that travels by vibrating particles. In this lab, you should learn how acoustic variables like pressure and density change in cycles, and how 'attenuation'—the loss of energy as heat—limits our ability to see deep structures. High attenuation media like bone stop sound quickly, while low attenuation media like fluid allow it to pass easily."
      objectives={[
          "Observe longitudinal particle displacement",
          "Identify regions of high pressure (compression)",
          "Visualize energy decay (attenuation) over distance"
      ]}
      controls={[
          "Energy_Decay_Factor [Attenuation] slider",
          "Tactical_View toggle",
          "Terminate_Beam / Engage_Drive toggle button"
      ]}
    >
      <style>{`
        @keyframes compression-travel { from { left: -20%; } to { left: 120%; } }
        @keyframes pressure-wave-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse-ring { 0% { opacity: 0.5; scale: 1; } 100% { opacity: 0; scale: 1.5; } }
      `}</style>
      
      <div className="bg-[#0c0c0e]/40 rounded-[2.5rem] p-8 overflow-hidden relative border border-white/5 shadow-inner">
        {/* Simulation Header with HUD Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative z-30">
            <div className="flex items-center gap-4">
                <div className="text-[9px] font-black font-mono text-[var(--gold)]/40 uppercase tracking-[0.4em] bg-black/80 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[var(--gold)] animate-pulse shadow-[0_0_10px_var(--gold)]' : 'bg-red-600 shadow-[0_0_10px_red]'}`} />
                    Acoustic_Kernel: <span className={isPlaying ? 'text-white' : 'text-red-500'}>{isPlaying ? 'EMITTING' : 'STANDBY'}</span>
                </div>
                <button 
                    onClick={() => setShowTactical(!showTactical)}
                    className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${showTactical ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                    [ TACTICAL_VIEW_{showTactical ? 'ON' : 'OFF'} ]
                </button>
            </div>
            <ControlButton onClick={() => setIsPlaying(!isPlaying)} secondary className="h-11 px-8 text-[10px] font-black tracking-widest border-white/10 uppercase">
                {isPlaying ? '[ Terminate_Beam ]' : '[ Engage_Drive ]'}
            </ControlButton>
        </div>
        
        {/* Main Particle Chamber */}
        <div className="h-56 relative flex items-center mb-8 border border-white/10 overflow-hidden bg-black rounded-[2rem] shadow-2xl group/sim">
            {/* 10mm Graticule Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-10" />
            
            {/* PZT Transducer Visualization */}
            <motion.div 
                className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] z-30 border-r border-white/10 flex flex-col items-center justify-center gap-1 shadow-2xl"
                animate={isPlaying ? { x: [0, 1.5, 0] } : {}}
                transition={{ duration: 0.04, repeat: Infinity }}
            >
                <div className="w-[2px] h-3/4 bg-cyan-400/20 blur-[2px] absolute right-0" />
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_15px_var(--gold)]" />
                <div className="text-[7px] font-mono text-white/20 absolute bottom-4 rotate-90 whitespace-nowrap uppercase tracking-[0.5em] font-black">KNL_PZT_E4</div>
                
                {isPlaying && (
                    <motion.div 
                        className="absolute right-0 w-8 h-8 rounded-full border border-[var(--gold)]/30"
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
                    />
                )}
            </motion.div>

            {/* Telemetry Overlay HUD */}
            <div className="absolute top-6 right-8 z-40 font-mono text-[9px] text-right space-y-1 opacity-60 group-hover/sim:opacity-100 transition-opacity">
                <p className="text-white/40">BEAM_ENERGY: <span className="text-white font-bold">{(100 - intensityDecay).toFixed(1)}%</span></p>
                <p className="text-white/40">EFF_PENETRATION: <span className="text-cyan-400 font-bold">{penetrableDepth} cm</span></p>
            </div>

            {/* Particle Field with Dynamic Clustering */}
            <div className="absolute inset-0 left-16 z-20 overflow-hidden">
                {Array.from({ length: 220 }).map((_, i) => {
                    const xBase = (i % 22) * 4.5 + 2;
                    const yBase = Math.floor(i / 22) * 10 + 5;
                    const phase = (xBase / 100) * Math.PI * 4;
                    const decay = (xBase / 100) * (attenuation * 1.2);
                    const opacity = Math.max(0.05, 0.5 - decay);

                    return (
                        <motion.div
                            key={i}
                            className={`absolute w-1.5 h-1.5 rounded-full transition-colors duration-500 ${showTactical ? 'bg-cyan-400 shadow-[0_0_5px_currentColor]' : 'bg-white'}`}
                            style={{ top: `${yBase}%`, left: `${xBase}%`, opacity }}
                            animate={isPlaying ? { 
                                // Longitudinal clustering physics
                                x: [0, 15 * Math.sin(phase + Date.now() / 150), 0],
                                scale: showTactical ? [1, 1.2, 1] : 1
                            } : {}}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    );
                })}
            </div>

            {/* Tactical Wavefront Visualization */}
            <AnimatePresence>
                {showTactical && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 left-16 z-25 pointer-events-none"
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div 
                                key={i}
                                className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent shadow-[0_0_15px_cyan]"
                                style={{
                                    animation: `compression-travel 3s linear infinite`,
                                    animationDelay: `${i * 0.6}s`,
                                    animationPlayState: isPlaying ? 'running' : 'paused'
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shadowing / Decayed Zone Visuals */}
            <div className="absolute inset-0 left-16 z-0 bg-gradient-to-r from-transparent via-black/20 to-black/80 pointer-events-none" />
        </div>
        
        {/* Pressure Trace Display */}
        <div className="h-36 relative overflow-hidden bg-[#050505] rounded-3xl border border-white/5 shadow-2xl">
             <div className="absolute inset-0 flex" style={{ width: '200%', animation: 'pressure-wave-scroll 4s linear infinite', animationPlayState: isPlaying ? 'running' : 'paused' }}>
                <svg width="50%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="overflow-visible">
                    <defs>
                        <linearGradient id="waveBriefingAtten" x1="0%" y1="0%" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--gold)" stopOpacity="1" />
                            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path 
                        d="M 0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50" 
                        stroke="url(#waveBriefingAtten)" 
                        strokeWidth={4 - attenuation * 2} 
                        fill="none" 
                        vectorEffect="non-scaling-stroke"
                        className="drop-shadow-[0_0_15px_var(--gold)] transition-all duration-300"
                    />
                </svg>
                <svg width="50%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="overflow-visible">
                    <path d="M 0 50 Q 25 10, 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50" stroke="url(#waveBriefingAtten)" strokeWidth={4 - attenuation * 2} fill="none" vectorEffect="non-scaling-stroke" className="drop-shadow-[0_0_15px_var(--gold)] transition-all duration-300" />
                </svg>
             </div>
            <div className="absolute top-4 left-6 text-[8px] font-black font-mono text-white/30 uppercase tracking-[0.4em] z-20 flex items-center gap-3">
                <div className="w-1 h-3 bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]" /> System_Pressure_Trace
            </div>
            <div className="absolute bottom-4 right-6 text-[8px] font-mono text-cyan-400 uppercase tracking-[0.3em] z-20 animate-pulse font-black">Link: OPTIMAL</div>
        </div>

        {/* Tactical Control Console */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 bg-black/60 p-8 rounded-[2.5rem] border border-white/5 relative">
            <div className="absolute top-0 left-10 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent" />
            
            <div className="space-y-6">
                <div className="flex justify-between items-end px-1">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black font-mono text-white/40 uppercase tracking-[0.4em]">Energy_Decay_Factor</span>
                        <p className="text-[8px] font-mono text-[var(--gold)]/40 uppercase tracking-widest">[ATTENUATION_COEFF]</p>
                    </div>
                    <span className="text-3xl font-black text-white font-mono tracking-tighter tabular-nums">
                        {attenuation.toFixed(2)} 
                        <span className="text-[10px] opacity-30 ml-2 font-light">dB/cm/MHz</span>
                    </span>
                </div>
                <div className="relative pt-2">
                    <input 
                        type="range" min="0.01" max="2.0" step="0.01" 
                        value={attenuation} 
                        onChange={(e) => setAttenuation(parseFloat(e.target.value))} 
                        className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--gold)]" 
                    />
                    <div className="flex justify-between mt-4 text-[8px] font-black font-mono text-white/20 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full" /> Low_Atten (Fluid)</span>
                        <span className="flex items-center gap-2">High_Atten (Lung/Bone) <div className="w-1 h-1 bg-red-500 rounded-full" /></span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center">
                <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5 flex gap-6 items-start relative overflow-hidden group/feedback">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent opacity-0 group-hover/feedback:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0 shadow-inner">
                        <SparklesIcon className="w-7 h-7 text-[var(--gold)]" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div className="w-1 h-1 bg-[var(--gold)] rounded-full animate-ping" />
                            Instructor_Insight
                        </h4>
                        <p className="text-[11px] text-white/40 leading-relaxed font-light italic">
                            "Higher attenuation directly limits our scanning envelope. If your target is beyond <span className="text-white font-bold">{penetrableDepth}cm</span>, you must lower the frequency node."
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DemoSection>
  );
};

// --- Propagation Speed Section with enhanced interactivity ---
const DEFAULT_MEDIA = [
    { id: 'fat', name: 'ADIPOSE_TISSUE', speed: 1450, color: '#f4e4bc' },
    { id: 'soft', name: 'SOFT_PARENCHYMA', speed: 1540, color: '#ffffff' },
    { id: 'muscle', name: 'STRIATED_MUSCLE', speed: 1600, color: '#f87171' },
    { id: 'bone', name: 'CORTICAL_BONE', speed: 4080, color: '#a5f3fc' },
    { id: 'air', name: 'PNEUMATIC_GAS', speed: 330, color: '#94a3b8' },
];

const PropagationSpeedSection: React.FC = () => {
    const { userProfile } = useUser();
    const mediaMatrix = useMemo(() => {
        const custom = userProfile?.systemOverrides.customMedia || [];
        return custom.length > 0 ? custom : DEFAULT_MEDIA;
    }, [userProfile?.systemOverrides.customMedia]);

    const [medium, setMedium] = useState(mediaMatrix[1] || DEFAULT_MEDIA[1]);
    
    useEffect(() => {
        const found = mediaMatrix.find(m => m.id === medium.id);
        if (!found) setMedium(mediaMatrix[0] || DEFAULT_MEDIA[0]);
    }, [mediaMatrix, medium.id]);

    // Speed comparison relative to soft tissue (1540)
    const deviation = ((medium.speed - 1540) / 1540) * 100;
    const animationDuration = 5000 / medium.speed;

    return (
        <DemoSection
            title="Speed Interface"
            description="The goal of this exercise is to understand that propagation speed is determined ONLY by the medium (stiffness and density). The machine is calibrated to 1540 m/s; any deviation in the tissue leads to 'speed error artifacts' where structures are placed at incorrect depths on the screen."
            objectives={[
                "Identify speed variations in different tissues",
                "Recognize how stiffness overcomes density to increase speed",
                "Observe the temporal race against soft-tissue calibration"
            ]}
            controls={[
                "Media_Selection buttons (ADIPOSE, SOFT_PARENCHYMA, STRIATED_MUSCLE, CORTICAL_BONE, PNEUMATIC_GAS)"
            ]}
        >
            <div className="flex flex-col xl:flex-row gap-12">
                <div className="w-full xl:w-2/3">
                    <div className="h-72 bg-black rounded-[3rem] p-10 relative overflow-hidden border border-white/5 shadow-2xl group">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                        
                        {/* Comparison Ghost Node (Soft Tissue) */}
                        <div className="absolute top-1/2 left-12 -translate-y-1/2 w-4 h-4 rounded-full bg-white/5 border border-white/10" style={{ animation: `pulse-race ${5000/1540}s linear infinite` }} />
                        
                        <motion.div 
                            key={medium.name} 
                            className="absolute w-12 h-12 rounded-full top-1/2 -translate-y-1/2 border-4 border-white/20 z-20" 
                            style={{ 
                                backgroundColor: medium.color, 
                                boxShadow: `0 0 50px ${medium.color}66`, 
                                animation: `pulse-race ${animationDuration}s linear infinite` 
                            }} 
                        />
                        
                        <div className="absolute top-10 right-12 text-7xl font-black text-white/[0.02] uppercase tracking-tighter italic select-none group-hover:text-white/[0.05] transition-colors">{medium.name}</div>
                        
                        <div className="absolute bottom-10 left-12 flex flex-col gap-2">
                             <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping shadow-[0_0_15px_#22c55e]" />
                                <span className="text-[10px] font-black font-mono text-white/30 uppercase tracking-[0.5em]">Interface: CALIBRATED</span>
                            </div>
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest pl-5">REF: 1540 m/s [ST_BASE]</p>
                        </div>
                    </div>
                </div>

                <div className="w-full xl:w-1/3 flex flex-col gap-8">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black font-mono text-[var(--gold)]/40 px-2 uppercase tracking-[0.4em]">Matrix_Selection</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
                            {mediaMatrix.map(m => (
                                <button 
                                    key={m.id} 
                                    onClick={() => setMedium(m)} 
                                    className={`px-6 h-14 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-between group/btn ${medium.id === m.id ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]' : 'bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <span>{m.name}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${medium.id === m.id ? 'bg-black' : 'bg-white/10 group-hover/btn:bg-white/30'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-[#0f0f11] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                        <p className="text-[10px] font-black font-mono text-white/30 uppercase tracking-[0.4em] mb-4">Transfer_Rate_Detected</p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-6xl font-black text-white tracking-tighter drop-shadow-lg tabular-nums">{medium.speed}</p>
                            <span className="text-[10px] font-mono text-[var(--gold)] opacity-50 tracking-widest uppercase font-black">M/S</span>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Deviation vs Soft_Tissue</span>
                            <span className={`text-[11px] font-black tabular-nums ${deviation === 0 ? 'text-white/40' : deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const WavesDemo: React.FC = () => {
  return (
    <div className="space-y-24 py-12">
      <NatureOfSoundWaveSection />
      <PropagationSpeedSection />
      <KnowledgeCheck
        moduleId="waves"
        title="Propagation Velocity Core Mastery"
        description="Verify your understanding of how media characteristics dictate the speed of acoustic energy in biological tissue."
        question="Which of the following determines the propagation speed of sound?"
        options={["Frequency", "The Medium", "Amplitude", "The Transducer"]}
        correctAnswer="The Medium"
        explanation="Propagation speed is determined SOLELY by the properties of the medium it travels through, specifically its stiffness and density. It is not affected by the sound source frequency or power."
      />
    </div>
  );
};

export default WavesDemo;
