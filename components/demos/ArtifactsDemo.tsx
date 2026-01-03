
import React, { useState, useMemo, useEffect } from 'react';
/* Added missing motion and useAnimation imports if not already handled by existing context */
import { motion, useAnimation } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import MatchingExercise from './MatchingExercise';
import KnowledgeCheck from './KnowledgeCheck';

const ReverberationSection: React.FC = () => {
  const [distance, setDistance] = useState(40);
  const [isComet, setIsComet] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'running'>('idle');
  const pulseControls = useAnimation();
  const echoControls = useAnimation();

  const handleSendPulse = async () => {
    if (animationState === 'running') return;
    setAnimationState('running');
    pulseControls.set({ y: 0, opacity: 1 });
    echoControls.set({ opacity: 0 });
    const duration = isComet ? 0.2 : 0.6;
    const reflector1Y = 80;
    const reflector2Y = reflector1Y + (isComet ? 10 : distance * 2.5);
    await pulseControls.start({ y: reflector2Y, transition: { duration, ease: 'linear' } });
    await pulseControls.start({ y: 0, transition: { duration, ease: 'linear' } });
    echoControls.start(i => i === 0 ? { opacity: 1, transition: { delay: duration * 2 } } : {});
    await pulseControls.start({ y: reflector2Y, transition: { duration, ease: 'linear' } });
    await pulseControls.start({ y: 0, transition: { duration, ease: 'linear' } });
    echoControls.start(i => i === 1 ? { opacity: 0.7, transition: { delay: duration * 4 } } : {});
    await pulseControls.start({ opacity: 0 });
    setTimeout(() => setAnimationState('idle'), 1000);
  };
  
  const handlePreset = (dist: number, comet: boolean) => {
      setDistance(dist);
      setIsComet(comet);
      setAnimationState('idle');
  }

  return (
    <DemoSection
      title="Reverberation & Path Errors"
      description="The pulse bounces multiple times between strong reflectors, creating artifactual deeper echoes."
      objectives={[
          "Identify path misinterpretation",
          "Differentiate Comet-tail vs Ring-down",
          "Understand specular reflection mechanics"
      ]}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 flex gap-4">
            <div className="relative h-96 w-2/3 bg-black rounded-xl overflow-hidden p-4 border border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-yellow-400 rounded-b-md"></div>
                <div className="absolute left-0 right-0 h-1 bg-white/40 rounded-full" style={{ top: `25%` }}></div>
                <div className="absolute left-0 right-0 h-1 bg-white/40 rounded-full" style={{ top: `${25 + (isComet ? 3 : distance)}%` }}></div>
                <motion.div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 rounded-full" initial={{ y: 0, opacity: 0 }} animate={pulseControls} />
            </div>
            <div className="relative h-96 w-1/3 bg-black/50 rounded-xl overflow-hidden p-2 border border-white/5">
                <div className="absolute top-2 left-2 text-[8px] font-mono text-white/20 uppercase tracking-widest">Temporal_Buffer</div>
                <motion.div custom={0} animate={echoControls} initial={{ opacity: 0 }} className="absolute w-full h-1 bg-green-400" style={{ top: `25%` }} />
                <motion.div custom={1} animate={echoControls} initial={{ opacity: 0 }} className={`absolute w-full h-1 bg-red-500`} style={{ top: `${25 + (isComet ? 6 : distance * 2)}%` }} />
            </div>
        </div>
        <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
            <ControlButton onClick={() => handlePreset(40, false)}>Reverberation</ControlButton>
            <ControlButton onClick={() => handlePreset(5, true)} secondary>Comet-Tail</ControlButton>
            {/* Fixed handleSendPulse to onClick to match ControlButton API */}
            <ControlButton onClick={handleSendPulse} disabled={animationState === 'running'}>SEND_PULSE</ControlButton>
        </div>
      </div>
    </DemoSection>
  );
};

// Added missing TissueType definition
type TissueType = 'stone' | 'cyst';

const ShadowEnhancementSection: React.FC = () => {
    const [tissue, setTissue] = useState<TissueType>('stone');
    const [isScanning, setIsScanning] = useState(false);
    const scanLineControls = useAnimation();
    const bModeControls = useAnimation();

    const handleScan = async () => {
        if (isScanning) return;
        setIsScanning(true);
        scanLineControls.set({ x: '0%' });
        bModeControls.set({ pathLength: 1 });
        scanLineControls.start({ x: '100%', transition: { duration: 2, ease: 'linear' } });
        await bModeControls.start({ pathLength: 0, transition: { duration: 2, ease: 'linear' } });
        setIsScanning(false);
    };
    
    return (
        <DemoSection
            title="Attenuation Artifacts"
            description="Observe how extreme attenuation properties create shadowing or enhancement."
            objectives={[
                "Visualize acoustic shadows",
                "Analyze posterior enhancement",
                "Differentiate tissue attenuation"
            ]}
        >
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 grid grid-cols-2 gap-4">
                    <div className="h-96 bg-black rounded-xl relative p-4 overflow-hidden border border-white/5">
                        <svg viewBox="0 0 280 320" className="w-full h-full"><circle cx="140" cy="150" r="40" fill="#444" stroke="#666" strokeWidth="2" /></svg>
                        <motion.div className="absolute top-0 bottom-0 w-0.5 bg-yellow-400" animate={scanLineControls} />
                    </div>
                     <div className="h-96 bg-[#050505] rounded-xl relative p-4 border border-white/5">
                        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/20 uppercase">B_Mode_Rendering</div>
                        <div className={`w-20 h-40 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 ${tissue === 'stone' ? 'bg-black/60' : 'bg-white/20'}`} />
                    </div>
                </div>
                <div className="w-full md:w-1/3 flex flex-col justify-center gap-4">
                    <ControlButton onClick={() => setTissue('stone')} secondary={tissue !== 'stone'}>Shadow (Stone)</ControlButton>
                    <ControlButton onClick={() => setTissue('cyst')} secondary={tissue !== 'cyst'}>Enhance (Cyst)</ControlButton>
                     <ControlButton onClick={handleScan} disabled={isScanning}>EXECUTE_SCAN</ControlButton>
                </div>
            </div>
        </DemoSection>
    );
};

const ArtifactsDemo: React.FC = () => {
  return (
    <div className="space-y-8">
      <ReverberationSection />
      <ShadowEnhancementSection />
      <MatchingExercise 
        title="Artifact Identification"
        pairs={[
            { id: '1', leftContent: 'Reverberation', rightContent: 'Ladders of parallel echoes' },
            { id: '2', leftContent: 'Shadowing', rightContent: 'Dark band behind high attenuator' },
            { id: '3', leftContent: 'Enhancement', rightContent: 'Bright zone behind fluid cyst' },
            { id: '4', leftContent: 'Mirror Image', rightContent: 'Ghost copy deep to diaphragm' },
        ]}
      />
      <KnowledgeCheck
        moduleId="artifacts"
        question="Which artifact is most likely to cause a hypoechoic region behind a gallstone?"
        options={["Enhancement", "Shadowing", "Refraction", "Mirror image"]}
        correctAnswer="Shadowing"
        explanation="Stones are highly attenuating, preventing sound from passing, which creates a dark shadow behind them."
      />
    </div>
  );
};

export default ArtifactsDemo;
