import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useSound } from '../../contexts/SoundContext';
import ControlButton from './ControlButton';
import DemoSection from './DemoSection';
import { TargetIcon, TrophyIcon, BrainIcon, SparklesIcon } from '../Icons';

// --- Types ---
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
type Category = 'Basics' | 'Transducers' | 'Doppler' | 'Artifacts' | 'Safety';

interface Question {
    id: string;
    value: number;
    question: string;
    options: string[];
    answer: number; 
    explanation: string;
}

interface GameData {
    [key: string]: { 
        [key: string]: Question[]; 
    };
}

// --- Data ---
const GAME_DATA: GameData = {
    Beginner: {
        Basics: [
            { id: 'b-ba-100', value: 100, question: 'What is the frequency range of diagnostic ultrasound?', options: ['20-20,000 Hz', '> 20,000 Hz', '2-15 MHz', '< 20 Hz'], answer: 2, explanation: 'Diagnostic ultrasound typically uses frequencies between 2 MHz and 15 MHz.' },
            { id: 'b-ba-200', value: 200, question: 'What is the average speed of sound in soft tissue?', options: ['1,540 m/s', '1,450 m/s', '330 m/s', '4,080 m/s'], answer: 0, explanation: 'The ultrasound machine assumes a propagation speed of 1,540 m/s (1.54 mm/µs) for soft tissue.' },
            { id: 'b-ba-300', value: 300, question: 'Which parameter is determined by both the source and the medium?', options: ['Frequency', 'Period', 'Wavelength', 'Propagation Speed'], answer: 2, explanation: 'Wavelength (λ) is determined by both the source (frequency) and the medium (speed): λ = c/f.' },
            { id: 'b-ba-400', value: 400, question: 'As frequency increases, what happens to penetration?', options: ['Increases', 'Decreases', 'Stays the same', 'Doubles'], answer: 1, explanation: 'High frequency sound is attenuated more quickly, reducing penetration depth.' },
        ],
        Transducers: [
            { id: 'b-tr-100', value: 100, question: 'Which component converts electrical energy to sound energy?', options: ['Matching Layer', 'Backing Material', 'PZT Crystal', 'Lens'], answer: 2, explanation: 'The Piezoelectric (PZT) crystal converts electricity to sound (transmission) and sound to electricity (reception).' },
            { id: 'b-tr-200', value: 200, question: 'Which transducer produces a rectangular image?', options: ['Linear Sequential', 'Curvilinear', 'Phased Array', 'Mechanical Sector'], answer: 0, explanation: 'Linear sequential arrays fire elements in parallel groups, creating a rectangular field of view.' },
            { id: 'b-tr-300', value: 300, question: 'What is the purpose of gel?', options: ['Cool the patient', 'Remove air', 'Clean the probe', 'Anesthetize skin'], answer: 1, explanation: 'Gel removes the air between the transducer and skin, which would otherwise reflect almost all the sound.' },
            { id: 'b-tr-400', value: 400, question: 'Which part improves axial resolution by shortening the pulse?', options: ['Matching Layer', 'Backing Material', 'Lens', 'Case'], answer: 1, explanation: 'Backing (damping) material stops the crystal from ringing, creating short pulses needed for good axial resolution.' },
        ],
        Doppler: [
            { id: 'b-do-100', value: 100, question: 'What does BART stand for?', options: ['Blue Away Red Towards', 'Blood Artery Red Time', 'Blue Artery Red Towards', 'Base Above Red Top'], answer: 0, explanation: 'BART is the standard convention: Blue represents flow Away from the probe, Red represents flow Towards.' },
            { id: 'b-do-200', value: 200, question: 'A positive Doppler shift means blood is moving...', options: ['Away', 'Towards', 'Perpendicular', 'Turbulently'], answer: 1, explanation: 'A positive shift occurs when the received frequency is higher than transmitted, indicating motion towards the source.' },
            { id: 'b-do-300', value: 300, question: 'Which angle provides the most accurate velocity measurement?', options: ['90 degrees', '60 degrees', '45 degrees', '0 degrees'], answer: 3, explanation: 'The cosine of 0 degrees is 1, providing the full, true velocity. 90 degrees provides no shift.' },
            { id: 'b-do-400', value: 400, question: 'What artifact occurs when the Nyquist limit is exceeded?', options: ['Shadowing', 'Aliasing', 'Reverberation', 'Mirror Image'], answer: 1, explanation: 'Aliasing is the wrapping around of the spectral waveform when the Doppler shift exceeds PRF/2.' },
        ],
        Artifacts: [
            { id: 'b-ar-100', value: 100, question: 'What artifact is seen behind a gallstone?', options: ['Enhancement', 'Shadowing', 'Comet Tail', 'Mirror Image'], answer: 1, explanation: 'Stones are highly attenuating/reflecting, preventing sound from passing, creating a shadow.' },
            { id: 'b-ar-200', value: 200, question: 'What artifact is seen behind a simple cyst?', options: ['Enhancement', 'Shadowing', 'Reverberation', 'Side Lobe'], answer: 0, explanation: 'Fluid attenuates less than surrounding tissue, so echoes behind it are stronger (brighter).' },
            { id: 'b-ar-300', value: 300, question: 'Which artifact looks like a ladder?', options: ['Reverberation', 'Mirror Image', 'Shadowing', 'Speed Error'], answer: 0, explanation: 'Reverberation creates multiple, equally spaced echoes caused by bouncing between two reflectors.' },
            { id: 'b-ar-400', value: 400, question: 'Where is a mirror image artifact located?', options: ['Shallower', 'Deeper', 'Lateral', 'Medial'], answer: 1, explanation: 'The artifact is always placed deeper than the true reflector because of the extra time the pulse took to bounce.' },
        ],
        Safety: [
            { id: 'b-sa-100', value: 100, question: 'What does ALARA stand for?', options: ['As Low As Reasonably Achievable', 'Always Leave Area Radiation Absent', 'All Levels Are Right Always', 'Acoustic Level And Rate Average'], answer: 0, explanation: 'Use the lowest power and shortest time necessary to get a diagnostic image.' },
            { id: 'b-sa-200', value: 200, question: 'Which index relates to tissue heating?', options: ['MI', 'TI', 'PI', 'RI'], answer: 1, explanation: 'The Thermal Index (TI) estimates the potential for tissue temperature rise.' },
            { id: 'b-sa-300', value: 300, question: 'Which index relates to cavitation?', options: ['MI', 'TI', 'PI', 'RI'], answer: 0, explanation: 'The Mechanical Index (MI) estimates the potential for non-thermal bioeffects like cavitation.' },
            { id: 'b-sa-400', value: 400, question: 'Which control affects patient exposure?', options: ['Gain', 'TGC', 'Dynamic Range', 'Output Power'], answer: 3, explanation: 'Output Power determines the intensity of sound sent into the patient. Gain only amplifies the return signal.' },
        ],
    },
    Intermediate: {
        Basics: [
            { id: 'i-ba-100', value: 100, question: 'Attenuation is the sum of reflection, scattering, and...?', options: ['Refraction', 'Absorption', 'Transmission', 'Diffraction'], answer: 1, explanation: 'Absorption (conversion to heat) is the primary component of attenuation.' },
            { id: 'i-ba-200', value: 200, question: 'The attenuation coefficient in soft tissue is approximately?', options: ['0.5 dB/cm/MHz', '1.0 dB/cm/MHz', '2.0 dB/cm/MHz', '10 dB/cm/MHz'], answer: 0, explanation: 'Soft tissue attenuates approx. 0.5 dB for every cm of depth for every MHz of frequency.' },
            { id: 'i-ba-300', value: 300, question: 'Impedance (Z) is calculated as:', options: ['Density x Speed', 'Density / Speed', 'Frequency x Wavelength', 'Power / Area'], answer: 0, explanation: 'Acoustic Impedance (Rayls) = Density (kg/m³) × Propagation Speed (m/s).' },
            { id: 'i-ba-400', value: 400, question: 'Refraction requires oblique incidence and:', options: ['Different Densities', 'Different Impedances', 'Different Speeds', 'Different Temperatures'], answer: 2, explanation: 'Snell\'s Law dictates that refraction occurs only if propagation speeds of the two media differ.' },
        ],
        Transducers: [
            { id: 'i-tr-100', value: 100, question: 'The matching layer thickness is:', options: ['1/2 Wavelength', '1/4 Wavelength', '1 Wavelength', 'Variable'], answer: 1, explanation: '1/4 wavelength thickness causes destructive interference of wall echoes, enhancing transmission.' },
            { id: 'i-tr-200', value: 200, question: 'Which resolution is best in clinical imaging?', options: ['Axial', 'Lateral', 'Elevational', 'Temporal'], answer: 0, explanation: 'Axial resolution (LARRD) is usually the best spatial resolution because pulses are very short.' },
            { id: 'i-tr-300', value: 300, question: 'What improves lateral resolution?', options: ['Damping', 'Focusing', 'Lower Frequency', 'Thicker Crystal'], answer: 1, explanation: 'Focusing narrows the beam width. Lateral resolution is equal to the beam width.' },
            { id: 'i-tr-400', value: 400, question: 'Low Q-factor transducers have:', options: ['Long pulse, narrow bandwidth', 'Short pulse, wide bandwidth', 'High sensitivity', 'No backing material'], answer: 1, explanation: 'Imaging probes use backing material to create short pulses, which results in a wide bandwidth and low Q-factor.' },
        ],
        Doppler: [
            { id: 'i-do-100', value: 100, question: 'The Nyquist limit is equal to:', options: ['PRF', 'PRF / 2', 'PRF x 2', 'Frequency / 2'], answer: 1, explanation: 'Aliasing occurs when the Doppler shift exceeds half the Pulse Repetition Frequency.' },
            { id: 'i-do-200', value: 200, question: 'Which processing technique is used for Spectral Doppler?', options: ['Autocorrelation', 'FFT', 'Demodulation', 'Scan Conversion'], answer: 1, explanation: 'Fast Fourier Transform (FFT) is accurate enough to process the complex individual frequencies in spectral Doppler.' },
            { id: 'i-do-300', value: 300, question: 'Wall filters eliminate:', options: ['High velocity signals', 'Aliased signals', 'Low frequency, high amplitude signals', 'Turbulent flow'], answer: 2, explanation: 'Wall filters (high pass filters) remove the strong, low-shift signals caused by moving vessel walls.' },
            { id: 'i-do-400', value: 400, question: 'What is the advantage of Power Doppler?', options: ['Directional info', 'Velocity measurement', 'Increased sensitivity', 'No flash artifact'], answer: 2, explanation: 'Power Doppler detects amplitude, making it independent of angle and highly sensitive to slow flow.' },
        ],
        Artifacts: [
            { id: 'i-ar-100', value: 100, question: 'Propagation speed error places echoes:', options: ['Laterally displaced', 'At incorrect depths', 'With wrong brightness', 'As multiple lines'], answer: 1, explanation: 'If speed < 1540, echoes arrive late and are placed too deep. If speed > 1540, too shallow.' },
            { id: 'i-ar-200', value: 200, question: 'Which artifact is related to slice thickness?', options: ['Partial Volume', 'Mirror Image', 'Refraction', 'Comet Tail'], answer: 0, explanation: 'Partial volume (slice thickness) artifact fills in anechoic structures when the beam is wider than the structure.' },
            { id: 'i-ar-300', value: 300, question: 'Side lobes and grating lobes degrade:', options: ['Axial resolution', 'Lateral resolution', 'Temporal resolution', 'Contrast resolution'], answer: 1, explanation: 'Lobes send energy off-axis. If they hit a reflector, it is mapped to the main beam axis, widening the apparent structure.' },
            { id: 'i-ar-400', value: 400, question: 'Crosstalk in Doppler looks like:', options: ['Aliasing', 'Mirror Image spectrum', 'Spectral Broadening', 'Wall noise'], answer: 1, explanation: 'Crosstalk appears as an identical Doppler spectrum above and below the baseline, often due to high gain.' },
        ],
        Safety: [
            { id: 'i-sa-100', value: 100, question: 'Transient cavitation is also known as:', options: ['Stable', 'Inertial', 'Thermal', 'Mechanical'], answer: 1, explanation: 'Inertial (transient) cavitation describes the violent collapse of bubbles.' },
            { id: 'i-sa-200', value: 200, question: 'Which mode has the highest typical SPTA intensity?', options: ['B-Mode', 'M-Mode', 'Color Doppler', 'PW Doppler'], answer: 3, explanation: 'PW Doppler concentrates energy in a small gate with a high PRF, leading to the highest temporal average intensity.' },
            { id: 'i-sa-300', value: 300, question: 'A hydrophone measures:', options: ['Total power', 'Pressure amplitude', 'Tissue temp', 'Impedance'], answer: 1, explanation: 'A hydrophone is a small needle probe used to measure pressure at specific locations in the beam.' },
            { id: 'i-sa-400', value: 400, question: 'No bioeffects have been confirmed below an SPTA of:', options: ['1 mW/cm²', '100 mW/cm²', '1 W/cm²', '100 W/cm²'], answer: 1, explanation: 'For an unfocused beam, 100 mW/cm² is the AIUM limit for confirmed bioeffects. (1 W/cm² for focused).' },
        ],
    },
    Advanced: {
        Basics: [
            { id: 'a-ba-100', value: 100, question: 'Which intensity is most relevant to tissue heating?', options: ['SPTP', 'SATP', 'SPTA', 'SATA'], answer: 2, explanation: 'Spatial Peak Temporal Average (SPTA) correlates best with tissue heating effects.' },
            { id: 'a-ba-200', value: 200, question: 'The Duty Factor for continuous wave ultrasound is:', options: ['0.1%', '1%', '50%', '100%'], answer: 3, explanation: 'CW is always on, so the duty factor is 1.0 or 100%.' },
            { id: 'a-ba-300', value: 300, question: 'A 3 dB drop corresponds to a ratio of:', options: ['0.5', '0.25', '0.1', '0.75'], answer: 0, explanation: '-3 dB represents a halving of intensity (1/2 or 0.5).' },
            { id: 'a-ba-400', value: 400, question: 'Snell\'s Law describes:', options: ['Reflection', 'Refraction', 'Scattering', 'Absorption'], answer: 1, explanation: 'Sin(trans)/Sin(inc) = Speed2/Speed1. This governs the angle of refraction.' },
        ],
        Transducers: [
            { id: 'a-tr-100', value: 100, question: 'Apodization reduces:', options: ['Axial resolution', 'Grating lobes', 'Main beam width', 'Pulse length'], answer: 1, explanation: 'Varying the voltage across elements (stronger center, weaker outer) reduces lobe artifacts.' },
            { id: 'a-tr-200', value: 200, question: 'Dynamic Receive Focusing uses:', options: ['Lens', 'Curved Crystal', 'Variable Time Delays', 'Apodization'], answer: 2, explanation: 'The system adds time delays to received echoes based on depth to keep the beam focused at all depths.' },
            { id: 'a-tr-300', value: 300, question: 'Which probe uses 1.5D arrays?', options: ['3D probes', 'Slice thickness control', 'CW probes', 'Pedoff'], answer: 1, explanation: '1.5D arrays have multiple rows of crystals to allow electronic focusing in the elevational plane (slice thickness).' },
            { id: 'a-tr-400', value: 400, question: 'Subdicing helps reduce:', options: ['Reverberation', 'Grating Lobes', 'Side Lobes', 'Aliasing'], answer: 1, explanation: 'Cutting elements into smaller sub-elements (subdicing) reduces the center-to-center distance, mitigating grating lobes.' },
        ],
        Doppler: [
            { id: 'a-do-100', value: 100, question: 'The resistive index (RI) formula is:', options: ['(PSV-EDV)/PSV', '(PSV-EDV)/Mean', 'PSV/EDV', 'PSV-EDV'], answer: 0, explanation: 'Resistive Index = (Peak Systolic - End Diastolic) / Peak Systolic.' },
            { id: 'a-do-200', value: 200, question: 'Which provides the best range resolution?', options: ['HPRF Doppler', 'CW Doppler', 'PW Doppler', 'Color Doppler'], answer: 2, explanation: 'Standard PW Doppler has exact range resolution due to a single gate. HPRF introduces range ambiguity to measure high velocities.' },
            { id: 'a-do-300', value: 300, question: 'Color packets with more pulses have:', options: ['Better temporal res', 'Better velocity accuracy', 'Less energy', 'Worse sensitivity'], answer: 1, explanation: 'Larger packet size (ensemble length) gives more data for averaging, improving velocity accuracy but slowing frame rate.' },
            { id: 'a-do-400', value: 400, question: 'Bernoulli\'s principle relates:', options: ['Velocity and Pressure', 'Flow and Resistance', 'Voltage and Current', 'Frequency and Speed'], answer: 0, explanation: 'As velocity increases (e.g., in a stenosis), pressure decreases to conserve energy (ΔP = 4v²).' },
        ],
        Artifacts: [
            { id: 'a-ar-100', value: 100, question: 'Which artifact is reduced by spatial compounding?', options: ['Mirror Image', 'Speckle', 'Aliasing', 'Speed Error'], answer: 1, explanation: 'Averaging frames from different angles smooths out the constructive/destructive interference pattern known as speckle.' },
            { id: 'a-ar-200', value: 200, question: 'Range Ambiguity occurs when:', options: ['PRF is too high', 'PRF is too low', 'Gain is too high', 'Focus is too deep'], answer: 0, explanation: 'If PRF is too high, the next pulse is sent before the previous one returns from deep structures, confusing the depth.' },
            { id: 'a-ar-300', value: 300, question: 'Which artifact creates lateral displacement?', options: ['Reverberation', 'Refraction', 'Mirror Image', 'Enhancement'], answer: 1, explanation: 'Refraction bends the beam. The machine assumes a straight line, placing the echo laterally displaced from its true location.' },
            { id: 'a-ar-400', value: 400, question: 'Twinkle artifact is associated with:', options: ['Cysts', 'Calcifications/Stones', 'Lipomas', 'Hemangiomas'], answer: 1, explanation: 'Twinkle is a color Doppler artifact appearing as a mosaic of color behind a rough, high-impedance surface like a kidney stone.' },
        ],
        Safety: [
            { id: 'a-sa-100', value: 100, question: 'TIB stands for:', options: ['Thermal Index Bone', 'Thermal Index Brain', 'Thermal Index Body', 'Tissue Index Base'], answer: 0, explanation: 'TIB is the Thermal Index calculated assuming bone is at the beam focus (e.g., fetal ultrasound).' },
            { id: 'a-sa-200', value: 200, question: 'Which modality has the lowest duty factor?', options: ['CW Doppler', 'B-Mode', 'M-Mode', 'Color Doppler'], answer: 1, explanation: 'B-Mode has a very short pulse and long listening time, resulting in the lowest duty factor (<0.1%).' },
            { id: 'a-sa-300', value: 300, question: 'Mechanical Index is proportional to:', options: ['Peak Rarefactional Pressure', 'Peak Compressional Pressure', 'Frequency', 'Pulse Length'], answer: 0, explanation: 'MI = Peak Rarefactional Pressure / √Frequency.' },
            { id: 'a-sa-400', value: 400, question: 'A radiation force balance measures:', options: ['Intensity', 'Pressure', 'Power', 'Beam Width'], answer: 2, explanation: 'It measures the total power of the sound beam by detecting the force the beam exerts on a target.' },
        ],
    }
};

