
import { DemoId } from '../types';

export interface ModuleIntroData {
    title: string;
    subtext: string;
    lines: string[];
}

export const MODULE_INTROS: Record<string, ModuleIntroData> = {
    'waves': {
        title: "Wave Mechanics",
        subtext: "System: Propagation Dynamics",
        lines: [
            "Initiating acoustic kernel...",
            "Sound is energy in motion.",
            "Analyzing cycles of pressure.",
            "Calibrating propagation speeds.",
            "The foundation of every pixel starts here."
        ]
    },
    'transducers': {
        title: "The Engine",
        subtext: "System: Piezoelectric Core",
        lines: [
            "Electricity becomes sound.",
            "Crystals vibrating in perfect sync.",
            "The reverse effect is listening...",
            "Generating the beam of life."
        ]
    },
    'pulsed': {
        title: "Pulse-Echo",
        subtext: "System: Range Resolution",
        lines: [
            "Shouting into the void...",
            "And measuring the silence.",
            "Time equals distance.",
            "Mapping the anatomy of the unknown."
        ]
    },
    'resolution': {
        title: "Precision",
        subtext: "System: Spatial Clarity",
        lines: [
            "Defining the limits of sight.",
            "Separating the structures.",
            "Axial. Lateral. Elevational.",
            "Because every millimeter matters."
        ]
    },
    'doppler': {
        title: "Velocity",
        subtext: "System: Hemodynamics",
        lines: [
            "Motion shifts the frequency.",
            "Tracking the river within.",
            "Red approaches. Blue retreats.",
            "The physics of circulation active."
        ]
    },
    'artifacts': {
        title: "Illusions",
        subtext: "System: Error Analysis",
        lines: [
            "The machine assumes straight lines.",
            "But physics bends the truth.",
            "Shadows. Ghosts. Mirrors.",
            "Learning to see what isn't there."
        ]
    },
    'safety': {
        title: "Bioeffects",
        subtext: "System: Patient Protection",
        lines: [
            "Power creates heat.",
            "Pressure creates cavitation.",
            "Managing the invisible risk.",
            "Safety is the primary directive."
        ]
    },
    'hemodynamics': {
        title: "Fluid Flow",
        subtext: "System: Vascular Mechanics",
        lines: [
            "Pressure gradients drive the flow.",
            "Resistance fights back.",
            "Laminar vs. Turbulent.",
            "Understanding the river's path."
        ]
    },
    'qa': {
        title: "Calibration",
        subtext: "System: Quality Assurance",
        lines: [
            "Trust, but verify.",
            "Testing the limits of the machine.",
            "The phantom doesn't lie.",
            "Ensuring diagnostic integrity."
        ]
    },
    'harmonics': {
        title: "Resonance",
        subtext: "System: Non-Linear Optics",
        lines: [
            "Listen for the double frequency.",
            "Generated deep within the tissue.",
            "Filtering out the noise.",
            "Achieving crystal clear visualization."
        ]
    },
    'knobology': {
        title: "Optimization",
        subtext: "System: Control Interface",
        lines: [
            "The machine is raw potential.",
            "You are the architect.",
            "Gain. Focus. Depth.",
            "Crafting the perfect image."
        ]
    },
    'advanced_artifacts': {
        title: "Anomalies",
        subtext: "System: Advanced Errors",
        lines: [
            "Refraction distorts position.",
            "Lobes deceive the eye.",
            "Speed errors warp depth.",
            "Advanced diagnostics engaged."
        ]
    },
    'elastography': {
        title: "Stiffness",
        subtext: "System: Tissue Mechanics",
        lines: [
            "Palpating with sound waves.",
            "Mapping the resistance.",
            "Hard vs. Soft.",
            "Diagnosing the invisible through pressure."
        ]
    },
    'contrast_agents': {
        title: "Enhancement",
        subtext: "System: Microbubbles",
        lines: [
            "Gas-filled shells reflecting.",
            "Lighting up the vascular tree.",
            "Harmonic resonance detected.",
            "Seeing perfusion in real-time."
        ]
    },
    '3d_4d': {
        title: "Volumetric",
        subtext: "System: Spatial Rendering",
        lines: [
            "The Z-axis revealed.",
            "Slicing through the volume.",
            "Reconstructing reality.",
            "Time is the fourth dimension."
        ]
    },
    'biomedical_physics': {
        title: "Interactions",
        subtext: "System: Bio-Physics",
        lines: [
            "Reflection. Refraction. Absorption.",
            "The fate of the beam is sealed.",
            "Impedance mismatch defines us.",
            "Physics at the cellular level."
        ]
    },
    'abdominal': {
        title: "Abdomen",
        subtext: "Clinical: Protocol",
        lines: [
            "Penetrating the depths.",
            "Scanning the parenchyma.",
            "Liver. Kidney. Pancreas.",
            "Diagnostic imaging active."
        ]
    },
    'vascular': {
        title: "Circulation",
        subtext: "Clinical: Protocol",
        lines: [
            "The highways of the body.",
            "Arteries pulsate. Veins compress.",
            "Flow profiles analyzed.",
            "Detecting the stenosis."
        ]
    },
    'msk': {
        title: "Structure",
        subtext: "Clinical: Protocol",
        lines: [
            "Tendons. Ligaments. Nerves.",
            "Anisotropy hides the truth.",
            "Dynamic movement required.",
            "High frequency precision."
        ]
    },
    'cardiac': {
        title: "The Pump",
        subtext: "Clinical: Echo",
        lines: [
            "Rhythm and motion.",
            "Chambers filling. Valves opening.",
            "The engine of life.",
            "Real-time analysis engaged."
        ]
    },
    'processing': {
        title: "Signal Chain",
        subtext: "System: Processing",
        lines: [
            "Analog becomes Digital.",
            "Preprocessing the raw.",
            "Postprocessing the frozen.",
            "Zoom. Map. Persist."
        ]
    },
    'tgc': {
        title: "Compensation",
        subtext: "System: Gain Control",
        lines: [
            "Depth steals energy.",
            "We must compensate.",
            "Equalizing the brightness.",
            "Uniformity achieved."
        ]
    },
    'dynamic_range': {
        title: "Contrast",
        subtext: "System: Compression",
        lines: [
            "Shades of gray.",
            "Mapping the signal.",
            "High contrast vs Low contrast.",
            "Optimizing the display."
        ]
    },
    'study_guide': {
        title: "Knowledge",
        subtext: "Resource: Archives",
        lines: [
            "Accessing data vaults...",
            "Physics principles loaded.",
            "Definitions and formulas.",
            "Review mode engaged."
        ]
    },
    'jeopardy': {
        title: "Challenge",
        subtext: "Game: Simulation",
        lines: [
            "Test your reaction.",
            "Physics trivia loaded.",
            "High score required.",
            "Competition mode engaged."
        ]
    },
    'spi_mock_exam': {
        title: "Certification",
        subtext: "Exam: Simulation",
        lines: [
            "The final test.",
            "110 questions.",
            "Time is ticking.",
            "Prove your mastery."
        ]
    },
    'clinical_case_simulator': {
        title: "Diagnosis",
        subtext: "Simulation: AI Patient",
        lines: [
            "Patient data incoming...",
            "Symptoms presented.",
            "Scan. Analyze. Decide.",
            "The diagnosis is yours."
        ]
    },
    'ai_history': {
        title: "Logs",
        subtext: "Data: History",
        lines: [
            "Retrieving past sessions...",
            "Reviewing interactions.",
            "Saved content loaded.",
            "Memory access granted."
        ]
    }
};

export const getModuleIntro = (id: DemoId): ModuleIntroData => {
    return MODULE_INTROS[id] || {
        title: "Module Loading",
        subtext: `System: ${id.toUpperCase()}`,
        lines: [
            "Initializing...",
            "Loading assets...",
            "Preparing interface..."
        ]
    };
};
