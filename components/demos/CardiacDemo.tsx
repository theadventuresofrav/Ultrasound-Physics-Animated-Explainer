
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { TargetIcon, SparklesIcon, BrainIcon } from '../Icons';

const EFVolumeLab: React.FC = () => {
    const [phase, setPhase] = useState<'ED' | 'ES'>('ED');
    const [measuredWidth, setMeasuredWidth] = useState(50); // mm
    const { playClick } = useSound();

    // Physics Logic: Volume approximation (Teichholz or similar simplified)
    // Vol = [7/(2.4+L)] * L^3
    const calculateVolume = (L_mm: number) => {
        const L_cm = L_mm / 10;
        return (7 / (2.4 + L_cm)) * Math.pow(L_cm, 3);
    };

    const edv = calculateVolume(measuredWidth);
    const esv = calculateVolume(measuredWidth * 0.6); // Systole is ~60% of diastole diameter normally
    
    // If we are in ES mode, we use a smaller diameter to show the result
    const currentVol = phase === 'ED' ? calculateVolume(measuredWidth) : calculateVolume(measuredWidth * 0.65);
    const ef = ((edv - esv) / edv) * 100;

    const efStatus = useMemo(() => {
        if (ef < 35) return { label: 'SEVERELY_REDUCED', color: 'text-red-500' };
        if (ef < 50) return { label: 'MILD_REDUCED', color: 'text-orange-400' };
        if (ef > 75) return { label: 'HYPERDYNAMIC', color: 'text-cyan-400' };
        return { label: 'NORMAL_FUNCTION', color: 'text-green-400' };
    }, [ef]);

    return (
        <DemoSection
            title="Cardiac Volume & EF Lab"
            description="Master the Ejection Fraction calculation: EF = [(EDV - ESV) / EDV] × 100. This simulation uses the Parasternal Long Axis (PLAX) dimension to approximate ventricular volumes."
            objectives={["Identify End-Diastolic peaks", "Analyze systolic contraction", "Calculate hemodynamic efficiency"]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-8 space-y-6">
                    {/* PLAX Scanning Viewport */}
                    <div className="h-80 bg-black rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl group/cardiac">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent)]" />
                        <div className="absolute top-4 left-6 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_red]" />
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-[0.4em]">LV_CHAMBER_STREAM</span>
                        </div>

                        {/* Animated Heart Chamber */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div 
                                animate={{ 
                                    scaleX: phase === 'ED' ? 1 : 0.65,
                                    scaleY: phase === 'ED' ? 1 : 0.85,
                                    opacity: phase === 'ED' ? 0.3 : 0.6
                                }}
                                className="w-64 h-48 rounded-[4rem] border-4 border-white/10 relative flex items-center justify-center"
                            >
                                <div className="absolute inset-4 border border-dashed border-white/5 rounded-[3rem]" />
                                <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">Endocardium</div>
                            </motion.div>
                        </div>

                        {/* Interactive Caliper Tool */}
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                             <div className="relative w-64 h-[1px] bg-cyan-400/20">
                                <motion.div 
                                    drag="x"
                                    dragConstraints={{ left: -100, right: 100 }}
                                    className="absolute top-1/2 left-1/2 -translate-y-1/2 w-10 h-10 border-2 border-cyan-400 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center bg-black/40 backdrop-blur-md shadow-[0_0_20px_cyan]"
                                    style={{ x: (measuredWidth - 50) * 2 }}
                                    onDrag={(e, info) => setMeasuredWidth(50 + info.point.x / 10)}
                                >
                                    <TargetIcon className="w-5 h-5 text-cyan-400" />
                                </motion.div>
                             </div>
                        </div>

                        <div className="absolute bottom-6 left-8 font-mono text-[9px] text-white/30 space-y-1">
                            <p>CHAMBER_DIM: {measuredWidth.toFixed(1)} mm</p>
                            <p>PHASE: {phase === 'ED' ? 'DIASTOLE' : 'SYSTOLE'}</p>
                        </div>
                    </div>

                    {/* Volume Trace Graph */}
                    <div className="h-24 bg-[#050505] rounded-2xl border border-white/5 relative overflow-hidden flex items-end px-10 pb-4">
                        <div className="absolute top-2 left-6 text-[8px] font-black text-white/20 uppercase tracking-widest">Volume_Trend_Analysis</div>
                        {Array.from({ length: 40 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-cyan-600/40 to-cyan-400/20 mx-[1px] rounded-t-sm"
                                animate={{ 
                                    height: phase === 'ED' 
                                        ? 10 + Math.sin(i * 0.2) * 5 + 40 
                                        : 10 + Math.sin(i * 0.2) * 5 + 15
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Hemodynamic HUD */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 space-y-8 shadow-inner">
                        <div className="flex gap-4">
                            <ControlButton 
                                onClick={() => { setPhase('ED'); playClick(); }} 
                                secondary={phase !== 'ED'} 
                                fullWidth 
                                className="h-14 font-black"
                            >
                                [ ED_FRAME ]
                            </ControlButton>
                            <ControlButton 
                                onClick={() => { setPhase('ES'); playClick(); }} 
                                secondary={phase !== 'ES'} 
                                fullWidth 
                                className="h-14 font-black"
                            >
                                [ ES_FRAME ]
                            </ControlButton>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">LVIDd_Calibrate</span>
                                <span className="text-xl font-black text-white">{measuredWidth.toFixed(1)} <span className="text-xs opacity-30">mm</span></span>
                            </div>
                            <input 
                                type="range" min="35" max="65" step="0.5" 
                                value={measuredWidth} 
                                onChange={e => setMeasuredWidth(Number(e.target.value))}
                                className="w-full h-1 accent-cyan-400"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
                         <div className={`absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_cyan]`} />
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Ejection_Fraction</p>
                                    <p className="text-5xl font-black text-white tracking-tighter italic tabular-nums">
                                        {ef.toFixed(0)}<span className="text-2xl ml-1 opacity-20">%</span>
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <SparklesIcon className="w-6 h-6 text-[var(--gold)]" />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-white/5">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${efStatus.color}`}>
                                    [{efStatus.label}]
                                </p>
                                <p className="text-[11px] text-white/40 mt-2 italic leading-relaxed">
                                    Computed via Teichholz approximation of sampled LV vectors.
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const CardiacDemo: React.FC = () => {
    return (
        <div className="space-y-24 py-8">
            <EFVolumeLab />
            <KnowledgeCheck
                moduleId="cardiac"
                title="Cardiac Physics Mastery"
                description="Validate your understanding of temporal resolution requirements in high-velocity cardiac environments."
                question="Why is high frame rate (temporal resolution) critical for measuring Ejection Fraction?"
                options={["To improve axial clarity", "To capture rapid valve motion at peak systole", "To increase beam penetration", "To reduce acoustic shadowing"]}
                correctAnswer="To capture rapid valve motion at peak systole"
                explanation="The heart moves rapidly; a low frame rate would miss the exact moment of maximum contraction (End-Systole), leading to an inaccurate volume and EF calculation."
            />
        </div>
    );
};

export default CardiacDemo;
import { useSound } from '../../contexts/SoundContext';
