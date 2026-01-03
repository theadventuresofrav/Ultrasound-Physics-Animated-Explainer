import React, { useState, useMemo } from 'react';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
// Added missing KnowledgeCheck import
import KnowledgeCheck from './KnowledgeCheck';

const BioeffectMechanismsSection: React.FC = () => {
    const [effect, setEffect] = useState<'thermal' | 'mechanical'>('thermal');

    return (
        <DemoSection
            title="Bioeffect Mechanisms"
            description="Ultrasound interacts with tissue via heat (thermal) or bubble energy (mechanical)."
            objectives={[
                "Identify cavitation triggers",
                "Observe thermal absorption",
                "Differentiate bioeffect risks"
            ]}
        >
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 h-64 bg-black rounded-xl p-4 relative flex items-center justify-center border border-white/5">
                    {effect === 'thermal' ? (
                        <div className="flex flex-col items-center">
                            <p className="text-sm font-bold text-red-400 mb-6 uppercase tracking-widest animate-pulse">Tissue_Heating_Active</p>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.2)]" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <p className="text-sm font-bold text-cyan-400 mb-6 uppercase tracking-widest animate-pulse">Cavitation_Transient</p>
                            <div className="w-16 h-16 bg-cyan-400/20 rounded-full border border-cyan-400 animate-bounce" />
                        </div>
                    )}
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
                    <ControlButton onClick={() => setEffect('thermal')} secondary={effect !== 'thermal'}>Thermal Mode</ControlButton>
                    <ControlButton onClick={() => setEffect('mechanical')} secondary={effect !== 'mechanical'}>Mechanical Mode</ControlButton>
                </div>
            </div>
        </DemoSection>
    );
};

const SafetyDemo: React.FC = () => {
  return (
    <div className="space-y-8">
      <BioeffectMechanismsSection />
      <KnowledgeCheck
        question="Which safety index is most associated with the risk of tissue heating?"
        options={["Mechanical Index (MI)", "Pulse Repetition Frequency (PRF)", "Thermal Index (TI)", "Dynamic Range (DR)"]}
        correctAnswer="Thermal Index (TI)"
        explanation="The Thermal Index (TI) is the primary indicator for thermal bioeffects."
      />
    </div>
  );
};

export default SafetyDemo;