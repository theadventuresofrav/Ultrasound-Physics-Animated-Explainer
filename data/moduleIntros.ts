
import { DemoId } from '../types';

export interface ModuleIntroData {
    title: string;
    subtext: string;
    lines: string[];
    roadmap: string[];
    contrast?: string; // What this topic is NOT
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
        ],
        roadmap: ["Fundamental Definitions", "Acoustic Variables", "Attenuation Mechanics", "Clinical Deviation"],
        contrast: "Waves are not particles moving across space; they are energy vibrating particles that stay in place."
    },
    'transducers': {
        title: "The Engine",
        subtext: "System: Piezoelectric Core",
        lines: [
            "Electricity becomes sound.",
            "Crystals vibrating in perfect sync.",
            "The reverse effect is listening...",
            "Generating the beam of life."
        ],
        roadmap: ["Piezoelectric Physics", "Component Stack", "Frequency Logic", "Bandwidth Mastery"],
        contrast: "Transducers are not simple microphones; they are energy converters operating at specific resonant frequencies."
    },
    'doppler': {
        title: "Velocity",
        subtext: "System: Hemodynamics",
        lines: [
            "Motion shifts the frequency.",
            "Tracking the river within.",
            "Red approaches. Blue retreats.",
            "The physics of circulation active."
        ],
        roadmap: ["Doppler Equation", "Shift Calculus", "Aliasing Anomalies", "Angular Calibration"],
        contrast: "Doppler is not measuring distance; it is measuring the temporal shift in resonance caused by kinetic blood cells."
    },
    'artifacts': {
        title: "Illusions",
        subtext: "System: Error Analysis",
        lines: [
            "The machine assumes straight lines.",
            "But physics bends the truth.",
            "Shadows. Ghosts. Mirrors.",
            "Learning to see what isn't there."
        ],
        roadmap: ["Propagation Errors", "Attenuation Artifacts", "Resolution Clutter", "Corrective Maneuvers"],
        contrast: "Artifacts are not 'errors' of the machine, but rather the machine being too honest about bad physics assumptions."
    },
    'knobology': {
        title: "Optimization",
        subtext: "System: Control Interface",
        lines: [
            "The machine is raw potential.",
            "You are the architect.",
            "Gain. Focus. Depth.",
            "Crafting the perfect image."
        ],
        roadmap: ["Signal Path Amp", "Depth Compensation", "Dynamic Range Control", "Safety Thresholds"],
        contrast: "Knobology is not random adjusting; it is an algorithmic sequence to maximize signal-to-noise ratio."
    },
    'resolution': {
        title: "Precision",
        subtext: "System: Spatial Clarity",
        lines: [
            "Defining the limits of sight.",
            "Separating the structures.",
            "Axial. Lateral. Elevational.",
            "Because every millimeter matters."
        ],
        roadmap: ["SPL Calculus", "Beam Width Analysis", "Slice Thickness", "Temporal Trade-offs"],
        contrast: "Resolution is not zoom; it is the physical separation distance required to define a boundary."
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
        ],
        roadmap: ["Overview", "Analysis", "Practical"]
    };
};
