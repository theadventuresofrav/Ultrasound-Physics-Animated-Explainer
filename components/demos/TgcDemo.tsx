
import React, { useState } from 'react';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';

const TgcDemo: React.FC = () => {
    const NUM_SLIDERS = 8;
    const [gains, setGains] = useState<number[]>(Array(NUM_SLIDERS).fill(0));

    const handleGainChange = (index: number, value: number) => {
        const newGains = [...gains];
        newGains[index] = value;
        setGains(newGains);
    };

    return (
      <div className="space-y-8">
        <DemoSection
            title="Acoustic Compensation"
            description="TGC adjusts amplification at different depths to equalize the signal loss caused by attenuation."
            objectives={[
                "Analyze depth-dependent gain",
                "Achieve image uniformity",
                "Compensate for signal decay"
            ]}
        >
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-2/3 h-[400px] bg-black rounded-xl relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                    {gains.map((g, i) => (
                        <div key={i} className="absolute left-0 w-full bg-white/20 transition-all" style={{ top: `${i*12.5}%`, height: '12.5%', opacity: g/400 }} />
                    ))}
                </div>
                <div className="w-full lg:w-1/3 bg-black/40 p-6 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Gain_Channel_Stack</h4>
                    <div className="space-y-4">
                        {gains.map((gain, index) => (
                            <input key={index} type="range" min="0" max="100" value={gain} onChange={e => handleGainChange(index, Number(e.target.value))} className="w-full accent-[var(--gold)]" />
                        ))}
                    </div>
                </div>
            </div>
        </DemoSection>
      </div>
    );
};

export default TgcDemo;
