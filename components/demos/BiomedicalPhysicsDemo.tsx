import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import { useUser } from '../../contexts/UserContext';
import { SimulationMedium } from '../../types';
import { SparklesIcon, TargetIcon } from '../Icons';

const DEFAULT_TISSUES: SimulationMedium[] = [
    { id: 'fat', name: 'Fat', speed: 1450, impedance: 1.38, attenuation: 0.63, color: '#fde047' },
    { id: 'liver', name: 'Liver', speed: 1570, impedance: 1.65, attenuation: 0.75, color: '#fb923c' },
    { id: 'muscle', name: 'Muscle', speed: 1580, impedance: 1.70, attenuation: 1.09, color: '#f87171' },
    { id: 'bone', name: 'Bone', speed: 4080, impedance: 7.80, attenuation: 5.0, color: '#d1d5db' },
    { id: 'air', name: 'Air', speed: 330, impedance: 0.0004, attenuation: 12.0, color: '#93c5fd' },
];

const RayleighScatteringSection: React.FC = () => {
    const [frequency, setFrequency] = useState(5); // MHz
    const scatteringIntensity = useMemo(() => Math.pow(frequency, 4), [frequency]);
    
    return (
        <DemoSection
            title="Rayleigh Scattering Lab"
            description="Rayleigh scattering occurs when sound interacts with structures much smaller than its wavelength (like Red Blood Cells). Signal intensity increases proportionally to the 4th power of frequency ($I \propto f^4$)."
            objectives={["Visualize omnidirectional scatter", "Identify frequency dependence", "Observe signal amplitude shifts"]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="h-64 bg-black rounded-[2.5rem] relative overflow-hidden border border-white/10 shadow-inner group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(248,113,113,0.05),transparent)]" />
                    
                    {/* The Ultrasound Beam */}
                    <motion.div 
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-b from-cyan-400/20 via-cyan-400/10 to-transparent blur-sm z-0"
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                    />

                    {/* Scatterers (RBCs) */}
                    {Array.from({ length: 40 }).map((_, i) => {
                        const x = 20 + Math.random() * 60;
                        const y = 20 + Math.random() * 60;
                        const isHit = x > 35 && x < 65;
                        
                        return (
                            <div key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                {isHit && (
                                    <motion.div 
                                        className="absolute inset-[-10px] rounded-full border border-white/20"
                                        animate={{ 
                                            scale: [1, 4], 
                                            opacity: [0.6 * (scatteringIntensity / 600), 0],
                                            borderWidth: [2, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 1.5, 
                                            repeat: Infinity, 
                                            delay: Math.random() * 1.5 
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}

                    <div className="absolute bottom-4 right-6 font-mono text-[8px] text-white/30 uppercase tracking-[0.4em]">Signal_Source: SCATTER</div>
                </div>

                <div className="flex flex-col justify-center space-y-8">
                    <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                        <div className="flex justify-between items-end mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black font-mono text-white/40 uppercase tracking-[0.4em]">Transmit_Frequency</label>
                                <p className="text-[8px] font-mono text-[var(--gold)]/40 uppercase tracking-widest">[F_DRIVE]</p>
                            </div>
                            <span className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">{frequency} <span className="text-sm opacity-20">MHz</span></span>
                        </div>
                        <input 
                            type="range" min="2" max="15" step="0.5" 
                            value={frequency} 
                            onChange={e => setFrequency(Number(e.target.value))} 
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-red-500" 
                        />
                    </div>

                    <div className="bg-[#0c0c0e] p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Scattering_Intensity_Gain</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">
                                {(scatteringIntensity).toFixed(0)}<span className="text-lg ml-1 opacity-20">x</span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-red-500/30 transition-colors">
                            <SparklesIcon className="w-5 h-5 text-red-400 opacity-60" />
                        </div>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const ImpedanceMismatchSection: React.FC<{ tissues: SimulationMedium[] }> = ({ tissues }) => {
    const [t1Id, setT1Id] = useState(tissues[0]?.id || DEFAULT_TISSUES[0].id);
    const [t2Id, setT2Id] = useState(tissues[2]?.id || DEFAULT_TISSUES[2].id);

    const t1 = tissues.find(t => t.id === t1Id) || DEFAULT_TISSUES[0];
    const t2 = tissues.find(t => t.id === t2Id) || DEFAULT_TISSUES[2];

    const { reflection, transmission } = useMemo(() => {
        const rc = Math.pow((t2.impedance - t1.impedance) / (t2.impedance + t1.impedance), 2) * 100;
        return { reflection: rc, transmission: 100 - rc };
    }, [t1, t2]);

    return (
        <DemoSection
            title="Acoustic Impedance Mismatch"
            description="Reflection amplitude is determined by the difference in acoustic impedance ($Z$). A large mismatch causes a strong echo, while a small mismatch allows most sound to pass."
        >
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 h-64 bg-gray-900 rounded-xl relative overflow-hidden flex items-center justify-center">
                    <div className="absolute w-1/2 h-full left-0 border-r border-white/10 flex items-center justify-center" style={{ backgroundColor: `${t1.color}10` }}>
                        <div className="text-center"><p className="font-bold text-white/80">{t1.name}</p><p className="text-[10px] font-mono text-white/40">Z: {t1.impedance}</p></div>
                    </div>
                    <div className="absolute w-1/2 h-full right-0 flex items-center justify-center" style={{ backgroundColor: `${t2.color}10` }}>
                         <div className="text-center"><p className="font-bold text-white/80">{t2.name}</p><p className="text-[10px] font-mono text-white/40">Z: {t2.impedance}</p></div>
                    </div>
                    <div className="relative z-10 w-full px-8 flex justify-between items-center">
                        <div className="w-16 h-1 bg-white/20" />
                        <div className="w-1.5 h-12 bg-white/50" />
                        <div className="w-16 h-1 bg-white/20" />
                    </div>
                </div>
                <div className="w-full md:w-1/3 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <select value={t1Id} onChange={e => setT1Id(e.target.value)} className="bg-black/40 border border-white/10 rounded p-2 text-xs text-white">
                            {tissues.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select value={t2Id} onChange={e => setT2Id(e.target.value)} className="bg-black/40 border border-white/10 rounded p-2 text-xs text-white">
                            {tissues.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl text-center">
                        <p className="text-xs opacity-50 uppercase tracking-widest mb-1">Reflection Strength</p>
                        <p className="text-3xl font-black text-yellow-400">{reflection.toFixed(2)}%</p>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const BiomedicalPhysicsDemo: React.FC = () => {
    const { userProfile } = useUser();
    const media = useMemo(() => {
        const custom = userProfile?.systemOverrides.customMedia || [];
        return custom.length > 0 ? custom : DEFAULT_TISSUES;
    }, [userProfile?.systemOverrides.customMedia]);

    return (
        <div className="space-y-24">
            <RayleighScatteringSection />
            <ImpedanceMismatchSection tissues={media} />
        </div>
    );
};

export default BiomedicalPhysicsDemo;