const CATEGORIES: Category[] = ['Basics', 'Transducers', 'Doppler', 'Artifacts', 'Safety'];

const JeopardyDemo: React.FC = () => {
    const { awardAchievement, addEchoCredits } = useUser();
    const { playClick, playHover, narrateText, stopBriefing, playSuccess, playError } = useSound();
    
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

    // Initial Briefing: 9-Step Brain Meal-Prep Architecture
    const triggerBriefing = (level: Difficulty) => {
        const briefingText = `
            NARRATIVE ARCHITECTURE:
            1. QUANTIFY EFFORT: I have analyzed thousands of official SPI registry questions across ${level} level constraints to save you dozens of hours of manual archive searching.
            2. PROMISE ASSESSMENT: But clicking buttons is not enough. Your neural synchronization will be measured by your final credit tally.
            3. STRUCTURED ROADMAP: We will sweep through five core sectors: Basics, Transducers, Doppler, Artifacts, and Safety.
            4. DEFINE BY CONTRAST: This is not a casual trivia night; it is a high-speed diagnostic retrieval simulation.
            5. MNEMONIC INJECTION: Remember the acronym S.P.I. - Speed, Precision, and Intelligence.
            6. ANALOGY: Think of yourself as a pilot in a dogfight. You must recall critical physics data nodes while the pressure is mounting.
            7. PRACTICAL WORKFLOW: Successfully extracting data here mimics the clinical environment where your physics intuition must be instantaneous.
            8. BEHAVIORAL MINDSET: Focus on the system of elimination. Do not rise to the level of your guesses; fall to the level of your systems.
            9. FINAL ASSESSMENT: Are you ready to initialize the grid?
            
            CRITICAL: JUST TALK. No headers, no labels. Continuous monologue.
        `;
        narrateText(briefingText, `Briefing: ${level} Challenge`);
    };

    const currentQuestions = useMemo(() => {
        if (!difficulty) return null;
        return GAME_DATA[difficulty];
    }, [difficulty]);

    const handleQuestionClick = (q: Question) => {
        if (answeredQuestions.includes(q.id)) return;
        playClick();
        setActiveQuestion(q);
        setSelectedOption(null);
        setIsAnswerRevealed(false);
    };

    const handleAnswerSubmit = (optionIdx: number) => {
        if (isAnswerRevealed || !activeQuestion) return;
        setSelectedOption(optionIdx);
        setIsAnswerRevealed(true);

        const isCorrect = optionIdx === activeQuestion.answer;
        if (isCorrect) {
            playSuccess();
            setScore(s => s + activeQuestion.value);
            addEchoCredits(activeQuestion.value / 10); // Reward small bonus credits
        } else {
            playError();
            setScore(s => s - activeQuestion.value);
        }
    };

    const handleCloseQuestion = () => {
        if (activeQuestion) {
            setAnsweredQuestions(prev => [...prev, activeQuestion.id]);
            setActiveQuestion(null);
        }
        
        if (currentQuestions && answeredQuestions.length + 1 === Object.values(currentQuestions).flat().length) {
            if (score > 1000) awardAchievement('jeopardy');
        }
    };

    const handleDifficultySelect = (level: Difficulty) => {
        playClick();
        setDifficulty(level);
        triggerBriefing(level);
    };

    if (!difficulty) {
        return (
            <DemoSection title="SPI Jeopardy Challenge" description="High-speed data retrieval simulation. Calibrate your physics intuition against the grid.">
                <div className="flex flex-col items-center justify-center py-16 gap-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)]" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-2 relative z-10"
                    >
                         <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Select_Difficulty_Level</h3>
                         <p className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">Uplink required to initialize grid</p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-6 relative z-10">
                        {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level, i) => (
                            <motion.button
                                key={level}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handleDifficultySelect(level)}
                                onMouseEnter={playHover}
                                className="group relative w-64 p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-[var(--gold)]/40 hover:bg-white/[0.05] transition-all duration-500 shadow-2xl"
                            >
                                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <TargetIcon className="w-5 h-5 text-[var(--gold)]" />
                                </div>
                                <h4 className="text-2xl font-black text-white group-hover:text-[var(--gold)] transition-colors mb-2 uppercase tracking-tighter">{level}</h4>
                                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                                    {level === 'Beginner' ? 'Sector: Fundamental' : level === 'Intermediate' ? 'Sector: Tactical' : 'Sector: Elite'}
                                </p>
                                <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-[var(--gold)]/40" initial={{ width: 0 }} whileHover={{ width: '100%' }} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </DemoSection>
        );
    }

    return (
        <DemoSection title={`SPI Jeopardy: ${difficulty}`} description="Execute rapid knowledge retrieval across the five primary physics sectors.">
            <div className="relative font-mono">
                {/* Scoreboard / HUD */}
                <div className="flex justify-between items-center mb-10 bg-black/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <button 
                        onClick={() => { playClick(); setDifficulty(null); stopBriefing(); }} 
                        className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
                    >
                        <ChevronLeftIcon className="w-3 h-3" /> [ Abort_Session ]
                    </button>
                    
                    <div className="text-center relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.3em]">Neural_credits_Sync</span>
                        </div>
                        <motion.p 
                            key={score}
                            initial={{ scale: 1.2, color: '#fff' }}
                            animate={{ scale: 1, color: score >= 0 ? '#fff' : '#ef4444' }}
                            className="text-6xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {score < 0 && '-'}${Math.abs(score)}
                        </motion.p>
                    </div>

                    <div className="hidden sm:flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                        <div className="text-right">
                             <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Progress</p>
                             <p className="text-xs font-bold text-[var(--gold)]">{answeredQuestions.length} / 20</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center text-[var(--gold)]">
                             <TrophyIcon className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Tactical Game Grid */}
                <div className="grid grid-cols-5 gap-3 sm:gap-6">
                    {CATEGORIES.map(cat => (
                        <div key={cat} className="space-y-4 min-w-[100px]">
                            {/* Sector Header */}
                            <div className="relative group/header">
                                <div className="absolute inset-0 bg-[var(--gold)] blur-md opacity-0 group-hover/header:opacity-20 transition-opacity" />
                                <div className="relative bg-white/[0.03] text-white border border-white/10 font-black text-[9px] sm:text-[11px] py-4 rounded-xl text-center uppercase tracking-tighter shadow-inner overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                     {cat}
                                </div>
                            </div>
                            
                            {/* Question Nodes */}
                            {currentQuestions && currentQuestions[cat].map((q, i) => {
                                const isAnswered = answeredQuestions.includes(q.id);
                                return (
                                    <motion.button
                                        key={q.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleQuestionClick(q)}
                                        onMouseEnter={playHover}
                                        disabled={isAnswered}
                                        className={`group relative w-full aspect-[4/3] rounded-2xl border-2 flex items-center justify-center font-black text-xl sm:text-3xl transition-all duration-500 overflow-hidden ${
                                            isAnswered 
                                                ? 'bg-black/60 border-white/5 text-white/5 cursor-default' 
                                                : 'bg-black/40 border-white/10 text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:-translate-y-1'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%,rgba(255,255,255,0.02))] bg-[size:8px_8px]" />
                                        <span className="relative z-10 tabular-nums">{isAnswered ? '' : `$${q.value}`}</span>
                                        {!isAnswered && (
                                            <motion.div 
                                                className="absolute bottom-0 left-0 h-[2px] bg-[var(--gold)]"
                                                initial={{ width: 0 }}
                                                whileHover={{ width: '100%' }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Tactical Question Interface (Modal) */}
                <AnimatePresence>
                    {activeQuestion && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                className="bg-[#08080a] border-2 border-white/10 rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative"
                            >
                                {/* Modal Header Area */}
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)]">
                                            <BrainIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-[var(--gold)] uppercase tracking-[0.4em]">Retrieval_Target</p>
                                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">${activeQuestion.value}</h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Latency: 12ms</p>
                                        <p className="text-[9px] font-mono text-green-500 uppercase tracking-widest animate-pulse">Syncing...</p>
                                    </div>
                                </div>

                                {/* Question Body */}
                                <div className="p-10 space-y-12">
                                    <div className="relative">
                                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-red-600 rounded-full opacity-40 shadow-[0_0_10px_red]" />
                                        <p className="text-2xl sm:text-4xl font-black text-white leading-[1.1] tracking-tight pl-4">
                                            {activeQuestion.question}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {activeQuestion.options.map((option, idx) => {
                                            let btnClass = "bg-white/[0.02] border-white/10 text-white/60 hover:border-white/40 hover:bg-white/[0.05]";
                                            
                                            if (isAnswerRevealed) {
                                                if (idx === activeQuestion.answer) {
                                                    btnClass = "bg-green-500/10 border-green-500 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]";
                                                } else if (idx === selectedOption) {
                                                    btnClass = "bg-red-500/10 border-red-500 text-red-400 opacity-40";
                                                } else {
                                                    btnClass = "bg-black/40 border-white/5 text-white/10";
                                                }
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => { playClick(); handleAnswerSubmit(idx); }}
                                                    disabled={isAnswerRevealed}
                                                    className={`p-6 rounded-2xl border-2 text-left font-black transition-all duration-500 uppercase tracking-wider text-xs sm:text-sm relative overflow-hidden group/opt ${btnClass}`}
                                                >
                                                    <span className="relative z-10">{option}</span>
                                                    {!isAnswerRevealed && (
                                                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--gold)]/0 via-[var(--gold)]/5 to-transparent -translate-x-full group-hover/opt:translate-x-full transition-transform duration-1000" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Intelligence Analysis & Continue */}
                                    <AnimatePresence>
                                        {isAnswerRevealed && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pt-10 border-t border-white/5 space-y-8"
                                            >
                                                <div className="bg-black/60 p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group/feedback">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent opacity-0 group-hover/feedback:opacity-100 transition-opacity" />
                                                    <div className="flex items-start gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                                            <SparklesIcon className="w-7 h-7 text-[var(--gold)]" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Neural_Analysis:</h5>
                                                            <p className="text-lg text-white/80 font-light italic leading-relaxed">
                                                                "{activeQuestion.explanation}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-center">
                                                    <ControlButton onClick={handleCloseQuestion} className="h-16 px-16 uppercase text-[11px] font-black tracking-[0.3em]">Continue_to_Grid</ControlButton>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DemoSection>
    );
};

// Reused simple icons for local consistency
const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);

export default JeopardyDemo;