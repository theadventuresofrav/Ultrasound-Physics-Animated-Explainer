
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { motion, AnimatePresence } from 'framer-motion';
import { TargetIcon, SparklesIcon } from '../Icons';

// --- Section 1: Axial Resolution Lab (Refactored for Physical Accuracy) ---
const AxialResolutionSection: React.FC = () => {
    const [frequency, setFrequency] = useState(5); // MHz
    const [cycles, setCycles] = useState(3); // n (damping factor)
    const [targetSeparation, setTargetSeparation] = useState(0.8); // mm
    const [isPulsing, setIsPulsing] = useState(false);

    const SPEED_OF_SOUND = 1540; // m/s
    
    const { wavelength, spl, axialResolution, areResolved, overlapPercent } = useMemo(() => {
        // λ = c / f
        const lambda = (SPEED_OF_SOUND / (frequency * 1_000_000)) * 1000; // mm
        // SPL = n * λ
        const s = cycles * lambda; // mm
        // Axial Resolution = SPL / 2
        const res = s / 2; // mm
        const resolved = targetSeparation > res;
        
        // Calculate visual overlap for the A-mode trace
        // 0% overlap = fully resolved peaks
        // 100% overlap = peaks are on top of each other
        const overlap = Math.max(0, res - targetSeparation);
        const overlapP = (overlap / res) * 100;

        return { 
            wavelength: lambda, 
            spl: s, 
            axialResolution: res, 
            areResolved: resolved,
            overlapPercent: overlapP
        };
    }, [frequency, cycles, targetSeparation]);

    const handlePulse = () => {
        if (isPulsing) return;
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
    };

    return (
        <DemoSection
            title="Axial Resolution Lab (LARRD)"
            description="Axial resolution is the minimum distance between structures along the beam's axis. It is strictly determined by the Spatial Pulse Length (SPL). When structures are closer than SPL/2, their echoes overlap into a single blurred signal."
            objectives={[
                "Identify the SPL / 2 threshold limit",
                "Analyze the relationship between frequency and wavelength",
                "Observe how damping (cycles) controls pulse length"
            ]}
            controls={[
                "Frequency (MHz) slider",
                "Pulse Cycles (n) slider for damping control",
                "Target Separation (mm) slider",
                "Execute Pulse Cycle button"
            ]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Visual Interface */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="h-96 bg-black rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group/sim">
                        {/* Graticule Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                        
                        {/* Transducer PZT */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-x border-b border-white/20 rounded-b-xl z-30 flex items-center justify-center">
                            <div className="w-20 h-1 bg-cyan-400/40 rounded-full blur-[1px]" />
                        </div>

                        {/* Pulse Visualization */}
                        <AnimatePresence>
                            {isPulsing && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: [20, 320], opacity: [0, 1, 1, 0] }}
                                    transition={{ duration: 1.5, ease: "linear" }}
                                    className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                                >
                                    {/* The Pulse Envelope with dynamic cycle density */}
                                    <div className="relative flex flex-col items-center">
                                        <svg width="40" height={spl * 40} viewBox={`0 0 40 ${spl * 40}`} preserveAspectRatio="none" className="overflow-visible">
                                            <defs>
                                                <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="transparent" />
                                                    <stop offset="50%" stopColor="var(--gold)" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                            <motion.path 
                                                d={`M 20 0 ${Array.from({length: cycles * 8}).map((_, i) => {
                                                    const y = (i / (cycles * 8)) * (spl * 40);
                                                    const x = 20 + Math.sin(i * Math.PI / 2) * 15;
                                                    return `L ${x} ${y}`;
                                                }).join(' ')}`}
                                                fill="none"
                                                stroke="url(#pulseGrad)"
                                                strokeWidth="2"
                                                className="drop-shadow-[0_0_10px_var(--gold)]"
                                            />
                                        </svg>
                                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-[8px] font-mono text-[var(--gold)] uppercase tracking-widest whitespace-nowrap bg-black/50 px-2 py-1 rounded border border-[var(--gold)]/20">
                                            SPL: {spl.toFixed(2)}mm
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Point Targets - Visual Merging Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                            <div className="relative">
                                {/* Top Target */}
                                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] z-10 relative" />
                                
                                {/* Bottom Target */}
                                <div 
                                    className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] absolute left-0" 
                                    style={{ 
                                        top: `${targetSeparation * 40}px`,
                                        opacity: 1,
                                        filter: !areResolved ? `blur(${Math.max(0, (axialResolution - targetSeparation) * 5)}px)` : 'none'
                                    }} 
                                />

                                {/* Bridge element to simulate "blob" merging when unresolved */}
                                {!areResolved && (
                                    <div 
                                        className="absolute left-1/2 -translate-x-1/2 w-3 bg-white/40 z-0"
                                        style={{ 
                                            top: '6px', 
                                            height: `${targetSeparation * 40}px`,
                                            filter: 'blur(4px)'
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Telemetry Readout */}
                        <div className="absolute bottom-6 left-8 font-mono text-[9px] text-white/30 space-y-1 z-30">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1 h-3 bg-[var(--gold)]" />
                                <p className="text-white/60 font-black uppercase tracking-widest">Resolution_Telemetry</p>
                            </div>
                            <p>TRANSMIT_FRQ: {frequency.toFixed(1)} MHz</p>
                            <p>CYCLE_COUNT: {cycles} n</p>
                            <p>WAVELENGTH: {wavelength.toFixed(3)} mm</p>
                            <p>RESOLUTION: {axialResolution.toFixed(3)} mm</p>
                        </div>

                        {/* Real-time Status Badge */}
                        <div className="absolute bottom-6 right-8 z-30">
                             <div className={`px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-500 flex items-center gap-3 ${areResolved ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${areResolved ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]'}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{areResolved ? 'Targets_Resolved' : 'Signal_Clutter'}</span>
                             </div>
                        </div>
                    </div>

                    {/* A-Mode Real-time Signal Trace */}
                    <div className="h-32 bg-[#050505] rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl">
                         <div className="absolute top-3 left-6 text-[8px] font-black font-mono text-white/20 uppercase tracking-[0.4em]">Receiver_Signal_Envelope</div>
                         <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
                         
                         <svg className="absolute inset-0 w-full h-full px-12" preserveAspectRatio="none" viewBox="0 0 400 100">
                            {/* Target 1 Peak */}
                            <motion.path 
                                d={`M 150 50 L 175 10 L 200 50`}
                                stroke="var(--gold)"
                                strokeWidth="2"
                                fill="rgba(212,175,55,0.05)"
                                className="transition-all duration-700"
                            />
                            {/* Target 2 Peak (Moves and Merges) */}
                            <motion.path 
                                d={`M ${150 + targetSeparation * 50} 50 L ${175 + targetSeparation * 50} 10 L ${200 + targetSeparation * 50} 50`}
                                stroke="var(--gold)"
                                strokeWidth="2"
                                fill="rgba(212,175,55,0.05)"
                                className="transition-all duration-700"
                                style={{ opacity: areResolved ? 1 : 0.4 }}
                            />
                            
                            {/* The Summation Envelope (High Fidelity) */}
                            {!areResolved && (
                                <motion.path 
                                    d={`M 150 50 Q ${175 + (targetSeparation * 50) / 2} ${Math.max(5, 10 - overlapPercent / 10)}, ${200 + targetSeparation * 50} 50`}
                                    stroke="white"
                                    strokeWidth="1.5"
                                    fill="none"
                                    className="drop-shadow-[0_0_5px_white]"
                                />
                            )}
                         </svg>
                         
                         <div className="absolute bottom-3 right-6 text-[7px] font-mono text-white/20 uppercase tracking-widest">
                             Buffer_State: {areResolved ? 'BIPHASIC' : 'MONOPHASIC_OVERLAP'}
                         </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="xl:col-span-4 flex flex-col justify-center gap-6">
                    <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">f: Frequency</label>
                                <span className="text-xl font-black text-cyan-400 font-mono">{frequency.toFixed(1)} <span className="text-[10px] opacity-40">MHz</span></span>
                            </div>
                            <input type="range" min="2" max="15" step="0.5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full h-1 accent-cyan-400 cursor-pointer" />
                            <p className="text-[8px] text-white/20 uppercase font-mono tracking-tight text-center">Higher Freq = Shorter λ = Better Res</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">n: Pulse Cycles (Damping)</label>
                                <span className="text-xl font-black text-orange-400 font-mono">{cycles} <span className="text-[10px] opacity-40">CYCLES</span></span>
                            </div>
                            <input type="range" min="1" max="8" step="1" value={cycles} onChange={e => setCycles(Number(e.target.value))} className="w-full h-1 accent-orange-400 cursor-pointer" />
                            <div className="flex justify-between text-[7px] text-white/20 font-mono uppercase tracking-widest">
                                <span>High Damping</span>
                                <span>Low Damping</span>
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <div className="flex justify-between items-end px-1">
                                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Target Separation</label>
                                <span className="text-lg font-black text-white font-mono">{targetSeparation.toFixed(2)} mm</span>
                            </div>
                            <input type="range" min="0.1" max="2.0" step="0.05" value={targetSeparation} onChange={e => setTargetSeparation(Number(e.target.value))} className="w-full h-1 accent-white/20 cursor-pointer" />
                        </div>

                        <ControlButton onClick={handlePulse} disabled={isPulsing} fullWidth className="h-14 font-black tracking-[0.2em] uppercase">
                            {isPulsing ? 'Analyzing...' : 'Execute Pulse Cycle'}
                        </ControlButton>
                    </div>

                    {/* Result Summary */}
                    <div className="bg-[#0c0c0e] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-2xl group/result overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)] shadow-[0_0_15px_var(--gold)]" />
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Min_Resolved_Threshold</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {axialResolution.toFixed(3)}<span className="text-lg ml-1 opacity-20">mm</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover/result:border-[var(--gold)]/30 transition-colors">
                            <SparklesIcon className="w-6 h-6 text-[var(--gold)] opacity-40" />
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

// --- Section 2: Lateral Resolution ---
const LateralResolutionSection: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [focalDepth, setFocalDepth] = useState(150); // in pixels
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        setFocalDepth(Math.max(20, Math.min(rect.height - 20, y)));
    }, [isDragging]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const beamPath = `M 40 0 L ${50 - 20 * (1 - focalDepth / 280)} ${focalDepth}, 60 0 L ${50 + 20 * (1 - focalDepth / 280)} ${focalDepth}, 40 0 M 60 0 L ${50 + 20 * (1 - focalDepth / 280)} ${focalDepth}, ${50 + 40 * (focalDepth / 280)} 280, ${50 - 40 * (focalDepth / 280)} 280, ${50 - 20 * (1 - focalDepth / 280)} ${focalDepth}, 40 0`;
    
    const TargetPair: React.FC<{depth: number}> = ({ depth }) => {
        const beamWidthAtDepth = 40 * (1 - Math.abs(focalDepth - depth) / 280);
        const isResolved = beamWidthAtDepth < 15;
        const blur = isResolved ? 0 : 2;
        return (
             <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ top: `${depth}px`, filter: `blur(${blur}px)`, transition: 'filter 0.3s'}}>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
            </div>
        )
    };
    
    return (
        <DemoSection
            title="Lateral Resolution (LATA)"
            description="Lateral resolution is determined by the beam width. It is optimal at the focal point where the beam is narrowest. Drag the focal indicator to analyze side-by-side structures."
            objectives={[
                "Identify the focal zone as the point of best resolution",
                "Observe beam divergence and resolution loss in the far field",
                "Analyze how structure separation relates to beam width"
            ]}
            controls={[
                "Drag the yellow focal marker up or down to reposition the beam's focus"
            ]}
        >
            <div ref={containerRef} className="relative h-80 bg-black/60 rounded-[2rem] border border-white/10 overflow-hidden cursor-ns-resize shadow-inner" onMouseUp={handleMouseUp}>
                <svg width="100%" height="100%" viewBox="0 0 100 280" preserveAspectRatio="none">
                    <path d={beamPath} fill="rgba(249, 115, 22, 0.2)" stroke="rgba(249, 115, 22, 0.5)" strokeWidth="1" />
                </svg>
                <div className="absolute w-full h-0.5 bg-yellow-400/80 border-y border-black" style={{ top: `${focalDepth}px` }}/>
                <div className="absolute left-6 text-[8px] font-black uppercase tracking-[0.4em] text-yellow-400 bg-black/80 px-2 py-1 rounded-lg border border-yellow-400/20" style={{ top: `${focalDepth - 12}px` }}>Focal_Link_Alpha</div>
                <div onMouseDown={() => setIsDragging(true)} className="absolute left-full -translate-x-12 w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black shadow-2xl cursor-ns-resize" style={{ top: `${focalDepth}px`, transform: 'translateY(-50%)' }}>
                    <div className="flex flex-col gap-0.5">
                        <div className="w-3 h-0.5 bg-black" />
                        <div className="w-3 h-0.5 bg-black" />
                        <div className="w-3 h-0.5 bg-black" />
                    </div>
                </div>
                <TargetPair depth={50} />
                <TargetPair depth={150} />
                <TargetPair depth={250} />
            </div>
        </DemoSection>
    );
};

// --- Section 3: Elevational Resolution ---
const ElevationalResolutionSection: React.FC = () => {
    const [isThickSlice, setIsThickSlice] = useState(true);

    return (
        <DemoSection
            title="Elevational Resolution (Slice Thickness)"
            description="The 'forgotten' third dimension. Beam thickness determines if a cystic structure appears empty or filled with echoes (Partial Volume Artifact)."
            objectives={[
                "Visualize beam thickness in 3D space",
                "Identify Partial Volume artifact in cysts",
                "Analyze resolution trade-offs per axis"
            ]}
            controls={[
                "Thick_Slice (Poor) button",
                "Thin_Slice (High) button"
            ]}
        >
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 3D View */}
                    <div className="bg-black/60 rounded-[2rem] p-6 border border-white/10 flex flex-col items-center justify-center shadow-inner" style={{ perspective: '300px' }}>
                        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-8">Volumetric_Profile</p>
                        <div className="relative w-48 h-48" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-20deg)' }}>
                            <div className="absolute w-20 h-32 bg-cyan-400/40 rounded-full top-8 left-12" style={{ transform: 'translateZ(-10px)' }}></div>
                            <div className="absolute w-full h-full bg-orange-500/20 border-2 border-orange-500/30 transition-transform duration-500 rounded-xl" style={{ transform: isThickSlice ? 'translateZ(-30px) scaleY(1.4)' : 'translateZ(-5px) scaleY(0.4)' }}>
                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[7px] font-black text-white/40 uppercase tracking-widest">BEAM_ENVELOPE</div>
                            </div>
                        </div>
                    </div>
                    {/* 2D Ultrasound View */}
                    <div className="bg-black rounded-[2rem] p-6 border border-white/10 flex items-center justify-center shadow-2xl relative group/scan h-64 sm:h-auto">
                        <div className="absolute top-4 left-6 text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Receiver_B_Mode</div>
                         <div className="w-32 h-40 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center overflow-hidden">
                             <div className="w-16 h-16 rounded-full bg-black border border-white/20 relative overflow-hidden flex items-center justify-center">
                                {isThickSlice && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/10 flex items-center justify-center text-[7px] font-black text-white/20 text-center uppercase p-2"
                                    >
                                        Clutter_Artifact
                                    </motion.div>
                                )}
                                <div className="text-[10px] text-white/10 font-bold uppercase tracking-widest">CYST</div>
                             </div>
                         </div>
                         <div className="mt-6 text-center absolute bottom-6">
                            <p className={`text-xs font-black uppercase tracking-widest ${isThickSlice ? 'text-red-400' : 'text-green-400'}`}>
                                {isThickSlice ? '[ Partial_Volume_Active ]' : '[ Image_Clear ]'}
                            </p>
                         </div>
                    </div>
                </div>
                 <div className="w-full lg:w-1/3 flex flex-col justify-center gap-4">
                    <ControlPanel title="Slice_Select" colorClass="text-cyan-400">
                        <div className="flex flex-col gap-3">
                            <ControlButton onClick={() => setIsThickSlice(true)} secondary={!isThickSlice} fullWidth className="h-14">Thick_Slice (Poor)</ControlButton>
                            <ControlButton onClick={() => setIsThickSlice(false)} secondary={isThickSlice} fullWidth className="h-14">Thin_Slice (High)</ControlButton>
                        </div>
                    </ControlPanel>
                    
                    <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                                <TargetIcon className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Physics_Alert</h5>
                                <p className="text-[10px] text-white/40 leading-relaxed font-light italic">
                                    "When the beam envelope is thicker than the structure, surrounding tissue echoes are 'smeared' into the image."
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </DemoSection>
    );
}

const ControlPanel: React.FC<{ title: string, colorClass: string, children: React.ReactNode }> = ({ title, colorClass, children }) => (
    <div className="bg-[#08080a] p-6 rounded-[2rem] space-y-5 border border-white/5 shadow-2xl backdrop-blur-md relative group">
        <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-3 rounded-full ${colorClass.includes('cyan') ? 'bg-cyan-400' : 'bg-orange-400'} shadow-[0_0_10px_currentColor]`} />
            <h4 className={`text-[10px] font-black ${colorClass} font-mono tracking-[0.3em] uppercase`}>{title}</h4>
        </div>
        <div>{children}</div>
    </div>
);

const ResolutionDemo: React.FC = () => {
    return (
        <div className="space-y-24 py-8">
            <AxialResolutionSection />
            <LateralResolutionSection />
            <ElevationalResolutionSection />
            <KnowledgeCheck
                moduleId="resolution"
                question="Which of these factors improves Axial Resolution?"
                options={["Lower Frequency", "Higher Frequency", "Wider Beam Width", "Slower Propagation Speed"]}
                correctAnswer="Higher Frequency"
                explanation="Axial resolution is determined by Spatial Pulse Length (SPL). A higher frequency results in a shorter wavelength, which creates a shorter SPL, thus improving axial resolution (LARRD)."
            />
        </div>
    );
};

export default ResolutionDemo;
