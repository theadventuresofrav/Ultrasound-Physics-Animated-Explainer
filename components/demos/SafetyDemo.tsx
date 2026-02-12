import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { TargetIcon, BrainIcon } from '../Icons';

const CavitationThresholdLab: React.FC = () => {
    const [pressure, setPressure] = useState(50);
    const [frequency, setFrequency] = useState(5);
    
    const mi = useMemo(() => (pressure / 100 * 2) / Math.sqrt(frequency), [pressure, frequency]);
    const state = mi < 0.3 ? 'Stable' : mi < 0.7 ? 'Active' : 'Transient';

    return (
        <DemoSection
            title="Cavitation Threshold Lab"
            description="The Mechanical Index (MI) predicts non-thermal bioeffects. High pressure and low frequency maximize the risk of transient cavitation (violent bubble collapse)."
            objectives={["Identify the cavitation threshold", "Correlate MI with pressure/frequency", "Analyze bubble collapse dynamics"]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-72 bg-black rounded-[3rem] relative overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent)]" />
                    
                    {/* The Micro-Bubble */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state}
                            initial={{ scale: 0.8 }}
                            animate={state === 'Stable' ? {
                                scale: [1, 1.2, 1],
                                opacity: 0.6
                            } : state === 'Active' ? {
                                scale: [1, 1.5, 0.8, 1.2, 1],
                                opacity: 0.8
                            } : {
                                scale: [1, 3, 0],
                                opacity: [1, 1, 0]
                            }}
                            transition={{
                                duration: state === 'Transient' ? 0.3 : 1,
                                repeat: state === 'Transient' ? 0 : Infinity,
                                ease: "easeInOut"
                            }}
                            className={`w-24 h-24 rounded-full border-4 relative ${state === 'Transient' ? 'bg-red-500/40 border-red-400 shadow-[0_0_40px_red]' : 'bg-cyan-500/20 border-cyan-400'}`}
                        >
                            {state === 'Transient' && (
                                <motion.div 
                                    className="absolute inset-[-50px] border-2 border-red-500 rounded-full"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 3, opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.5 }}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute bottom-6 left-8 flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${state === 'Transient' ? 'bg-red-600 animate-pulse' : 'bg-cyan-500'}`} />
                         <span className="text-[10px] font-black font-mono text-white/30 uppercase tracking-[0.4em]">Status: {state.toUpperCase()}</span>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase">
                                <span>Peak Rarefactional Pressure</span>
                                <span className="text-cyan-400">{pressure}%</span>
                            </div>
                            <input type="range" min="10" max="100" value={pressure} onChange={e => setPressure(Number(e.target.value))} className="w-full h-1 accent-cyan-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase">
                                <span>Drive Frequency</span>
                                <span className="text-yellow-400">{frequency} MHz</span>
                            </div>
                            <input type="range" min="2" max="15" step="0.5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full h-1 accent-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-[#0c0c0e] p-6 rounded-[2.5rem] border border-white/5 flex items-center justify-between shadow-2xl overflow-hidden relative">
                         <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)]" />
                         <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Mechanical_Index_HUD</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{mi.toFixed(2)}</p>
                         </div>
                         {mi > 1.0 && <div className="text-red-500 text-xs font-black animate-pulse uppercase tracking-widest">[ DANGER ]</div>}
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const ThermalAbsorptionVisual: React.FC = () => {
    const [duration, setDuration] = useState(1);
    
    return (
        <DemoSection
            title="Thermal Absorption Simulation"
            description="As sound energy is absorbed by tissue, it is converted to heat. Factors including scan time, duty factor, and focusing influence the Thermal Index (TI)."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="h-64 bg-black rounded-[2.5rem] relative overflow-hidden border border-white/10 flex items-center justify-center">
                    {/* Heating Core */}
                    <motion.div 
                        className="w-32 h-32 rounded-full border border-red-500/20"
                        animate={{ 
                            backgroundColor: duration > 5 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.1)',
                            boxShadow: `0 0 ${duration * 10}px rgba(239, 68, 68, 0.5)`
                        }}
                    />
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-red-400 rounded-full"
                            style={{ 
                                top: `${Math.random() * 80 + 10}%`, 
                                left: `${Math.random() * 80 + 10}%` 
                            }}
                            animate={{ y: [0, -20], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                        />
                    ))}
                    <div className="absolute top-4 left-6 text-[8px] font-mono text-white/30 uppercase tracking-widest">IR_Thermal_Scan</div>
                 </div>
                 <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Exposure Duration [Seconds]</label>
                        <input type="range" min="1" max="60" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full h-1 accent-red-500" />
                    </div>
                    <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/20">
                        <p className="text-xs text-red-200/60 leading-relaxed italic">
                            "Extended dwell time over stationary targets increases local temperature. Monitor TIS/TIB closely."
                        </p>
                    </div>
                 </div>
            </div>
        </DemoSection>
    );
};

const SafetyDemo: React.FC = () => {
  return (
    <div className="space-y-24 py-8">
      <CavitationThresholdLab />
      <ThermalAbsorptionVisual />
      <KnowledgeCheck
        moduleId="safety"
        question="Which safety index is most associated with the risk of transient cavitation?"
        options={["Mechanical Index (MI)", "Pulse Repetition Frequency (PRF)", "Thermal Index (TI)", "Dynamic Range (DR)"]}
        correctAnswer="Mechanical Index (MI)"
        explanation="The Mechanical Index (MI) is the primary predictor of non-thermal bioeffects like cavitation."
      />
    </div>
  );
};

export default SafetyDemo;
