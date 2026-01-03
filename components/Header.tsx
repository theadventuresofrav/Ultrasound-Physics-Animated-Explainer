
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, DemoId, Theme } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { COURSE_MODULES } from '../constants';
import { useUser } from '../contexts/UserContext';
import SearchBar from './SearchBar';
import { useSound } from '../contexts/SoundContext';

interface HeaderProps {
    userProfile: UserProfile | null;
    onResetProgress: () => void;
    onDashboardClick: () => void;
    onModuleClick: (moduleId: DemoId) => void;
}

const WaveLogo = () => (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--gold)]">
        <path d="M2 16C2 16 6 6 10 16C14 26 18 6 22 16C26 26 30 16 30 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);

const Header: React.FC<HeaderProps> = ({ userProfile, onResetProgress, onDashboardClick, onModuleClick }) => {
    const { settings, setSoundEnabled } = useSettings();
    const { setUserName, toggleAdmin, setTheme } = useUser();
    const { playClick, playHover } = useSound();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(userProfile?.name || '');

    const completedCount = userProfile?.completedModules.length ?? 0;
    const totalModules = COURSE_MODULES.length;
    const progress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

    const currentTheme = userProfile?.theme || 'Classic';

    useEffect(() => { if (userProfile?.name) setName(userProfile.name); }, [userProfile?.name]);

    const handleNameBlur = () => {
        if (name.trim() && name.trim() !== userProfile?.name) setUserName(name.trim());
        else setName(userProfile?.name || '');
        setIsEditingName(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => { playClick(); setIsDropdownOpen(prev => !prev); };

    const handleThemeSwitch = (newTheme: Theme) => {
        playClick();
        setTheme(newTheme);
    };

    const toggleThemeQuick = () => {
        const nextTheme = currentTheme === 'Classic' ? 'Neon' : 'Classic';
        handleThemeSwitch(nextTheme);
    };

    return (
        <header className="sticky top-0 z-[150] w-full px-3 sm:px-6 py-3 sm:py-4">
            {/* Header Blur Backplate */}
            <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 relative z-10">
                
                {/* --- Left Sector: Nav --- */}
                <div className="flex-1 flex items-center gap-3">
                    <button 
                        onClick={onDashboardClick} onMouseEnter={playHover}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--gold)]/40 transition-all duration-300"
                        title="Home"
                    >
                        <span className="text-[var(--gold)] drop-shadow-[0_0_8px_var(--gold)]">
                            <HomeIcon />
                        </span>
                        <span className="hidden lg:inline text-[10px] font-black uppercase tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">
                            Command_Center
                        </span>
                    </button>

                    <div className="hidden xl:flex flex-col border-l border-white/10 pl-3">
                        <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] truncate">Sector</span>
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest truncate">Alpha_Station</span>
                    </div>
                </div>

                {/* --- Center Sector: Branding --- */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="cursor-pointer group flex flex-col items-center" onClick={onDashboardClick} onMouseEnter={playHover}>
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-black rounded-xl border border-white/10 flex items-center justify-center group-hover:border-[var(--gold)]/50 transition-all duration-500 relative shadow-2xl overflow-hidden mb-0.5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--gold-dim),transparent_70%)] opacity-20 group-hover:opacity-40" />
                            {userProfile?.systemOverrides.systemLogo ? 
                                <img src={userProfile.systemOverrides.systemLogo} alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" /> : 
                                <WaveLogo />
                            }
                        </div>
                        <h1 className="hidden xs:block text-[8px] sm:text-[10px] font-black tracking-[0.3em] sm:tracking-[0.4em] text-white/80 uppercase transition-all group-hover:text-white text-center">
                            Echo<span className="text-[var(--gold)]">Masters</span>
                        </h1>
                    </div>
                </div>

                {/* --- Right Sector: Identity HUD --- */}
                <div className="flex-1 flex items-center justify-end gap-2 sm:gap-6 min-w-0">
                    <div className="hidden md:block w-full max-w-[160px] lg:max-w-[240px]">
                        <SearchBar onResultClick={onModuleClick} className="w-full" />
                    </div>

                    {/* Quick Theme Toggle */}
                    <button
                        onClick={toggleThemeQuick}
                        onMouseEnter={playHover}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition-all duration-300 shadow-lg"
                        title={`Switch to ${currentTheme === 'Classic' ? 'Neon' : 'Classic'} Theme`}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentTheme}
                                initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentTheme === 'Classic' ? <MoonIcon /> : <SunIcon />}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    <div className="relative shrink-0" ref={dropdownRef}>
                        <button 
                            onClick={toggleDropdown} onMouseEnter={playHover}
                            className={`flex items-center gap-2 sm:gap-4 pl-3 sm:pl-4 pr-1 py-1 rounded-full border transition-all duration-500 group relative ${isDropdownOpen ? 'bg-white/10 border-[var(--gold)]/40 ring-4 ring-[var(--gold)]/5' : 'bg-black/40 border-white/10 hover:border-white/20'}`}
                        >
                            {/* Neural Sync Telemetry (Desktop/Tablet) */}
                            <div className="hidden sm:flex flex-col items-end text-right border-r border-white/10 pr-3 sm:pr-4 mr-0.5 min-w-0">
                                <p className="text-[10px] sm:text-xs font-black text-white leading-none mb-1 uppercase tracking-tighter truncate max-w-[80px]">
                                    {userProfile?.name?.split(' ')[0] || 'Cadet'}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                                    <p className="text-[8px] sm:text-[9px] text-white/40 font-mono leading-none tracking-widest uppercase">SY_MOD_{progress.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Identity Disk */}
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-[var(--gold)]/30 transition-colors shadow-2xl">
                                <span className="text-sm sm:text-lg relative z-10">{userProfile?.isAdmin ? '🛡️' : '👤'}</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16.5" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                                    <motion.circle 
                                        cx="18" cy="18" r="16.5" 
                                        fill="none" 
                                        stroke="var(--gold)" 
                                        strokeWidth="2" 
                                        strokeDasharray="100 100" 
                                        initial={{ strokeDashoffset: 100 }} 
                                        animate={{ strokeDashoffset: 100 - progress }} 
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                    />
                                </svg>
                                {progress === 100 && (
                                    <motion.div 
                                        animate={{ opacity: [0, 0.4, 0], scale: [1, 1.3, 1] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="absolute inset-0 bg-[var(--gold)] rounded-full"
                                    />
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 12, scale: 0.98 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                className="absolute top-full right-0 mt-4 w-[calc(100vw-24px)] sm:w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] overflow-hidden z-50 ring-1 ring-white/5"
                            >
                                <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02] text-center relative">
                                    <div className="relative inline-block mb-4">
                                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border-2 ${userProfile?.isAdmin ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-[var(--gold)] shadow-[0_0_30px_rgba(212,175,55,0.1)]'} flex items-center justify-center relative z-10`}>
                                            <span className="text-3xl sm:text-4xl">{userProfile?.isAdmin ? '🛡️' : '👤'}</span>
                                        </div>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-3 border-t border-r border-[var(--gold)]/20 rounded-full" />
                                    </div>
                                    
                                    {isEditingName ? (
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={handleNameBlur} autoFocus className="w-full bg-black/50 text-white text-center font-bold p-2 rounded-xl border border-[var(--gold)]/50 text-sm sm:text-base" />
                                    ) : (
                                        <p onClick={() => setIsEditingName(true)} className="font-black text-lg sm:text-xl text-white cursor-pointer hover:text-[var(--gold)] transition-colors truncate uppercase tracking-tighter">{userProfile?.name || 'Guest User'}</p>
                                    )}
                                    <p className="text-[10px] text-white/30 mt-2 font-mono tracking-widest uppercase truncate px-4">Rank: {userProfile?.isAdmin ? 'ROOT_ADMIN' : 'SYSTEM_CADET'}</p>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Theme Selector Section */}
                                    <div>
                                        <h5 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3 px-1">System_Visuals</h5>
                                        <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                            {(['Classic', 'Neon'] as Theme[]).map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => handleThemeSwitch(t)}
                                                    className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                                                        userProfile?.theme === t 
                                                            ? 'bg-white/10 border-[var(--gold)]/50 text-white shadow-inner' 
                                                            : 'bg-transparent border-transparent text-white/30 hover:text-white/60 hover:bg-white/5'
                                                    }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex justify-between items-end mb-3 px-1">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Neural_Sync</span>
                                            <span className="text-xs font-mono text-[var(--gold)] font-bold">{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${progress}%` }} 
                                                className="bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] h-full shadow-[0_0_15px_var(--gold)]" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 px-2">
                                        <div className="p-3 sm:p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                                            <p className="text-[8px] sm:text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">XP</p>
                                            <p className="text-base sm:text-lg font-black text-white tabular-nums">{completedCount * 1250}</p>
                                        </div>
                                        <div className="p-3 sm:p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                                            <p className="text-[8px] sm:text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Status</p>
                                            <p className="text-base sm:text-lg font-black text-green-400 uppercase tracking-tighter">Live</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-1 bg-black/40 border-t border-white/5">
                                    <button 
                                        onClick={() => { playClick(); toggleAdmin(); }}
                                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group/btn"
                                    >
                                        <span className="text-[10px] sm:text-xs font-bold text-white/60 group-hover/btn:text-white uppercase tracking-widest">Admin_Bypass</span>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors border ${userProfile?.isAdmin ? 'bg-red-500 border-red-400' : 'bg-white/10 border-white/20'}`}>
                                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform`} style={{ left: userProfile?.isAdmin ? '18px' : '3px'}} />
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => { playClick(); setSoundEnabled(!settings.soundEnabled); }}
                                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all group/btn"
                                    >
                                        <span className="text-[10px] sm:text-xs font-bold text-white/60 group-hover/btn:text-white uppercase tracking-widest">Sound_FX</span>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors border ${settings.soundEnabled ? 'bg-[var(--gold)] border-[var(--gold-light)]' : 'bg-white/10 border-white/20'}`}>
                                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform`} style={{ left: settings.soundEnabled ? '18px' : '3px'}} />
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => { playClick(); onResetProgress(); }} 
                                        className="w-full mt-2 text-[9px] sm:text-[10px] text-red-500/60 hover:text-red-400 hover:bg-red-500/10 p-3 rounded-xl transition-all text-center font-bold uppercase tracking-[0.2em]"
                                    >
                                        [ Execute_System_Reset ]
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
