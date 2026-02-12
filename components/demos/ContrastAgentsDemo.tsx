import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';
import { TargetIcon, SparklesIcon } from '../Icons';

const HarmonicBubbleResonanceSection: React.FC = () => {
    const [mi, setMi] = useState(0.2);

    const isDisrupting = mi >= 0.8;
    const resonanceQuality = mi < 0.4 ? 'Linear' : mi < 0.8 ? 'Nonlinear' : 'Disruptive';

    return (
        <DemoSection
            title="Harmonic Bubble Resonance"
            description="Microbubbles resonate in the sound field. At low MIs, they exhibit nonlinear oscillation, expanding more than they contract—this is the primary source of contrast harmonics."
            objectives={["Observe asymmetric oscillation", "Identify harmonic signal source", "Verify disruption thresholds"]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-64 bg-black rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-inner flex items-center justify-center group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.05),transparent)]" />
                    
                    {/* The Resonating Bubble */}
                    <motion.div
                        animate={isDisrupting ? { 
                            scale: [1, 2, 0], 
                            opacity: [1, 1, 0] 
                        } : {
                            // Asymmetric oscillation: larger expansion than compression
                            scale: [1, 1.4, 0.95, 1],
                        }}
                        transition={isDisrupting ? { duration: 0.3 } : {
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={`w-20 h-20 rounded-full border-4 transition-colors duration-500 ${isDisrupting ? 'bg-red-500/20 border-red-400' : 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]'}`}
                    >
                        {/* Reflective Highlights */}
                        <div className="absolute top-4 left-4 w-4 h-4 bg-white/20 rounded-full" />
                    </motion.div>

                    <div className="absolute bottom-6 left-8 font-mono text-[9px] text-white/30 uppercase tracking-[0.4em]">Signal: {resonanceQuality}</div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-8 shadow-inner">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mechanical_Index</label>
                                    <p className="text-[7px] font-mono text-yellow-400/50 uppercase tracking-widest">[PRESSURE_VAL]</p>
                                </div>
                                <span className="text-3xl font-black text-yellow-400 font-mono">{mi.toFixed(1)}</span>
                            </div>
                            <input 
                                type="range" min="0.1" max="1.5" step="0.1" 
                                value={mi} 
                                onChange={e => setMi(Number(e.target.value))} 
                                className="w-full h-1 accent-yellow-400" 
                            />
                        </div>
                    </div>

                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-3">Acoustic Logic</h4>
                        <p className="text-[11px] text-white/40 italic leading-relaxed">
                            {mi < 0.4 
                                ? "Linear mode: Signal matches fundamental frequency. Minimal diagnostic benefit." 
                                : mi < 0.8 
                                ? "Nonlinear mode: Harmonic signal peak. Optimal for clinical detection." 
                                : "Disruptive mode: Bubble shell breached. Signal lost to background noise."}
                        </p>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const ClinicalPhaseSection: React.FC = () => {
    const [phase, setPhase] = useState<'Pre' | 'Arterial' | 'Venous' | 'Late'>('Pre');
    
    return (
        <div className="mt-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['Pre', 'Arterial', 'Venous', 'Late'] as const).map(p => (
                    <button 
                        key={p} 
                        onClick={() => setPhase(p)}
                        className={`px-4 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${phase === p ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                    >
                        {p} Phase
                    </button>
                ))}
            </div>

            <div className="h-64 bg-[#050505] rounded-[3rem] border border-white/10 relative overflow-hidden flex items-center justify-center group shadow-2xl">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)]" />
                 
                 {/* Organ Parenchyma */}
                 <div className="w-48 h-32 bg-gray-800/40 rounded-full blur-xl" />

                 {/* Focal Lesion */}
                 <motion.div 
                    animate={{ 
                        backgroundColor: phase === 'Arterial' ? '#fde047' : phase === 'Venous' ? '#94a3b8' : phase === 'Late' ? '#0f172a' : '#475569',
                        boxShadow: phase === 'Arterial' ? '0 0 30px rgba(250,204,21,0.6)' : 'none',
                        scale: phase === 'Arterial' ? 1.1 : 1
                    }}
                    transition={{ duration: 1 }}
                    className="w-20 h-20 rounded-full border border-white/10 relative z-10 flex items-center justify-center"
                 >
                    <span className="text-[8px] font-black text-white/20 uppercase">Lesion</span>
                 </motion.div>

                 {/* Bubble Overlay */}
                 <AnimatePresence>
                    {phase !== 'Pre' && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 pointer-events-none"
                        >
                            {Array.from({ length: 30 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                                    style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                                    animate={{ y: [0, -100], opacity: [0, 1, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 3 }}
                                />
                            ))}
                        </motion.div>
                    )}
                 </AnimatePresence>

                 <div className="absolute top-4 left-6 text-[8px] font-mono text-white/30 uppercase tracking-widest">Temporal_Mapping: {phase}</div>
            </div>
        </div>
    );
};

const ContrastAgentsDemo: React.FC = () => {
    return (
        <div className="space-y-24 py-8">
            <HarmonicBubbleResonanceSection />
            <ClinicalPhaseSection />
            <KnowledgeCheck
                moduleId="contrast_agents"
                question="At which Mechanical Index range are you most likely to generate a strong harmonic signal without destroying the contrast bubbles?"
                options={["High MI (> 1.0)", "Low MI (0.1 - 0.4)", "Zero MI", "Infinite MI"]}
                correctAnswer="Low MI (0.1 - 0.4)"
                explanation="Low MIs (typically 0.1 - 0.4) cause nonlinear oscillation which produces harmonics but is below the threshold for bubble disruption."
            />
        </div>
    );
};

export default ContrastAgentsDemo;
