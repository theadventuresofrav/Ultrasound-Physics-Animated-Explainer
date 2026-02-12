import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CourseModuleData } from '../types';
import { useSound } from '../contexts/SoundContext';
import { SparklesIcon, BeakerIcon, QuestionMarkCircleIcon, ListBulletIcon, CheckBadgeIcon } from './Icons';

interface CourseModuleProps extends CourseModuleData {
  onClick: () => void;
  isCompleted?: boolean;
  score?: number;
}

const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('ai') || lowerFeature.includes('powered')) return <SparklesIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    if (lowerFeature.includes('lab') || lowerFeature.includes('simulation') || lowerFeature.includes('interactive')) return <BeakerIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    if (lowerFeature.includes('quiz') || lowerFeature.includes('questions')) return <QuestionMarkCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
    return <ListBulletIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />;
};

const STATUS_THEMES: Record<string, { 
    staticBorder: string, 
    staticBg: string, 
    hoverBorder: string, 
    hoverBg: string, 
    badge: string, 
    glow: string, 
    icon: string,
    accent: string
}> = {
    'Premium': { 
        staticBorder: 'border-[var(--gold)]/10', 
        staticBg: 'bg-[var(--gold)]/[0.02]', 
        hoverBorder: 'group-hover:border-[var(--gold)]/50', 
        hoverBg: 'group-hover:bg-[var(--gold)]/[0.05]', 
        badge: 'text-[var(--gold)] border-[var(--gold)]/30 bg-[var(--gold)]/5', 
        glow: 'group-hover:shadow-[0_0_100px_rgba(212,175,55,0.15)]',
        icon: 'text-[var(--gold)] border-[var(--gold)]/20 bg-black/40',
        accent: '#d4af37'
    },
    'Clinical': { 
        staticBorder: 'border-blue-500/10', 
        staticBg: 'bg-blue-500/[0.02]', 
        hoverBorder: 'group-hover:border-blue-500/50', 
        hoverBg: 'group-hover:bg-blue-500/[0.05]', 
        badge: 'text-blue-400 border-blue-400/30 bg-blue-400/5', 
        glow: 'group-hover:shadow-[0_0_100px_rgba(59,130,246,0.15)]',
        icon: 'text-blue-400 border-blue-500/20 bg-black/40',
        accent: '#3b82f6'
    },
    'Advanced': { 
        staticBorder: 'border-purple-500/10', 
        staticBg: 'bg-purple-500/[0.02]', 
        hoverBorder: 'group-hover:border-purple-500/50', 
        hoverBg: 'group-hover:bg-purple-500/[0.05]', 
        badge: 'text-purple-400 border-purple-400/30 bg-purple-400/5', 
        glow: 'group-hover:shadow-[0_0_100px_rgba(168,85,247,0.15)]',
        icon: 'text-purple-400 border-purple-500/20 bg-black/40',
        accent: '#a855f7'
    },
    'New!': { 
        staticBorder: 'border-emerald-500/10', 
        staticBg: 'bg-emerald-500/[0.02]', 
        hoverBorder: 'group-hover:border-emerald-500/50', 
        hoverBg: 'group-hover:bg-emerald-500/[0.05]', 
        badge: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5', 
        glow: 'group-hover:shadow-[0_0_100px_rgba(16,185,129,0.15)]',
        icon: 'text-emerald-400 border-emerald-500/20 bg-black/40',
        accent: '#10b981'
    },
    'Resource': {
        staticBorder: 'border-white/5', 
        staticBg: 'bg-white/[0.01]', 
        hoverBorder: 'group-hover:border-white/30', 
        hoverBg: 'group-hover:bg-white/[0.04]', 
        badge: 'text-white/40 border-white/20 bg-white/5', 
        glow: 'group-hover:shadow-[0_0_100px_rgba(255,255,255,0.08)]',
        icon: 'text-white/50 border-white/10 bg-black/40',
        accent: '#ffffff'
    },
};

