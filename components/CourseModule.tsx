
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
    if (lowerFeature.includes('ai') || lowerFeature.includes('powered')) return <border-none><SparklesIcon className="w-3.5 h-3.5" /></border-none>;
    if (lowerFeature.includes('lab') || lowerFeature.includes('simulation') || lowerFeature.includes('interactive')) return <BeakerIcon className="w-3.5 h-3.5" />;
    if (lowerFeature.includes('quiz') || lowerFeature.includes('questions')) return <QuestionMarkCircleIcon className="w-3.5 h-3.5" />;
    return <ListBulletIcon className="w-3.5 h-3.5" />;
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
        staticBorder: 'border-[var(--gold)]/20', 
        staticBg: 'bg-[var(--gold)]/[0.03]', 
        hoverBorder: 'group-hover:border-[var(--gold)]/60', 
        hoverBg: 'group-hover:bg-[var(--gold)]/[0.06]', 
        badge: 'text-[var(--gold)] border-[var(--gold)]/40 bg-[var(--gold)]/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(212,175,55,0.2)]',
        icon: 'text-[var(--gold)] border-[var(--gold)]/20 bg-black/60',
        accent: '#d4af37'
    },
    'Clinical': { 
        staticBorder: 'border-blue-500/20', 
        staticBg: 'bg-blue-500/[0.03]', 
        hoverBorder: 'group-hover:border-blue-500/60', 
        hoverBg: 'group-hover:bg-blue-500/[0.06]', 
        badge: 'text-blue-400 border-blue-400/40 bg-blue-400/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(59,130,246,0.2)]',
        icon: 'text-blue-400 border-blue-500/20 bg-black/60',
        accent: '#3b82f6'
    },
    'Advanced': { 
        staticBorder: 'border-purple-500/20', 
        staticBg: 'bg-purple-500/[0.03]', 
        hoverBorder: 'group-hover:border-purple-500/60', 
        hoverBg: 'group-hover:bg-purple-500/[0.06]', 
        badge: 'text-purple-400 border-purple-400/40 bg-purple-400/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(168,85,247,0.2)]',
        icon: 'text-purple-400 border-purple-500/20 bg-black/60',
        accent: '#a855f7'
    },
    'New!': { 
        staticBorder: 'border-emerald-500/20', 
        staticBg: 'bg-emerald-500/[0.03]', 
        hoverBorder: 'group-hover:border-emerald-500/60', 
        hoverBg: 'group-hover:bg-emerald-500/[0.06]', 
        badge: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(16,185,129,0.2)]',
        icon: 'text-emerald-400 border-emerald-500/20 bg-black/60',
        accent: '#10b981'
    },
    'Practical': {
        staticBorder: 'border-cyan-500/20', 
        staticBg: 'bg-cyan-500/[0.03]', 
        hoverBorder: 'group-hover:border-cyan-500/60', 
        hoverBg: 'group-hover:bg-cyan-500/[0.06]', 
        badge: 'text-cyan-400 border-cyan-400/40 bg-cyan-400/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(34,211,238,0.2)]',
        icon: 'text-cyan-400 border-cyan-500/20 bg-black/60',
        accent: '#06b6d4'
    },
    'Interactive': {
        staticBorder: 'border-indigo-500/20', 
        staticBg: 'bg-indigo-500/[0.03]', 
        hoverBorder: 'group-hover:border-indigo-500/60', 
        hoverBg: 'group-hover:bg-indigo-500/[0.06]', 
        badge: 'text-indigo-400 border-indigo-400/40 bg-indigo-400/10', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(99,102,241,0.2)]',
        icon: 'text-indigo-400 border-indigo-500/20 bg-black/60',
        accent: '#6366f1'
    },
    'Resource': {
        staticBorder: 'border-white/10', 
        staticBg: 'bg-white/[0.02]', 
        hoverBorder: 'group-hover:border-white/40', 
        hoverBg: 'group-hover:bg-white/[0.05]', 
        badge: 'text-white/60 border-white/20 bg-white/5', 
        glow: 'group-hover:shadow-[0_0_80px_rgba(255,255,255,0.1)]',
        icon: 'text-white/60 border-white/10 bg-black/60',
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

  const handleMouseEnter = () => {
      setIsHovered(true);
      playHover();
  };

  const handleClick = () => {
      playClick();
      onClick();
  };

  return (
    <motion.div
        layout
        onClick={handleClick}
        onHoverStart={handleMouseEnter}
        onHoverEnd={() => setIsHovered(false)}
        className={`group relative h-full flex flex-col rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 border ${theme.staticBorder} ${theme.staticBg} ${theme.hoverBorder} ${theme.hoverBg} ${theme.glow} hover:-translate-y-2 shadow-2xl backdrop-blur-md`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        {/* Holographic Edge Trace */}
        <AnimatePresence>
            {isHovered && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div className="absolute top-0 left-0 w-20 h-[2px] bg-white shadow-[0_0_15px_white]" />
                    <div className="absolute top-0 left-0 h-20 w-[2px] bg-white shadow-[0_0_15px_white]" />
                    <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-white shadow-[0_0_15px_white]" />
                    <div className="absolute bottom-0 right-0 h-20 w-[2px] bg-white shadow-[0_0_15px_white]" />
                </motion.div>
            )}
        </AnimatePresence>

        {/* Status Subtle Gradient Underlay */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ background: `linear-gradient(135deg, ${theme.accent} 0%, transparent 50%)` }} />

        <div className="px-8 pt-8 flex justify-between items-start relative z-10">
             <div className="flex flex-col gap-1.5">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.25em] border backdrop-blur-xl transition-colors duration-500 ${theme.badge}`}>
                    {status}
                </span>
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.4em] pl-1">DATA_LINK_100%</span>
             </div>
            {isCompleted ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-[0_0_25px_rgba(74,222,128,0.1)]">
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>SYNCED</span>
                </div>
            ) : score !== undefined ? (
                 <div className="flex items-center gap-2 text-[var(--gold)] bg-black/60 border border-[var(--gold)]/20 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider shadow-inner">
                    <span className="opacity-40">BEST:</span> {score}%
                </div>
            ) : null}
        </div>

        <div className="p-8 flex flex-col h-full relative z-10 pb-12">
            <div className="flex items-start gap-6 mb-8">
                <motion.div 
                    animate={isHovered ? { rotateY: 180, scale: 1.15 } : { rotateY: 0, scale: 1 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    className={`w-16 h-16 rounded-[1.25rem] border-2 flex items-center justify-center text-4xl shadow-2xl transition-all duration-700 ${theme.icon} flex-shrink-0 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]`}
                >
                    <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{icon}</span>
                </motion.div>
                <div className="min-w-0">
                    <h3 className="text-2xl font-black text-white leading-[1.1] tracking-tighter group-hover:text-white transition-colors duration-300 uppercase">
                        {title}
                    </h3>
                    <p className="text-[10px] font-mono text-white/30 mt-3 uppercase tracking-[0.4em] flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-white/20 rounded-full" /> NODE_{id.toUpperCase().substring(0, 4)}
                    </p>
                </div>
            </div>

            <p className="text-sm text-white/40 line-clamp-3 leading-relaxed mb-10 group-hover:text-white/70 transition-colors duration-500 font-light italic">
                "{description}"
            </p>

            <div className="mt-auto flex flex-wrap gap-2.5 transition-all duration-500 group-hover:opacity-100 opacity-60">
                {features.slice(0, 3).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-white/50 font-bold tracking-wide group-hover:border-white/10 group-hover:text-white/90 transition-all backdrop-blur-md">
                        {getFeatureIcon(f)}
                        <span className="truncate max-w-[140px] uppercase">{f}</span>
                    </span>
                ))}
            </div>

            <div className="absolute bottom-10 right-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-5 z-20">
                <span className="text-[11px] font-black font-mono uppercase tracking-[0.4em] drop-shadow-xl" style={{ color: theme.accent }}>
                    {isCompleted ? 'REVIEW_DATA' : 'ENGAGE_CORE'}
                </span>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-black shadow-2xl transition-transform duration-300 border border-white/40" style={{ backgroundColor: theme.accent, boxShadow: `0 0 45px ${theme.accent}66` }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
            </div>
        </div>

        {/* Progress System Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-20 overflow-hidden">
             <motion.div 
                className={`h-full relative ${isCompleted ? 'bg-green-500' : ''}`}
                style={!isCompleted ? { backgroundColor: theme.accent } : {}}
                initial={{ width: 0 }}
                animate={{ width: isCompleted ? '100%' : '0%' }}
                transition={{ duration: 1.5, ease: "circOut" }}
            >
                <div className={`absolute inset-0 ${isCompleted ? 'shadow-[0_0_25px_#22c55e]' : ''}`} style={!isCompleted ? { boxShadow: `0_0_25px_${theme.accent}` } : {}} />
            </motion.div>
        </div>
    </motion.div>
  );
};

export default CourseModule;
