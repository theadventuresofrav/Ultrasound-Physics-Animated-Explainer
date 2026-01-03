
import React, { useState, useMemo } from 'react';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';

const DynamicRangeDemo: React.FC = () => {
    const [dynamicRange, setDynamicRange] = useState(60);

    return (
        <div className="space-y-8">
            <DemoSection
                title="Compression & Contrast"
                description="Dynamic range controls the shades of gray available to the system, directly affecting contrast resolution."
                objectives={[
                    "Identify contrast thresholds",
                    "Analyze signal compression",
                    "Optimize gray scale map"
                ]}
            >
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-2/3 bg-black rounded-xl p-8 flex items-center justify-center border border-white/5">
                        <div className="flex gap-4">
                            {[40, 80, 120, 160].map(base => (
                                <div key={base} className="w-16 h-16 rounded-lg border border-white/10" style={{ backgroundColor: `rgba(255,255,255,${(base/200) * (dynamicRange/100)})` }} />
                            ))}
                        </div>
                    </div>
                    <div className="w-full lg:w-1/3 flex flex-col justify-center gap-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Range_Drive: {dynamicRange} dB</label>
                            <input type="range" min="20" max="100" step="5" value={dynamicRange} onChange={e => setDynamicRange(Number(e.target.value))} className="w-full h-1.5 accent-[var(--gold)] mt-4" />
                        </div>
                    </div>
                </div>
            </DemoSection>
        </div>
    );
};

export default DynamicRangeDemo;
