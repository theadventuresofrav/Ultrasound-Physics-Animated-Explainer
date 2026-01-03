
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoSection from './DemoSection';
import ControlButton from './ControlButton';
import { SparklesIcon, BrainIcon, TargetIcon } from '../Icons';

type Scenario = 'deep_liver' | 'superficial_thyroid';
type Compounding = 'off' | 'low' | 'high';
type GrayMap = 'linear' | 's-curve';

const UltrasoundImageDisplay: React.FC<{ style: React.CSSProperties, scenario: Scenario, harmonics: boolean }> = ({ style, scenario, harmonics }) => (
    <div className="w-full h-full bg-black relative overflow-hidden rounded-2xl shadow-inner">
        {/* Tactical Graticule Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-20" />
        
        <svg width="100%" height="100%" className="absolute inset-0 z-10">
            <defs>
                <filter id="speckle-tactical">
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
                </filter>
                 <linearGradient id="tgc-gradient-tactical" x1="0.5" y1="0" x2="0.5" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.4" />
                </linearGradient>
            </defs>
            {/* Dynamic Tissue Rendering */}
            <rect width="100%" height="100%" fill="#111" filter="url(#speckle-tactical)" style={{ opacity: 0.15, ...style }} />
            
            <g style={{...style}}>
                {scenario === 'deep_liver' ? (
                    <>
                        <ellipse cx="50%" cy="70%" rx="30%" ry="15%" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
                        <circle cx="60%" cy="75%" r="10%" fill="#050505" stroke="#222" />
                    </>
                ) : (
                    <>
                         <ellipse cx="50%" cy="25%" rx="35%" ry="14%" fill="#222" stroke="#333" strokeWidth="0.5" />
                         <circle cx="45%" cy="28%" r="5%" fill="#080808" />
                    </>
                )}
            </g>
             <rect width="100%" height="100%" fill="url(#tgc-gradient-tactical)" style={{ mixBlendMode: 'plus-lighter', ...style }} />

            {!harmonics && (
                <rect width="100%" height="30%" fill="#fff" filter="url(#speckle-tactical)" style={{ opacity: 0.08, mixBlendMode: 'screen' }} />
            )}
        </svg>
    </div>
);

const ControlPanel: React.FC<{ title: string, colorClass: string, children: React.ReactNode }> = ({ title, colorClass, children }) => (
    <div className="bg-[#08080a] p-6 rounded-[2rem] space-y-5 border border-white/5 shadow-2xl backdrop-blur-md relative group">
        <div className="flex items-center gap-3 mb-2">
            <div className={`w-1 h-3 rounded-full ${colorClass.includes('cyan') ? 'bg-cyan-400' : 'bg-orange-400'} shadow-[0_0_10px_currentColor]`} />
            <h4 className={`text-[10px] font-black ${colorClass} font-mono tracking-[0.3em] uppercase`}>{title}</h4>
        </div>
        <div className="space-y-5">{children}</div>
    </div>
);

