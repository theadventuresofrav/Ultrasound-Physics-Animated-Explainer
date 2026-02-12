import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useSound } from '../../contexts/SoundContext';
import ControlButton from './ControlButton';
import DemoSection from './DemoSection';
import { TargetIcon, TrophyIcon, BrainIcon, SparklesIcon, SpeakerWaveIcon, CheckBadgeIcon, BeakerIcon } from '../Icons';

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

const GAME_DATA: GameData = {
    Beginner: {
        Basics: [
            { id: 'b-ba-100', value: 100, question: 'What is the frequency range of diagnostic ultrasound?', options: ['20-20,000 Hz', '> 20,000 Hz', '2-15 MHz', '< 20 Hz'], answer: 2, explanation: 'Diagnostic ultrasound typically uses frequencies between 2 MHz and 15 MHz.' },
            { id: 'b-ba-200', value: 200, question: 'What is the average speed of sound in soft tissue?', options: ['1,540 m/s', '1,450 m/s', '330 m/s', '4,080 m/s'], answer: 0, explanation: 'The ultrasound machine assumes a propagation speed of 1,540 m/s (1.54 mm/µs) for soft tissue.' },
            { id: 'b-ba-300', value: 300, question: 'Which parameter is determined by both the source and the medium?', options: ['Frequency', 'Period', 'Wavelength', 'Propagation Speed'], answer: 2, explanation: 'Wavelength (λ) is determined by both the source (frequency) and the medium (speed): λ = c/f.' },
            { id: 'b-ba-400', value: 400, question: 'As frequency increases, what happens to penetration?', options: ['Increases', 'Decreases', 'Stays the same', 'Doubles'], answer: 1, explanation: 'High frequency sound is attenuated more quickly, reducing penetration depth.' },
            { id: 'b-ba-500', value: 500, question: 'Sound travels slowest through which of the following?', options: ['Bone', 'Soft Tissue', 'Fat', 'Air'], answer: 3, explanation: 'Air has the lowest propagation speed (~330 m/s) because of its low stiffness.' },
        ],
        Transducers: [
            { id: 'b-tr-100', value: 100, question: 'Which component converts electrical energy to sound energy?', options: ['Matching Layer', 'Backing Material', 'PZT Crystal', 'Lens'], answer: 2, explanation: 'The Piezoelectric (PZT) crystal converts electricity to sound (transmission) and sound to electricity (reception).' },
            { id: 'b-tr-200', value: 200, question: 'Which transducer produces a rectangular image?', options: ['Linear Sequential', 'Curvilinear', 'Phased Array', 'Mechanical Sector'], answer: 0, explanation: 'Linear sequential arrays fire elements in parallel groups, creating a rectangular field of view.' },
            { id: 'b-tr-300', value: 300, question: 'What is the purpose of gel?', options: ['Cool the patient', 'Remove air', 'Clean the probe', 'Anesthetize skin'], answer: 1, explanation: 'Gel removes the air between the transducer and skin, which would otherwise reflect almost all the sound.' },
            { id: 'b-tr-400', value: 400, question: 'Which part improves axial resolution by shortening the pulse?', options: ['Matching Layer', 'Backing Material', 'Lens', 'Case'], answer: 1, explanation: 'Backing (damping) material stops the crystal from ringing, creating short pulses needed for good axial resolution.' },
            { id: 'b-tr-500', value: 500, question: 'A thinner crystal produces what frequency?', options: ['Lower', 'Higher', 'No change', 'Variable'], answer: 1, explanation: 'Crystal thickness is inversely related to frequency; thinner crystals resonate at higher frequencies.' },
        ],
        Doppler: [
            { id: 'b-do-100', value: 100, question: 'What does BART stand for?', options: ['Blue Away Red Towards', 'Blood Artery Red Time', 'Blue Artery Red Towards', 'Base Above Red Top'], answer: 0, explanation: 'BART is the standard convention: Blue represents flow Away from the probe, Red represents flow Towards.' },
            { id: 'b-do-200', value: 200, question: 'A positive Doppler shift means blood is moving...', options: ['Away', 'Towards', 'Perpendicular', 'Turbulently'], answer: 1, explanation: 'A positive shift occurs when the received frequency is higher than transmitted, indicating motion towards the source.' },
            { id: 'b-do-300', value: 300, question: 'Which angle provides the most accurate velocity measurement?', options: ['90 degrees', '60 degrees', '45 degrees', '0 degrees'], answer: 3, explanation: 'The cosine of 0 degrees is 1, providing the full, true velocity. 90 degrees provides no shift.' },
            { id: 'b-do-400', value: 400, question: 'What artifact occurs when the Nyquist limit is exceeded?', options: ['Shadowing', 'Aliasing', 'Reverberation', 'Mirror Image'], answer: 1, explanation: 'Aliasing is the wrapping around of the spectral waveform when the Doppler shift exceeds PRF/2.' },
            { id: 'b-do-500', value: 500, question: 'Continuous wave Doppler uses how many crystals?', options: ['One', 'Two', 'Three', 'Four'], answer: 1, explanation: 'CW Doppler requires two crystals: one to continuously transmit and one to continuously receive.' },
        ],
        Artifacts: [
            { id: 'b-ar-100', value: 100, question: 'What artifact is seen behind a gallstone?', options: ['Enhancement', 'Shadowing', 'Comet Tail', 'Mirror Image'], answer: 1, explanation: 'Stones are highly attenuating/reflecting, preventing sound from passing, creating a shadow.' },
            { id: 'b-ar-200', value: 200, question: 'What artifact is seen behind a simple cyst?', options: ['Enhancement', 'Shadowing', 'Reverberation', 'Side Lobe'], answer: 0, explanation: 'Fluid attenuates less than surrounding tissue, so echoes behind it are stronger (brighter).' },
            { id: 'b-ar-300', value: 300, question: 'Which artifact looks like a ladder?', options: ['Reverberation', 'Mirror Image', 'Shadowing', 'Speed Error'], answer: 0, explanation: 'Reverberation creates multiple, equally spaced echoes caused by bouncing between two reflectors.' },
            { id: 'b-ar-400', value: 400, question: 'Where is a mirror image artifact located?', options: ['Shallower', 'Deeper', 'Lateral', 'Medial'], answer: 1, explanation: 'The artifact is always placed deeper than the true reflector because of the extra time the pulse took to bounce.' },
            { id: 'b-ar-500', value: 500, question: 'Speckle is caused by what phenomenon?', options: ['Absorption', 'Refraction', 'Interference', 'Reflection'], answer: 2, explanation: 'Speckle is an interference pattern of scattered waves, not true tissue texture.' },
        ],
        Safety: [
            { id: 'b-sa-100', value: 100, question: 'What does ALARA stand for?', options: ['As Low As Reasonably Achievable', 'Always Leave Area Radiation Absent', 'All Levels Are Right Always', 'Acoustic Level And Rate Average'], answer: 0, explanation: 'Use the lowest power and shortest time necessary to get a diagnostic image.' },
            { id: 'b-sa-200', value: 200, question: 'Which index relates to tissue heating?', options: ['MI', 'TI', 'PI', 'RI'], answer: 1, explanation: 'The Thermal Index (TI) estimates the potential for tissue temperature rise.' },
            { id: 'b-sa-300', value: 300, question: 'Which index relates to cavitation?', options: ['MI', 'TI', 'PI', 'RI'], answer: 0, explanation: 'The Mechanical Index (MI) estimates the potential for non-thermal bioeffects like cavitation.' },
            { id: 'b-sa-400', value: 400, question: 'Which control affects patient exposure?', options: ['Gain', 'TGC', 'Dynamic Range', 'Output Power'], answer: 3, explanation: 'Output Power determines the intensity of sound sent into the patient. Gain only amplifies the return signal.' },
            { id: 'b-sa-500', value: 500, question: 'Which Doppler mode has the highest acoustic output?', options: ['B-mode', 'Color Doppler', 'Spectral Doppler', 'M-mode'], answer: 2, explanation: 'Spectral Doppler concentrates more energy over time, resulting in higher SPTA intensity.' },
        ],
    },
    Intermediate: {
        Basics: [
            { id: 'i-ba-100', value: 100, question: 'Attenuation is the sum of reflection, scattering, and...?', options: ['Refraction', 'Absorption', 'Transmission', 'Diffraction'], answer: 1, explanation: 'Absorption (conversion to heat) is the primary component of attenuation.' },
            { id: 'i-ba-200', value: 200, question: 'The attenuation coefficient in soft tissue is approximately?', options: ['0.5 dB/cm/MHz', '1.0 dB/cm/MHz', '2.0 dB/cm/MHz', '10 dB/cm/MHz'], answer: 0, explanation: 'Soft tissue attenuates approx. 0.5 dB for every cm of depth for every MHz of frequency.' },
            { id: 'i-ba-300', value: 300, question: 'Impedance (Z) is calculated as:', options: ['Density x Speed', 'Density / Speed', 'Frequency x Wavelength', 'Power / Area'], answer: 0, explanation: 'Acoustic Impedance (Rayls) = Density (kg/m³) × Propagation Speed (m/s).' },
            { id: 'i-ba-400', value: 400, question: 'Refraction requires oblique incidence and:', options: ['Different Densities', 'Different Impedances', 'Different Speeds', 'Different Temperatures'], answer: 2, explanation: 'Snell\'s Law dictates that refraction occurs only if propagation speeds of the two media differ.' },
            { id: 'i-ba-500', value: 500, question: 'What is the period of a 5 MHz wave?', options: ['0.2 µs', '2.0 µs', '0.5 µs', '5.0 µs'], answer: 0, explanation: 'Period (T) = 1/f. 1 / 5,000,000 Hz = 0.0000002 seconds, or 0.2 µs.' },
        ],
        Transducers: [
            { id: 'i-tr-100', value: 100, question: 'The matching layer thickness is:', options: ['1/2 Wavelength', '1/4 Wavelength', '1 Wavelength', 'Variable'], answer: 1, explanation: '1/4 wavelength thickness causes destructive interference of wall echoes, enhancing transmission.' },
            { id: 'i-tr-200', value: 200, question: 'Which resolution is best in clinical imaging?', options: ['Axial', 'Lateral', 'Elevational', 'Temporal'], answer: 0, explanation: 'Axial resolution (LARRD) is usually the best spatial resolution because pulses are very short.' },
            { id: 'i-tr-300', value: 300, question: 'What improves lateral resolution?', options: ['Damping', 'Focusing', 'Lower Frequency', 'Thicker Crystal'], answer: 1, explanation: 'Focusing narrows the beam width. Lateral resolution is equal to the beam width.' },
            { id: 'i-tr-400', value: 400, question: 'Low Q-factor transducers have:', options: ['Long pulse, narrow bandwidth', 'Short pulse, wide bandwidth', 'High sensitivity', 'No backing material'], answer: 1, explanation: 'Imaging probes use backing material to create short pulses, which results in a wide bandwidth and low Q-factor.' },
            { id: 'i-tr-500', value: 500, question: 'Which part provides the electrical connection to the PZT?', options: ['Matching layer', 'Wire', 'Backing', 'Acoustic lens'], answer: 1, explanation: 'The wire provides the electrical pulse to stimulate the crystal and receives the returning electrical signal.' },
        ],
        Doppler: [
            { id: 'i-do-100', value: 100, question: 'The Nyquist limit is equal to:', options: ['PRF', 'PRF / 2', 'PRF x 2', 'Frequency / 2'], answer: 1, explanation: 'Aliasing occurs when the Doppler shift exceeds half the Pulse Repetition Frequency.' },
            { id: 'i-do-200', value: 200, question: 'Which processing technique is used for Spectral Doppler?', options: ['Autocorrelation', 'FFT', 'Demodulation', 'Scan Conversion'], answer: 1, explanation: 'Fast Fourier Transform (FFT) is accurate enough to process the complex individual frequencies in spectral Doppler.' },
            { id: 'i-do-300', value: 300, question: 'Wall filters eliminate:', options: ['High velocity signals', 'Aliased signals', 'Low frequency, high amplitude signals', 'Turbulent flow'], answer: 2, explanation: 'Wall filters (high pass filters) remove the strong, low-shift signals caused by moving vessel walls.' },
            { id: 'i-do-400', value: 400, question: 'What is the advantage of Power Doppler?', options: ['Directional info', 'Velocity measurement', 'Increased sensitivity', 'No flash artifact'], answer: 2, explanation: 'Power Doppler detects amplitude, making it independent of angle and highly sensitive to slow flow.' },
            { id: 'i-do-500', value: 500, question: 'If PRF is 10 kHz, what is the Nyquist limit?', options: ['5 kHz', '10 kHz', '20 kHz', '2.5 kHz'], answer: 0, explanation: 'Nyquist Limit = PRF / 2. 10 / 2 = 5 kHz.' },
        ],
        Artifacts: [
            { id: 'i-ar-100', value: 100, question: 'Propagation speed error places echoes:', options: ['Laterally displaced', 'At incorrect depths', 'With wrong brightness', 'As multiple lines'], answer: 1, explanation: 'If speed < 1540, echoes arrive late and are placed too deep. If speed > 1540, too shallow.' },
            { id: 'i-ar-200', value: 200, question: 'Which artifact is related to slice thickness?', options: ['Partial Volume', 'Mirror Image', 'Refraction', 'Comet Tail'], answer: 0, explanation: 'Partial volume (slice thickness) artifact fills in anechoic structures when the beam is wider than the structure.' },
            { id: 'i-ar-300', value: 300, question: 'Side lobes and grating lobes degrade:', options: ['Axial resolution', 'Lateral resolution', 'Temporal resolution', 'Contrast resolution'], answer: 1, explanation: 'Lobes send energy off-axis. If they hit a reflector, it is mapped to the main beam axis, widening the apparent structure.' },
            { id: 'i-ar-400', value: 400, question: 'Crosstalk in Doppler looks like:', options: ['Aliasing', 'Mirror Image spectrum', 'Spectral Broadening', 'Wall noise'], answer: 1, explanation: 'Crosstalk appears as an identical Doppler spectrum above and below the baseline, often due to high gain.' },
            { id: 'i-ar-500', value: 500, question: 'Multipath artifact occurs when:', options: ['Beam is refracted', 'Sound reflects off multiple structures before returning', 'Speed is wrong', 'Gain is too high'], answer: 1, explanation: 'Multipath involves sound taking a longer path than a straight line, placing the echo at an incorrect depth.' },
        ],
        Safety: [
            { id: 'i-sa-100', value: 100, question: 'Transient cavitation is also known as:', options: ['Stable', 'Inertial', 'Thermal', 'Mechanical'], answer: 1, explanation: 'Inertial (transient) cavitation describes the violent collapse of bubbles.' },
            { id: 'i-sa-200', value: 200, question: 'Which mode has the highest typical SPTA intensity?', options: ['B-Mode', 'M-Mode', 'Color Doppler', 'PW Doppler'], answer: 3, explanation: 'PW Doppler concentrates energy in a small gate with a high PRF, leading to the highest temporal average intensity.' },
            { id: 'i-sa-300', value: 300, question: 'A hydrophone measures:', options: ['Total power', 'Pressure amplitude', 'Tissue temp', 'Impedance'], answer: 1, explanation: 'A hydrophone is a small needle probe used to measure pressure at specific locations in the beam.' },
            { id: 'i-sa-400', value: 400, question: 'No bioeffects have been confirmed below an SPTA of:', options: ['1 mW/cm²', '100 mW/cm²', '1 W/cm²', '100 W/cm²'], answer: 1, explanation: 'For an unfocused beam, 100 mW/cm² is the AIUM limit for confirmed bioeffects. (1 W/cm² for focused).' },
            { id: 'i-sa-500', value: 500, question: 'The Mechanical Index is inversely related to:', options: ['Frequency', 'Pressure', 'Depth', 'Gain'], answer: 0, explanation: 'MI = Peak Rarefactional Pressure / √Frequency.' },
        ],
    },
    Advanced: {
        Basics: [
            { id: 'a-ba-100', value: 100, question: 'Which intensity is most relevant to tissue heating?', options: ['SPTP', 'SATP', 'SPTA', 'SATA'], answer: 2, explanation: 'Spatial Peak Temporal Average (SPTA) correlates best with tissue heating effects.' },
            { id: 'a-ba-200', value: 200, question: 'The Duty Factor for continuous wave ultrasound is:', options: ['0.1%', '1%', '50%', '100%'], answer: 3, explanation: 'CW is always on, so the duty factor is 1.0 or 100%.' },
            { id: 'a-ba-300', value: 300, question: 'A 3 dB drop corresponds to a ratio of:', options: ['0.5', '0.25', '0.1', '0.75'], answer: 0, explanation: '-3 dB represents a halving of intensity (1/2 or 0.5).' },
            { id: 'a-ba-400', value: 400, question: 'Snell\'s Law describes:', options: ['Reflection', 'Refraction', 'Scattering', 'Absorption'], answer: 1, explanation: 'Sin(trans)/Sin(inc) = Speed2/Speed1. This governs the angle of refraction.' },
            { id: 'a-ba-500', value: 500, question: 'What is the wavelength of a 2 MHz wave in soft tissue?', options: ['1.54 mm', '0.77 mm', '3.08 mm', '0.38 mm'], answer: 1, explanation: 'λ = c/f. 1.54 / 2 = 0.77 mm.' },
        ],
        Transducers: [
            { id: 'a-tr-100', value: 100, question: 'Apodization reduces:', options: ['Axial resolution', 'Grating lobes', 'Main beam width', 'Pulse length'], answer: 1, explanation: 'Varying the voltage across elements (stronger center, weaker outer) reduces lobe artifacts.' },
            { id: 'a-tr-200', value: 200, question: 'Dynamic Receive Focusing uses:', options: ['Lens', 'Curved Crystal', 'Variable Time Delays', 'Apodization'], answer: 2, explanation: 'The system adds time delays to received echoes based on depth to keep the beam focused at all depths.' },
            { id: 'a-tr-300', value: 300, question: 'Which probe uses 1.5D arrays?', options: ['3D probes', 'Slice thickness control', 'CW probes', 'Pedoff'], answer: 1, explanation: '1.5D arrays have multiple rows of crystals to allow electronic focusing in the elevational plane (slice thickness).' },
            { id: 'a-tr-400', value: 400, question: 'Subdicing helps reduce:', options: ['Reverberation', 'Grating Lobes', 'Side Lobes', 'Aliasing'], answer: 1, explanation: 'Cutting elements into smaller sub-elements (subdicing) reduces the center-to-center distance, mitigating grating lobes.' },
            { id: 'a-tr-500', value: 500, question: 'What is the focus of a 10mm diameter, 5 MHz unfocused probe?', options: ['5 mm', '25 mm', '50 mm', '10 mm'], answer: 1, explanation: 'NZL = (D² x f) / 6. (100 x 5) / 6 ≈ 83mm. (Simplified formula use here for brevity). Standard NZL = D² / (4λ).' },
        ],
        Doppler: [
            { id: 'a-do-100', value: 100, question: 'The resistive index (RI) formula is:', options: ['(PSV-EDV)/PSV', '(PSV-EDV)/Mean', 'PSV/EDV', 'PSV-EDV'], answer: 0, explanation: 'Resistive Index = (Peak Systolic - End Diastolic) / Peak Systolic.' },
            { id: 'a-do-200', value: 200, question: 'Which provides the best range resolution?', options: ['HPRF Doppler', 'CW Doppler', 'PW Doppler', 'Color Doppler'], answer: 2, explanation: 'Standard PW Doppler has exact range resolution due to a single gate. HPRF introduces range ambiguity to measure high velocities.' },
            { id: 'a-do-300', value: 300, question: 'Color packets with more pulses have:', options: ['Better temporal res', 'Better velocity accuracy', 'Less energy', 'Worse sensitivity'], answer: 1, explanation: 'Larger packet size (ensemble length) gives more data for averaging, improving velocity accuracy but slowing frame rate.' },
            { id: 'a-do-400', value: 400, question: 'Bernoulli\'s principle relates:', options: ['Velocity and Pressure', 'Flow and Resistance', 'Voltage and Current', 'Frequency and Speed'], answer: 0, explanation: 'As velocity increases (e.g., in a stenosis), pressure decreases to conserve energy (ΔP = 4v²).' },
            { id: 'a-do-500', value: 500, question: 'Pressure gradient in a stenosis is calculated by:', options: ['4v²', '2v²', 'v²', '8v²'], answer: 0, explanation: 'Modified Bernoulli: ΔP = 4v².' },
        ],
        Artifacts: [
            { id: 'a-ar-100', value: 100, question: 'Which artifact is reduced by spatial compounding?', options: ['Mirror Image', 'Speckle', 'Aliasing', 'Speed Error'], answer: 1, explanation: 'Averaging frames from different angles smooths out the constructive/destructive interference pattern known as speckle.' },
            { id: 'a-ar-200', value: 200, question: 'Range Ambiguity occurs when:', options: ['PRF is too high', 'PRF is too low', 'Gain is too high', 'Focus is too deep'], answer: 0, explanation: 'If PRF is too high, the next pulse is sent before the previous one returns from deep structures, confusing the depth.' },
            { id: 'a-ar-300', value: 300, question: 'Which artifact creates lateral displacement?', options: ['Reverberation', 'Refraction', 'Mirror Image', 'Enhancement'], answer: 1, explanation: 'Refraction bends the beam. The machine assumes a straight line, placing the echo laterally displaced from its true location.' },
            { id: 'a-ar-400', value: 400, question: 'Twinkle artifact is associated with:', options: ['Cysts', 'Calcifications/Stones', 'Lipomas', 'Hemangiomas'], answer: 1, explanation: 'Twinkle is a color Doppler artifact appearing as a mosaic of color behind a rough, high-impedance surface like a kidney stone.' },
            { id: 'a-ar-500', value: 500, question: 'Ghost artifacts in color Doppler are usually:', options: ['Bleeding/Flash', 'Aliasing', 'Shadowing', 'Mirroring'], answer: 0, explanation: 'Flash artifact (ghosting) results from tissue motion during color acquisition.' },
        ],
        Safety: [
            { id: 'a-sa-100', value: 100, question: 'TIB stands for:', options: ['Thermal Index Bone', 'Thermal Index Brain', 'Thermal Index Body', 'Tissue Index Base'], answer: 0, explanation: 'TIB is the Thermal Index calculated assuming bone is at the beam focus (e.g., fetal ultrasound).' },
            { id: 'a-sa-200', value: 200, question: 'Which modality has the lowest duty factor?', options: ['CW Doppler', 'B-Mode', 'M-Mode', 'Color Doppler'], answer: 1, explanation: 'B-Mode has a very short pulse and long listening time, resulting in the lowest duty factor (<0.1%).' },
            { id: 'a-sa-300', value: 300, question: 'Mechanical Index is proportional to:', options: ['Peak Rarefactional Pressure', 'Peak Compressional Pressure', 'Frequency', 'Pulse Length'], answer: 0, explanation: 'MI = Peak Rarefactional Pressure / √Frequency.' },
            { id: 'a-sa-400', value: 400, question: 'A radiation force balance measures:', options: ['Intensity', 'Pressure', 'Power', 'Beam Width'], answer: 2, explanation: 'It measures the total power of the sound beam by detecting the force the beam exerts on a target.' },
            { id: 'a-sa-500', value: 500, question: 'The AIUM safe SPTA limit for focused beams is:', options: ['100 mW/cm²', '1 W/cm²', '10 W/cm²', '0.1 W/cm²'], answer: 1, explanation: '1.0 W/cm² or 1000 mW/cm² is the confirmed safety threshold for focused beams.' },
        ],
    }
};

