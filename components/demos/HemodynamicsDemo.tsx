import React, { useState, useMemo } from 'react';
// Added missing motion import
import { motion } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import KnowledgeCheck from './KnowledgeCheck';

const PoiseuillesLawSection: React.FC = () => {
    const [stenosisPercent, setStenosisPercent] = useState(0);

    const flowRate = useMemo(() => {
        const radius = 1 - (stenosisPercent / 100);
        return Math.pow(radius, 4) * 100;
    }, [stenosisPercent]);

    return (
        <DemoSection
            title="Flow Dynamics [r⁴]"
            description="Vessel radius is the primary determinant of resistance and flow rate."
            objectives={[
                "Identify radius-flow correlation",
                "Analyze Poiseuille mechanics",
                "Observe stenosis impact"
            ]}
        >
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 h-56 bg-black rounded-xl p-4 flex items-center justify-center relative overflow-hidden border border-white/5">
                    <svg width="100%" height="100%" viewBox="0 0 200 100">
                        <path d="M 0 20 H 200 V 80 H 0 Z" fill="#7f1d1d" opacity="0.3" />
                        <rect x="0" y={20 + stenosisPercent*0.3} width="200" height={60 - stenosisPercent*0.6} fill="#ef4444" opacity="0.4" />
                    </svg>
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Stenosis: {stenosisPercent}%</label>
                        <input type="range" min="0" max="80" value={stenosisPercent} onChange={e => setStenosisPercent(Number(e.target.value))} className="w-full h-1.5 accent-[var(--gold)] mt-2" />
                    </div>
                    <div className="bg-[#0f0f11] p-6 rounded-2xl text-center border border-white/5">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest">Relative_Flow</p>
                        <p className="text-3xl font-black text-white">{flowRate.toFixed(1)}%</p>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const FlowPatternsSection: React.FC = () => {
    const [velocity, setVelocity] = useState(50);
    const isTurbulent = velocity > 150;

    return (
        <DemoSection
            title="Laminar vs Turbulent"
            description="High velocity or post-stenotic regions create chaotic eddy currents."
            objectives={[
                "Identify Reynold's threshold",
                "Analyze spectral broadening",
                "Visualize flow layers"
            ]}
        >
             <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 h-56 bg-black rounded-xl p-4 relative border border-white/5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 border-b border-white/5 flex items-center">
                            <motion.div className="h-1 bg-red-500 rounded-full w-20" animate={{ x: [0, 300], rotate: isTurbulent ? [0, 360, 0] : 0 }} transition={{ repeat: Infinity, duration: 400 / velocity, ease: "linear" }} />
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-1/3 h-56 bg-[#050505] rounded-xl p-6 border border-white/10 flex flex-col items-center justify-center">
                    <p className={`text-xl font-black ${isTurbulent ? 'text-orange-400' : 'text-green-400'}`}>{isTurbulent ? 'TURBULENT' : 'LAMINAR'}</p>
                    <p className="text-[9px] text-white/30 mt-2 font-mono uppercase">Re: {velocity * 12}</p>
                </div>
            </div>
            <input type="range" min="30" max="300" value={velocity} onChange={e => setVelocity(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-yellow-400 mt-6" />
        </DemoSection>
    );
};

const HemodynamicsDemo: React.FC = () => {
    return (
        <div className="space-y-12">
            <PoiseuillesLawSection />
            <FlowPatternsSection />
            <KnowledgeCheck
                moduleId="hemodynamics"
                question="According to Poiseuille's Law, which factor has the greatest effect on blood flow?"
                options={["Blood Viscosity", "Vessel Length", "Pressure Gradient", "Vessel Radius"]}
                correctAnswer="Vessel Radius"
                explanation="Flow is proportional to the radius to the fourth power (r⁴)."
            />
        </div>
    );
};

export default HemodynamicsDemo;