const CourseModule: React.FC<CourseModuleProps> = ({
  id,
  status,
  icon,
  title,
  description,
  features,
  onClick,
  isCompleted,
  score,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playHover, playClick } = useSound();
  const theme = STATUS_THEMES[status] || STATUS_THEMES['Premium'];

  return (
    <motion.div
        layout
        onClick={() => { playClick(); onClick(); }}
        onMouseEnter={() => { setIsHovered(true); playHover(); }}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative h-full flex flex-col rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-700 border ${theme.staticBorder} ${theme.staticBg} ${theme.hoverBorder} ${theme.hoverBg} ${theme.glow} hover:-translate-y-2 shadow-2xl backdrop-blur-xl`}
    >
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none" 
            style={{ background: `radial-gradient(circle at top left, ${theme.accent} 0%, transparent 70%)` }} 
        />

        <div className="px-6 sm:px-10 pt-6 sm:pt-10 flex justify-between items-start relative z-10">
             <div className="flex flex-col gap-1">
                <span className={`px-3 py-1 rounded-full text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] border transition-all duration-700 ${theme.badge}`}>
                    {status}
                </span>
             </div>
            {isCompleted ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black italic shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <CheckBadgeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>SYNC_OK</span>
                </div>
            ) : score !== undefined ? (
                 <div className="flex items-center gap-1.5 text-[var(--gold)] bg-black/60 border border-[var(--gold)]/20 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-mono font-bold">
                    <span className="opacity-30">HI_SCR:</span> {score}%
                </div>
            ) : null}
        </div>

        <div className="p-6 sm:p-10 flex flex-col h-full relative z-10 pb-12 sm:pb-16">
            <div className="flex items-center gap-5 sm:gap-8 mb-6 sm:mb-10">
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center text-3xl sm:text-5xl shadow-2xl transition-all duration-1000 ${theme.icon} flex-shrink-0 group-hover:scale-110 group-hover:rotate-3`}>
                    <span className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">{icon}</span>
                </div>
                <div className="min-w-0">
                    <h3 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tighter uppercase italic truncate">
                        {title}
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-mono text-white/20 mt-1.5 uppercase tracking-[0.4em] flex items-center gap-3">
                        <div className="w-1 h-1 bg-[var(--gold)]/40 rounded-full animate-pulse" /> 
                        NODE_{id.toUpperCase().substring(0, 5)}
                    </p>
                </div>
            </div>

            <p className="text-xs sm:text-sm text-white/40 line-clamp-2 sm:line-clamp-3 leading-relaxed mb-8 sm:mb-12 font-light italic">
                "{description}"
            </p>

            <div className="mt-auto flex flex-wrap gap-2 sm:gap-3 transition-all duration-700">
                {features.slice(0, 2).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[7px] sm:text-[9px] text-white/60 font-bold uppercase tracking-widest backdrop-blur-md transition-colors group-hover:border-white/10">
                        {getFeatureIcon(f)}
                        <span className="truncate max-w-[120px]">{f}</span>
                    </span>
                ))}
            </div>

            {/* Magnetic Action HUD */}
            <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 flex items-center gap-4 z-20">
                <span className="text-[9px] font-black font-mono uppercase tracking-[0.3em] gold-text-glow" style={{ color: theme.accent }}>ENGAGE_UPLINK</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-black border border-white/20 shadow-2xl transition-transform hover:scale-110 active:scale-90" style={{ backgroundColor: theme.accent }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </div>

        {/* Global Progress Bar Accent */}
        <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/5 z-20 overflow-hidden">
             <motion.div 
                className={`h-full relative shadow-[0_0_15px_currentColor] ${isCompleted ? 'bg-emerald-500' : ''}`}
                style={!isCompleted ? { backgroundColor: theme.accent } : {}}
                initial={{ width: 0 }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
                transition={{ duration: 1.5, ease: "circOut" }}
            />
        </div>
    </motion.div>
  );
};

export default CourseModule;