const CATEGORIES: Category[] = ['Basics', 'Transducers', 'Doppler', 'Artifacts', 'Safety'];

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
    'Basics': <SpeakerWaveIcon className="w-4 h-4" />,
    'Transducers': <BeakerIcon className="w-4 h-4" />,
    'Doppler': <TargetIcon className="w-4 h-4" />,
    'Artifacts': <SparklesIcon className="w-4 h-4" />,
    'Safety': <CheckBadgeIcon className="w-4 h-4" />
};

// --- Sub-Components ---

const JeopardyCard: React.FC<{
    value: number;
    isAnswered: boolean;
    onClick: () => void;
    index: number;
}> = ({ value, isAnswered, onClick, index }) => {
    const { playHover } = useSound();
    
    return (
        <motion.button
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.02, type: "spring", stiffness: 120 }}
            onClick={onClick}
            disabled={isAnswered}
            onMouseEnter={playHover}
            className={`group relative w-full aspect-[4/3] sm:aspect-[4/3] rounded-xl sm:rounded-2xl border-2 flex flex-col items-center justify-center font-black transition-all duration-500 overflow-hidden min-h-[60px] ${
                isAnswered 
                    ? 'bg-black/60 border-white/5 cursor-default opacity-40' 
                    : 'bg-[#0a0a0a] border-white/10 text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 active:scale-95'
            }`}
        >
            <AnimatePresence mode="wait">
                {isAnswered ? (
                    <motion.div 
                        key="answered"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center opacity-40"
                    >
                        <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/40" />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <span className="text-lg sm:text-2xl italic tabular-nums font-mono drop-shadow-lg">${value}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        </motion.button>
    );
};

const SectorProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3 border border-white/5">
        <motion.div 
            className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] shadow-[0_0_10px_var(--gold)]" 
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 1, ease: "circOut" }}
        />
    </div>
);

const JeopardyDemo: React.FC = () => {
    const { awardAchievement, addEchoCredits } = useUser();
    const { playClick, playHover, narrateText, stopBriefing, playSuccess, playError } = useSound();
    
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [score, setScore] = useState(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [missionTime, setMissionTime] = useState(0);
    const [stability, setStability] = useState(100);

    useEffect(() => {
        let timer: any;
        if (difficulty && !activeQuestion) {
            timer = setInterval(() => setMissionTime(t => t + 1), 1000);
        }
        return () => clearInterval(timer);
    }, [difficulty, activeQuestion]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStability(95 + Math.random() * 5);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

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
            addEchoCredits(activeQuestion.value / 10);
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
    };

    const handleDifficultySelect = (level: Difficulty) => {
        playClick();
        setDifficulty(level);
        setMissionTime(0);
        setScore(0);
        setAnsweredQuestions([]);
        narrateText(`Initializing ${level} retrieval grid.`);
    };

    const getCategoryProgress = (cat: Category) => {
        if (!currentQuestions) return 0;
        const total = currentQuestions[cat].length;
        const done = currentQuestions[cat].filter(q => answeredQuestions.includes(q.id)).length;
        return (done / total) * 100;
    };

    if (!difficulty) {
        return (
            <DemoSection title="Jeopardy Challenge" description="High-speed data retrieval simulation. Calibrate physics intuition against the grid.">
                <div className="flex flex-col items-center justify-center py-10 sm:py-24 gap-8 relative overflow-hidden">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 relative z-10">
                         <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Select_Tier</h3>
                         <div className="h-1 w-16 bg-[var(--gold)]/30 mx-auto rounded-full" />
                    </motion.div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10 w-full max-w-5xl px-4">
                        {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((level, i) => (
                            <motion.button
                                key={level}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                                onClick={() => handleDifficultySelect(level)}
                                onMouseEnter={playHover}
                                className="group relative flex-1 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white/[0.02] border-2 border-white/5 hover:border-[var(--gold)]/50 transition-all duration-500 flex flex-col items-center text-center"
                            >
                                <div className="text-4xl mb-4">{level === 'Beginner' ? '🔋' : level === 'Intermediate' ? '🔌' : '⚡'}</div>
                                <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[var(--gold)] transition-colors uppercase italic leading-none mb-2">{level}</h4>
                                <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{level === 'Beginner' ? 'Fundamentals' : level === 'Intermediate' ? 'Tactical' : 'Elite'}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </DemoSection>
        );
    }

    return (
        <DemoSection title={`Jeopardy: ${difficulty}`} description="Rapid retrieval across sectors. Scroll grid horizontally on mobile.">
            <LayoutGroup>
                <div className="relative font-mono">
                    {/* HUD Header */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8 sm:mb-14 bg-[#08080a]/95 backdrop-blur-3xl p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="flex-1 flex flex-col gap-4">
                             <button onClick={() => { playClick(); setDifficulty(null); stopBriefing(); }} className="flex items-center gap-2 text-[9px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest w-fit border border-white/10 px-3 py-1.5 rounded-lg bg-white/5">
                                [ Abort_Session ]
                            </button>
                            <div className="flex items-center gap-4 mt-2">
                                 <div className="space-y-0.5">
                                    <p className="text-[7px] text-white/20 uppercase tracking-widest">Temporal</p>
                                    <p className="text-xs font-bold text-white tabular-nums">{Math.floor(missionTime/60)}:{String(missionTime%60).padStart(2, '0')}</p>
                                 </div>
                                 <div className="w-[1px] h-6 bg-white/10" />
                                 <div className="space-y-0.5">
                                    <p className="text-[7px] text-white/20 uppercase tracking-widest">Score</p>
                                    <p className={`text-xs font-bold tabular-nums ${score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{score >= 0 ? '$' : '-$'}{Math.abs(score)}</p>
                                 </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-0 border-y border-white/5 md:border-none">
                            <motion.p key={score} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-4xl sm:text-6xl font-black tracking-tighter tabular-nums italic leading-none drop-shadow-2xl">
                                ${score}
                            </motion.p>
                        </div>

                        <div className="flex-1 flex items-center justify-end gap-4">
                            <div className="text-right">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Progress</p>
                                 <p className="text-lg font-black text-[var(--gold)]">{answeredQuestions.length}/25</p>
                            </div>
                            <TrophyIcon className="w-8 h-8 text-[var(--gold)] opacity-30" />
                        </div>
                    </div>

                    {/* Grid Container */}
                    <div className="overflow-x-auto no-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 sm:grid sm:grid-cols-5 sm:gap-6 min-w-[800px] sm:min-w-0">
                            {CATEGORIES.map((cat, catIdx) => {
                                const progress = getCategoryProgress(cat);
                                return (
                                    <div key={cat} className="flex-1 space-y-4 sm:space-y-6">
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }} className="relative bg-[#0c0c0e]/90 border border-white/10 p-4 rounded-xl text-center shadow-xl flex flex-col items-center gap-2">
                                            <span className={`transition-all ${progress === 100 ? 'text-green-400' : 'opacity-40 text-[var(--gold)]'}`}>
                                                {progress === 100 ? <CheckBadgeIcon className="w-5 h-5" /> : CATEGORY_ICONS[cat]}
                                            </span>
                                            <span className="font-black text-[9px] uppercase tracking-tighter italic leading-none truncate w-full">{cat}</span>
                                            <SectorProgressBar progress={progress} />
                                        </motion.div>
                                        
                                        <div className="space-y-3">
                                            {currentQuestions && currentQuestions[cat].map((q, i) => (
                                                <JeopardyCard 
                                                    key={q.id}
                                                    value={q.value}
                                                    isAnswered={answeredQuestions.includes(q.id)}
                                                    onClick={() => handleQuestionClick(q)}
                                                    index={i + (catIdx * 5)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Question Modal */}
                    <AnimatePresence>
                        {activeQuestion && (
                            <div className="fixed inset-0 z-[400] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-[20px]">
                                 <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.05 }}
                                    className="bg-[#08080a] border border-white/10 rounded-[1.5rem] sm:rounded-[3rem] w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl relative flex flex-col"
                                >
                                    <div className="p-6 sm:p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)]">
                                                <TargetIcon className="w-7 h-7" />
                                            </div>
                                            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase italic leading-none tabular-nums">${activeQuestion.value}</h3>
                                        </div>
                                        <button onClick={handleCloseQuestion} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all text-xl">✕</button>
                                    </div>

                                    <div className="flex-grow p-6 sm:p-10 overflow-y-auto no-scrollbar space-y-8">
                                        <p className="text-xl sm:text-3xl font-black text-white leading-tight italic border-l-4 sm:border-l-8 border-red-600 pl-4 sm:pl-8">
                                            {activeQuestion.question}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {activeQuestion.options.map((option, idx) => {
                                                let btnClass = "bg-white/[0.03] border-white/5 text-white/70 hover:border-white/20";
                                                if (isAnswerRevealed) {
                                                    if (idx === activeQuestion.answer) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                                                    else if (idx === selectedOption) btnClass = "bg-red-500/10 border-red-500 text-red-400 opacity-60";
                                                    else btnClass = "bg-black/40 border-white/5 text-white/20 opacity-40";
                                                }
                                                return (
                                                    <motion.button
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                                                        onClick={() => handleAnswerSubmit(idx)}
                                                        disabled={isAnswerRevealed}
                                                        className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left font-black transition-all uppercase tracking-wide text-[10px] sm:text-xs ${btnClass}`}
                                                    >
                                                        {option}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>

                                        {isAnswerRevealed && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-6 border-t border-white/5 space-y-6">
                                                <div className="bg-[#0c0c0e] p-5 rounded-2xl border border-white/10 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)]" />
                                                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic">
                                                        "{activeQuestion.explanation}"
                                                    </p>
                                                </div>
                                                <ControlButton onClick={handleCloseQuestion} fullWidth className="h-14 sm:h-16 text-[9px] sm:text-xs font-black uppercase tracking-[0.4em]">
                                                    [ Continue_Mission ]
                                                </ControlButton>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </LayoutGroup>
        </DemoSection>
    );
};

export default JeopardyDemo;