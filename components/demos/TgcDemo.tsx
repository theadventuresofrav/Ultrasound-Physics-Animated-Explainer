
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
// Added missing import for KnowledgeCheck component
import KnowledgeCheck from './KnowledgeCheck';
import { useSound } from '../../contexts/SoundContext';
import { TargetIcon, SparklesIcon, BrainIcon } from '../Icons';

const TgcLab: React.FC = () => {
    const NUM_SLIDERS = 8;
    const [gains, setGains] = useState<number[]>(Array(NUM_SLIDERS).fill(30));
    const { playHover, playClick } = useSound();

    const handleGainChange = (index: number, value: number) => {
        const newGains = [...gains];
        newGains[index] = value;
        setGains(newGains);
        playHover();
    };

    const resetMatrix = () => {
        setGains(Array(NUM_SLIDERS).fill(30));
        playClick();
    };

    // Calculate uniformity score - closer to a linear progression is better for compensating attenuation
    const uniformityScore = useMemo(() => {
        // Ideal slope to compensate soft tissue attenuation
        const ideal = Array.from({length: NUM_SLIDERS}, (_, i) => 20 + i * 10);
        const diffs = gains.map((g, i) => Math.abs(g - ideal[i]));
        const avgDiff = diffs.reduce((a, b) => a + b, 0) / NUM_SLIDERS;
        return Math.max(0, 100 - avgDiff);
    }, [gains]);

    return (
        <DemoSection
            title="TGC Normalization Lab"
            description="Sound attenuates (weakens) as it travels deeper. TGC (Time Gain Compensation) restores uniform brightness by selectively amplifying deeper echoes. Adjust the matrix to achieve signal parity."
            objectives={["Restore uniform signal amplitude", "Compensate for acoustic decay", "Optimize depth-dependent gain"]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Oscilloscope Viewport */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="h-96 bg-black rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl group/scope">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                        
                        <div className="absolute top-6 left-8 flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.4em] font-black">Oscilloscope_Live</span>
                        </div>

                        <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute inset-0 z-10" preserveAspectRatio="none">
                            {/* Raw Attenuated Signal (Red Line) */}
                            <path 
                                d={`M 50 20 ${Array.from({length: 20}).map((_, i) => {
                                    const y = 20 + i * 18;
                                    const x = 50 + (100 / (1 + i * 0.2)); // Simulating decay
                                    return `L ${x} ${y}`;
                                }).join(' ')}`}
                                stroke="#ef4444" strokeWidth="1" fill="none" opacity="0.3"
                            />
                            
                            {/* Compensated Signal (Gold Line) */}
                            <motion.path 
                                d={`M 50 20 ${gains.map((g, i) => {
                                    const y = 40 + (i * 45);
                                    // Math to simulate gain effect on the attenuated curve
                                    const rawX = 50 + (100 / (1 + i * 1.5));
                                    const x = rawX + (g * 2);
                                    return `L ${x} ${y}`;
                                }).join(' ')}`}
                                stroke="var(--gold)" strokeWidth="3" fill="none"
                                className="drop-shadow-[0_0_15px_var(--gold)]"
                                transition={{ type: 'spring', stiffness: 100 }}
                            />
                        </svg>

                        <div className="absolute bottom-6 right-8 text-right font-mono text-[8px] space-y-1 opacity-40">
                            <p className="text-red-400 font-bold">Trace_Alpha: RAW_DECAY</p>
                            <p className="text-[var(--gold)] font-bold">Trace_Beta: COMPENSATED</p>
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <BrainIcon className="w-5 h-5 text-white/30" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Calibration_Status</p>
                                <p className="text-sm font-bold text-white uppercase italic">
                                    {uniformityScore > 90 ? 'Matrix_Synchronized' : 'Gain_Mismatch_Detected'}
                                </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Normalization</p>
                            <p className="text-2xl font-black text-cyan-400 tabular-nums">{uniformityScore.toFixed(0)}%</p>
                         </div>
                    </div>
                </div>

                {/* Slider Matrix Panel */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-[#08080a] p-8 rounded-[3rem] border border-white/5 shadow-inner relative group">
                        <div className="absolute top-0 right-10 w-24 h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/20 to-transparent" />
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                            <TargetIcon className="w-4 h-4" /> Gain_Channel_Stack
                        </h4>
                        
                        <div className="flex h-64 items-end justify-between gap-3 px-2">
                            {gains.map((gain, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-4 group/slider">
                                    <div className="h-full w-2 bg-white/5 rounded-full relative overflow-hidden">
                                        <motion.div 
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-[var(--gold)] to-white rounded-full shadow-[0_0_10px_var(--gold)]"
                                            animate={{ height: `${gain}%` }}
                                        />
                                    </div>
                                    <div className="relative h-40 flex items-center justify-center">
                                        <input 
                                            type="range" 
                                            min="0" max="100" 
                                            value={gain} 
                                            onChange={e => handleGainChange(index, Number(e.target.value))} 
                                            className="vertical-range accent-[var(--gold)] cursor-ns-resize"
                                            style={{ 
                                                appearance: 'none',
                                                width: '120px',
                                                height: '2px',
                                                background: 'rgba(255,255,255,0.05)',
                                                transform: 'rotate(-90deg)',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-mono text-white/20 group-hover/slider:text-[var(--gold)] transition-colors">CH_{index + 1}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-white/5">
                            <span className="text-[9px] font-black text-white/20 uppercase italic">Acoustic_Depth_Normalization</span>
                            <ControlButton onClick={resetMatrix} secondary className="h-10 text-[8px] px-6">Reset_Stack</ControlButton>
                        </div>
                    </div>
                    
                    <div className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10 flex items-start gap-5">
                        <SparklesIcon className="w-6 h-6 text-cyan-400 shrink-0" />
                        <p className="text-[11px] text-white/50 leading-relaxed font-light italic">
                            "Notice how the matrix follows a diagonal slope. This is because attenuation is cumulative; deeper echoes need significantly more amplification to match near-field intensity."
                        </p>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const TgcDemo: React.FC = () => {
    return (
        <div className="space-y-8 py-8">
            <TgcLab />
            <KnowledgeCheck
                moduleId="tgc"
                question="Which receiver function is specifically responsible for Time Gain Compensation?"
                options={["Amplification", "Compensation", "Compression", "Demodulation"]}
                correctAnswer="Compensation"
                explanation="Compensation (TGC) is the receiver function that creates an image that is uniformly bright from top to bottom by correcting for attenuation."
            />
        </div>
    );
};

export default TgcDemo;
