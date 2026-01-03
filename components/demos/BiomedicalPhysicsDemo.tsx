
import React, { useState, useMemo, useEffect } from 'react';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import { useUser } from '../../contexts/UserContext';
import { SimulationMedium } from '../../types';

const DEFAULT_TISSUES: SimulationMedium[] = [
    { id: 'fat', name: 'Fat', speed: 1450, impedance: 1.38, attenuation: 0.63, color: '#fde047' },
    { id: 'liver', name: 'Liver', speed: 1570, impedance: 1.65, attenuation: 0.75, color: '#fb923c' },
    { id: 'muscle', name: 'Muscle', speed: 1580, impedance: 1.70, attenuation: 1.09, color: '#f87171' },
    { id: 'bone', name: 'Bone', speed: 4080, impedance: 7.80, attenuation: 5.0, color: '#d1d5db' },
    { id: 'air', name: 'Air', speed: 330, impedance: 0.0004, attenuation: 12.0, color: '#93c5fd' },
];

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
        <div className="space-y-8">
            <ImpedanceMismatchSection tissues={media} />
        </div>
    );
};

export default BiomedicalPhysicsDemo;