const KnobologyDemo: React.FC = () => {
    const [scenario, setScenario] = useState<Scenario>('deep_liver');
    const [power, setPower] = useState(70);
    const [frequency, setFrequency] = useState(3.5);
    const [depth, setDepth] = useState(16);
    const [focusPos, setFocusPos] = useState(50);
    const [gain, setGain] = useState(50);
    const [dynamicRange, setDynamicRange] = useState(60);
    const [tgc, setTgc] = useState([40, 60, 80]);
    const [harmonics, setHarmonics] = useState(true);

    const resetControls = (scen: Scenario) => {
        setScenario(scen);
        if (scen === 'deep_liver') {
            setPower(80); setGain(45); setDynamicRange(65); setFrequency(3.5); setDepth(16); setFocusPos(75); setTgc([30, 50, 80]);
        } else {
            setPower(60); setGain(55); setDynamicRange(50); setFrequency(12); setDepth(5); setFocusPos(30); setTgc([70, 40, 20]);
        }
    };

    const autoOptimize = () => {
        if (scenario === 'deep_liver') {
            setGain(60); setTgc([40, 65, 85]); setDynamicRange(60); setFocusPos(70);
        } else {
            setGain(65); setTgc([75, 50, 30]); setDynamicRange(55); setFocusPos(40);
        }
    };
    
    const { imageStyle, tgcStops, scores, guidance, snr } = useMemo(() => {
        const msgs: string[] = [];
        let rScore = 100, pScore = 100, cScore = 100, sScore = 100;

        if (scenario === 'deep_liver') {
            if (frequency > 5) { rScore -= 30; msgs.push("PHYSICS_ERR: High frequency cannot penetrate deep liver parenchyma."); }
            if (focusPos < 60) { rScore -= 15; msgs.push("OPT_ADVICE: Position focal point at or below the target structure."); }
            if (depth < 14) { pScore -= 50; msgs.push("DISPLAY_ERR: Depth insufficient to visualize posterior structures.");}
            if (power < 75) { pScore -= 20; msgs.push("SIGNAL_WARNING: Increase output power to improve signal-to-noise at depth.");}
        } else {
            if (frequency < 10) { rScore -= 40; msgs.push("OPT_ADVICE: Utilize higher frequency for superior superficial resolution."); }
            if (focusPos > 40) { rScore -= 15; msgs.push("OPT_ADVICE: Focus is currently deeper than anatomical target."); }
            if (tgc[0] < 60) { cScore -= 10; msgs.push("GAIN_ADVICE: Increase near-field TGC for surface visualization."); }
        }
        
        if (power > 95) { sScore -= 20; msgs.push("ALARA_ALERT: High output power detected. Consider gain for brightness first.");}

        const calculatedSnr = Math.min(100, (power * 0.8) + (gain * 0.2) - (depth * 1.5) + (harmonics ? 10 : 0));
        
        const style: React.CSSProperties = {
            filter: `brightness(${0.8 + gain / 150}) contrast(${0.8 + dynamicRange/100})`,
            transform: `scale(${20 / depth})`,
            transformOrigin: 'top center',
        };

        const Stops = () => (
            <>
                <stop offset="0%" stopColor="white" stopOpacity={tgc[0] / 300} />
                <stop offset="50%" stopColor="white" stopOpacity={tgc[1] / 300} />
                <stop offset="100%" stopColor="white" stopOpacity={tgc[2] / 300} />
            </>
        );

        return { 
            imageStyle: style, tgcStops: <Stops />,
            scores: { resolution: Math.max(0, rScore), penetration: Math.max(0, pScore), contrast: Math.max(0, cScore), safety: Math.max(0, sScore) },
            guidance: msgs.length > 0 ? msgs : ["CORE_SYNC: System optimized for current anatomy."],
            snr: calculatedSnr
        };
    }, [gain, dynamicRange, frequency, focusPos, tgc, scenario, depth, power, harmonics]);

    const avgScore = (scores.resolution + scores.penetration + scores.contrast + scores.safety) / 4;

    return (
        <DemoSection 
            title="Optimization Console" 
            description="Diagnostic clarity is achieved at the intersection of physics and knobology. Learn to manipulate the signal chain for maximum intelligence."
            objectives={[
                "Balance axial/lateral resolution with frequency selection",
                "Apply Time-Gain Compensation for uniform brightness",
                "Execute ALARA principles by prioritizing receiver gain"
            ]}
        >
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Visual Monitor Viewport */}
                <div className="w-full xl:w-[45%] flex flex-col">
                    <div className="mb-4 flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]" />
                            <span className="text-[10px] font-mono text-white/50 uppercase tracking-[0.3em]">B-Mode_Raw_Stream</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">FPS: {(60 / (depth/8)).toFixed(0)}</span>
                            <div className="w-[1px] h-3 bg-white/10" />
                            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">DR: {dynamicRange}dB</span>
                        </div>
                    </div>

                    <div className="flex-grow aspect-[4/5] bg-black rounded-[3rem] p-2 relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                        <UltrasoundImageDisplay style={imageStyle} scenario={scenario} harmonics={harmonics} />
                        
                        {/* Interactive Overlays */}
                        <div className="absolute top-8 left-8 font-mono text-[9px] space-y-1 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity">
                            <p>SYS_FRQ: {frequency} MHz</p>
                            <p>PWR_OUT: {power}%</p>
                        </div>
                        
                        <div className="absolute bottom-8 right-8 font-mono text-[9px] text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity text-right">
                            <p>SNR_LINK: {snr.toFixed(0)}%</p>
                            <p>MODE: {harmonics ? 'THI_ACTIVE' : 'FUNDAMENTAL'}</p>
                        </div>

                        <svg width="0" height="0" className="absolute"><defs><linearGradient id="tgc-gradient-tactical" x1="0.5" y1="0" x2="0.5" y2="1">{tgcStops}</linearGradient></defs></svg>
                        
                        <motion.div 
                            className="absolute left-0 right-0 h-12 bg-white/[0.03] z-30 pointer-events-none"
                            animate={{ top: ['-20%', '120%'] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                     <div className="flex gap-4 mt-6">
                        <ControlButton onClick={() => resetControls('deep_liver')} secondary={scenario !== 'deep_liver'} fullWidth className="h-14 uppercase text-[10px] tracking-widest font-black">Mission: Deep_Target</ControlButton>
                        <ControlButton onClick={() => resetControls('superficial_thyroid')} secondary={scenario !== 'superficial_thyroid'} fullWidth className="h-14 uppercase text-[10px] tracking-widest font-black">Mission: Surface_Detail</ControlButton>
                    </div>
                </div>

                {/* Tactical Control Stack */}
                <div className="w-full xl:w-[55%] flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ControlPanel title="Uplink: Transmit" colorClass="text-cyan-400">
                             <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[PWR_OUT] Intensity</span>
                                    <span className="text-cyan-400 font-bold">{power}%</span>
                                </div>
                                <input type="range" min="10" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full h-1.5 accent-cyan-400 bg-white/5 rounded-full" />
                             </div>
                             <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[DRV_FRQ] Res/Pen</span>
                                    <span className="text-cyan-400 font-bold">{frequency.toFixed(1)} MHz</span>
                                </div>
                                <input type="range" min="2" max="15" step="0.5" value={frequency} onChange={e => setFrequency(Number(e.target.value))} className="w-full h-1.5 accent-cyan-400 bg-white/5 rounded-full" />
                             </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[DPT_SCAN] Field_View</span>
                                    <span className="text-cyan-400 font-bold">{depth} cm</span>
                                </div>
                                <input type="range" min="4" max="24" step="1" value={depth} onChange={e => setDepth(Number(e.target.value))} className="w-full h-1.5 accent-cyan-400 bg-white/5 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[FOC_POS] Precision</span>
                                    <span className="text-cyan-400 font-bold">{focusPos}%</span>
                                </div>
                                <input type="range" min="10" max="90" value={focusPos} onChange={e => setFocusPos(Number(e.target.value))} className="w-full h-1.5 accent-cyan-400 bg-white/5 rounded-full" />
                            </div>
                        </ControlPanel>

                        <ControlPanel title="Downlink: Receiver" colorClass="text-orange-400">
                             <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[MST_GAIN] Amp</span>
                                    <span className="text-orange-400 font-bold">{gain}%</span>
                                </div>
                                <input type="range" min="20" max="100" value={gain} onChange={e => setGain(Number(e.target.value))} className="w-full h-1.5 accent-orange-400 bg-white/5 rounded-full" />
                             </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                                    <span>[DYN_RNG] Contrast</span>
                                    <span className="text-orange-400 font-bold">{dynamicRange} dB</span>
                                </div>
                                <input type="range" min="30" max="90" value={dynamicRange} onChange={e => setDynamicRange(Number(e.target.value))} className="w-full h-1.5 accent-orange-400 bg-white/5 rounded-full" />
                            </div>
                             <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-center gap-1">
                                    <div className="w-1 h-2 bg-orange-400/40" />
                                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.4em]">TGC_Compensation_Stack</span>
                                    <div className="w-1 h-2 bg-orange-400/40" />
                                </div>
                                <div className="flex gap-2">
                                    <input type="range" value={tgc[0]} onChange={e => setTgc(p => [Number(e.target.value), p[1], p[2]])} className="flex-1 accent-orange-400 bg-white/5 h-1 rounded-full" />
                                    <input type="range" value={tgc[1]} onChange={e => setTgc(p => [p[0], Number(e.target.value), p[2]])} className="flex-1 accent-orange-400 bg-white/5 h-1 rounded-full" />
                                    <input type="range" value={tgc[2]} onChange={e => setTgc(p => [p[0], p[1], Number(e.target.value)])} className="flex-1 accent-orange-400 bg-white/5 h-1 rounded-full" />
                                </div>
                                <div className="flex justify-between text-[7px] font-black text-white/20 uppercase tracking-widest px-1"><span>Proximal</span><span>Medial</span><span>Distal</span></div>
                             </div>
                        </ControlPanel>
                    </div>

                    <div className="bg-[#0c0c0e] p-7 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                         <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            <div className="flex-grow space-y-4">
                                <h5 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 flex items-center gap-3">
                                    <div className="w-1 h-3 bg-yellow-500 animate-pulse" /> Commander's_Feedback
                                </h5>
                                <div className="space-y-3">
                                    {guidance.map((msg, i) => (
                                        <div key={i} className="flex items-start gap-4 animate-fade-in">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/20 border border-[var(--gold)]/40 mt-1" />
                                            <p className="text-[11px] text-white/70 font-light italic leading-relaxed tracking-wide">{msg}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-full md:w-56 shrink-0 flex flex-col gap-4">
                                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl text-center">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Stability_XP</p>
                                    <p className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">{avgScore.toFixed(0)}<span className="text-sm opacity-20 ml-1">%</span></p>
                                    <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                        <motion.div className="h-full bg-[var(--gold)]" animate={{ width: `${avgScore}%` }} />
                                    </div>
                                </div>
                                <ControlButton onClick={autoOptimize} fullWidth className="bg-[var(--gold)]/10 border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black text-[10px] tracking-[0.3em] font-black h-12">[ OVERRIDE_AUTO ]</ControlButton>
                            </div>
                         </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <button onClick={() => setHarmonics(!harmonics)} className={`px-5 h-11 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${harmonics ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}>Harmonics: {harmonics ? 'ACTIVE' : 'IDLE'}</button>
                        <button className="px-5 h-11 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all">Persistence: 2x</button>
                        <button className="px-5 h-11 rounded-xl border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all">Sig_Process: HD</button>
                    </div>
                </div>
            </div>
        </DemoSection>
    );
};

export default KnobologyDemo;
