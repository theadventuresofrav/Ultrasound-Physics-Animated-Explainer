
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';

// --- Knowledge Check Component ---
const KnowledgeCheck: React.FC<{
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}> = ({ question, options, correctAnswer, explanation }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
  };
  
  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
  }

  return (
    <DemoSection title="🧠 Knowledge Check" description="Test your understanding.">
      <p className="font-semibold text-white/90 mb-4">{question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(option => {
          const isCorrect = option === correctAnswer;
          const isSelected = option === selected;
          let buttonClass = 'bg-white/10 border border-white/20 text-white hover:bg-white/20';
          if (showResult) {
            if (isCorrect) buttonClass = 'bg-green-500/80 border-green-400 text-white';
            else if (isSelected) buttonClass = 'bg-red-500/80 border-red-400 text-white';
            else buttonClass = 'bg-white/10 border border-white/20 text-white opacity-50';
          }
          return (
            <button key={option} onClick={() => handleSelect(option)} disabled={showResult} className={`p-3 rounded-lg text-left transition-all duration-300 w-full ${buttonClass}`}>
              {option}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <p className="font-bold text-yellow-400">Explanation:</p>
          <p className="text-white/80 mt-2 text-sm">{explanation}</p>
           <div className="text-right mt-2">
            <button onClick={handleReset} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20">Try again</button>
          </div>
        </div>
      )}
    </DemoSection>
  );
};

// --- Face Part for 4D ---
const FaceParts = ({ isFrozen }: { isFrozen: boolean }) => (
    <g>
        <ellipse cx="50" cy="50" rx="35" ry="45" fill="url(#fetalGradient)" stroke="#d4af37" strokeWidth="0.5" />
        <path d="M 35 40 Q 40 45 45 40" stroke="#b4912f" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 55 40 Q 60 45 65 40" stroke="#b4912f" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 50 45 Q 45 55 50 60 Q 55 55 50 45" fill="#e5c56d" />
        <motion.ellipse cx="50" cy="70" rx="6" ry="3" fill="#8a6e3e" animate={isFrozen ? {} : { ry: [2, 5, 2] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
        <motion.path 
            d="M 80 80 Q 90 60 85 50 Q 80 40 70 50" 
            fill="#f4e4bc" opacity="0.8"
            animate={isFrozen ? {} : { d: ["M 80 80 Q 90 60 85 50 Q 80 40 70 50", "M 80 80 Q 95 65 90 55 Q 85 45 75 55", "M 80 80 Q 90 60 85 50 Q 80 40 70 50"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
    </g>
);

// --- Section 1: 3D Data Acquisition ---
const DataAcquisitionSection: React.FC = () => {
    const [isSweeping, setIsSweeping] = useState(false);
    return (
        <DemoSection title="3D Data Acquisition" description="3D ultrasound is created by acquiring multiple 2D image slices in sequence.">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-2/3 h-64 rounded-xl flex items-center justify-center" style={{ perspective: '500px' }}>
                    <div className="relative w-48 h-48" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(70deg) rotateZ(-30deg)' }}>
                        <div className="absolute w-48 h-48 bg-cyan-500/10 border-2 border-dashed border-cyan-400/50 rounded-lg flex items-center justify-center">
                             <div className="w-20 h-20 bg-cyan-400 rounded-full" style={{ transform: 'translateZ(-10px)' }}></div>
                        </div>
                        {isSweeping && <div className="absolute w-48 h-48 bg-yellow-400/50 border border-yellow-300" style={{ animation: 'sweep-3d 3s ease-in-out forwards' }} onAnimationEnd={() => setIsSweeping(false)}/>}
                    </div>
                </div>
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <ControlButton onClick={() => setIsSweeping(true)} disabled={isSweeping}>{isSweeping ? 'Acquiring...' : 'Start Acquisition'}</ControlButton>
                </div>
            </div>
        </DemoSection>
    );
};

// --- Section 3: 4D Imaging ---
const FourDImagingSection: React.FC = () => {
    const [isFrozen, setIsFrozen] = useState(false);
    const [quality, setQuality] = useState(50);
    const [rotationY, setRotationY] = useState(0);
    const frameRate = Math.max(5, 40 - (quality * 0.35));
    const imageBlur = (100 - quality) / 20;

    return (
        <DemoSection title="4D Real-Time Simulation" description="4D is simply 3D over time. The physics trade-off is between spatial resolution and temporal resolution.">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-2/3 bg-black rounded-2xl border-4 border-gray-800 relative overflow-hidden shadow-2xl">
                    <div className="h-[400px] flex items-center justify-center relative bg-[#1a1500]" style={{ perspective: '800px' }}>
                        <motion.div className="relative w-64 h-64 preserve-3d" animate={{ rotateY: rotationY }} transition={{ type: "spring", stiffness: 100, damping: 20 }} style={{ transformStyle: 'preserve-3d', filter: `blur(${imageBlur}px) contrast(1.2)` }}>
                            <div className="absolute inset-0" style={{ transform: 'translateZ(-10px)', opacity: 0.5 }}><svg viewBox="0 0 100 100"><FaceParts isFrozen={isFrozen} /></svg></div>
                            <div className="absolute inset-0" style={{ transform: 'translateZ(0px)' }}><svg viewBox="0 0 100 100"><FaceParts isFrozen={isFrozen} /></svg></div>
                            <div className="absolute inset-0" style={{ transform: 'translateZ(10px)', opacity: 0.3, mixBlendMode: 'overlay' }}><svg viewBox="0 0 100 100"><FaceParts isFrozen={isFrozen} /></svg></div>
                            {!isFrozen && <motion.div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent z-10" animate={{ top: ['-100%', '100%'] }} transition={{ duration: 1/frameRate, repeat: Infinity, ease: 'linear' }} />}
                        </motion.div>
                        <div className="absolute top-4 left-4 font-mono text-yellow-500 text-xs space-y-1 z-30"><p>FR: <span>{isFrozen ? 0 : frameRate.toFixed(1)} Hz</span></p></div>
                    </div>
                    <defs><radialGradient id="fetalGradient" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#fce9b5" /><stop offset="40%" stopColor="#e5c56d" /><stop offset="100%" stopColor="#8a6e3e" /></radialGradient></defs>
                </div>
                <div className="w-full lg:w-1/3 flex flex-col justify-center gap-6">
                    <ControlButton onClick={() => setIsFrozen(!isFrozen)} fullWidth secondary={isFrozen}>{isFrozen ? 'Unfreeze' : 'Freeze'}</ControlButton>
                    <div className="bg-white/10 p-6 rounded-xl">
                        <label className="block text-white/80 mb-2">Line Density / Quality</label>
                        <input type="range" min="0" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-[var(--gold)]" />
                        <label className="block text-white/80 mb-2 mt-4">View Rotation</label>
                        <input type="range" min="-90" max="90" value={rotationY} onChange={e => setRotationY(Number(e.target.value))} className="w-full accent-cyan-400" />
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

const ThreeDDemo: React.FC = () => {
    return (
        <div className="space-y-8">
            <DataAcquisitionSection />
            <FourDImagingSection />
            <KnowledgeCheck
                question="Multi-Planar Reconstruction (MPR) allows you to:"
                options={["Filter harmonics.", "Slice through a 3D volume in orthogonal planes.", "Measure bone density.", "Speed up the frame rate."]}
                correctAnswer="Slice through a 3D volume in orthogonal planes."
                explanation="MPR is a fundamental technique in 3D/4D imaging that allows the user to slice through the acquired data volume in any plane."
            />
        </div>
    );
};

export default ThreeDDemo;
