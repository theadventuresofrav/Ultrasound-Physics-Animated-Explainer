import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, DemoId, Theme } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { COURSE_MODULES } from '../constants';
import { useUser } from '../contexts/UserContext';
import SearchBar from './SearchBar';
import { useSound } from '../contexts/SoundContext';
import { FullscreenIcon, ExitFullscreenIcon, SpeakerWaveIcon, SpeakerXMarkIcon, MusicalNoteIcon, TrophyIcon, BrainIcon, CardStackIcon } from './Icons';

interface HeaderProps {
    userProfile: UserProfile | null;
    onResetProgress: () => void;
    onDashboardClick: () => void;
    onModuleClick: (moduleId: DemoId) => void;
}

const WaveLogo = () => (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--gold)]">
        <path d="M2 16C2 16 6 6 10 16C14 26 18 6 22 16C26 26 30 16 30 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
);

const AudioVisualizer = ({ isActive }: { isActive: boolean }) => (
    <div className="flex items-center gap-[1.5px] h-2.5">
        {[1, 2, 3].map(i => (
            <motion.div
                key={i}
                className="w-[1.5px] bg-[var(--gold)] rounded-full"
                animate={isActive ? { height: [2, 10, 2] } : { height: 2 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
        ))}
    </div>
);

const Header: React.FC<HeaderProps> = ({ userProfile, onResetProgress, onDashboardClick, onModuleClick }) => {
    const { settings, setMusicEnabled, setSoundEnabled, setVolume, setMusicVolume } = useSettings();
    const { setTheme, toggleAdmin } = useUser();
    const { playClick, playHover, isBriefingActive, briefingStatus, isAudioSuspended, resumeAudio, queueLength, stopBriefing } = useSound();
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const audioMenuRef = useRef<HTMLDivElement>(null);

    const completedCount = userProfile?.completedModules.length ?? 0;
    const totalModules = COURSE_MODULES.length;
    const progress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
    const currentTheme = userProfile?.theme || 'Classic';

    const toggleFullscreen = useCallback(() => {
        playClick();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen();
        }
    }, [playClick]);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
            if (audioMenuRef.current && !audioMenuRef.current.contains(event.target as Node)) setIsAudioMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAnyAudioActive = settings.musicEnabled || isBriefingActive;

    return (
        <>
            <header className="sticky top-0 z-[150] w-full px-4 py-2 sm:py-3 bg-[#050505]/85 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 flex items-center gap-2">
                        <button 
                            onClick={(e) => {
                                if (e.detail === 3) {
                                    toggleAdmin();
                                } else {
                                    onDashboardClick();
                                }
                            }}
                            onMouseEnter={playHover}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/40 transition-all shrink-0 relative group"
                            title="Dashboard (Triple Click for Admin Access)"
                        >
                            <span className="text-[var(--gold)]"><HomeIcon /></span>
                            {/* Removed pulsing red indicator for now, or keep it subtle */}
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Music Indicator */}
                        {settings.musicEnabled && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                <div className="flex gap-0.5 items-end h-3">
                                    <motion.div className="w-0.5 bg-[var(--gold)]" animate={{ height: [4, 12, 4] }} transition={{ duration: 0.5, repeat: Infinity }} />
                                    <motion.div className="w-0.5 bg-[var(--gold)]" animate={{ height: [8, 4, 12] }} transition={{ duration: 0.7, repeat: Infinity }} />
                                    <motion.div className="w-0.5 bg-[var(--gold)]" animate={{ height: [6, 10, 5] }} transition={{ duration: 0.6, repeat: Infinity }} />
                                </div>
                                <span className="text-[9px] font-bold text-[var(--gold)] tracking-widest uppercase">Signal_Active</span>
                            </div>
                        )}

                        <AnimatePresence>
                            {isBriefingActive && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="hidden xs:flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg"
                                >
                                    <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                                    <span className="text-[7px] font-black text-red-400 uppercase tracking-tighter">
                                        {briefingStatus || 'SYNC'}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center Branding */}
                    <div className="shrink-0 cursor-pointer" onClick={onDashboardClick} onMouseEnter={playHover}>
                        <div className="w-9 h-9 bg-black rounded-lg border border-white/10 flex items-center justify-center relative shadow-inner">
                            <WaveLogo />
                        </div>
                    </div>

                    {/* Right Tools */}
                    <div className="flex-1 flex items-center justify-end gap-2">
                        <div className="hidden xl:block w-full max-w-[180px]">
                            <SearchBar onResultClick={onModuleClick} />
                        </div>
                        
                        <div className="relative" ref={audioMenuRef}>
                            <button 
                                onClick={() => { playClick(); setIsAudioMenuOpen(!isAudioMenuOpen); }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isAnyAudioActive ? 'bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold)]' : 'bg-white/5 border-white/10 text-white/30'}`}
                            >
                                <AnimatePresence mode="wait">
                                    {isAnyAudioActive ? (
                                        <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <AudioVisualizer isActive={true} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <SpeakerXMarkIcon className="w-3.5 h-3.5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </button>

                            <AnimatePresence>
                                {isAudioMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                                        exit={{ opacity: 0, y: 5 }} 
                                        className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50"
                                    >
                                        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                                            <SpeakerWaveIcon className="w-4 h-4 text-[var(--gold)]" />
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Sonic_Chain</p>
                                        </div>
                                        <div className="space-y-4">
                                            {/* Music Controls */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-white/50 uppercase">Atmosphere</span>
                                                    <button onClick={() => setMusicEnabled(!settings.musicEnabled)} className={`w-8 h-4 rounded-full relative ${settings.musicEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                                                        <motion.div className="absolute top-0.5 w-3 h-3 bg-white rounded-full" animate={{ left: settings.musicEnabled ? '18px' : '2px' }} />
                                                    </button>
                                                </div>
                                                {settings.musicEnabled && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] text-white/30">VOL</span>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="1" 
                                                            step="0.05" 
                                                            value={settings.musicVolume} 
                                                            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* SFX Controls */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-bold text-white/50 uppercase">Interface</span>
                                                    <button onClick={() => setSoundEnabled(!settings.soundEnabled)} className={`w-8 h-4 rounded-full relative ${settings.soundEnabled ? 'bg-[var(--gold)]' : 'bg-white/10'}`}>
                                                        <motion.div className="absolute top-0.5 w-3 h-3 bg-white rounded-full" animate={{ left: settings.soundEnabled ? '18px' : '2px' }} />
                                                    </button>
                                                </div>
                                                {settings.soundEnabled && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] text-white/30">SFX</span>
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max="1" 
                                                            step="0.05" 
                                                            value={settings.volume} 
                                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--gold)] hover:accent-yellow-400"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button 
                            onClick={toggleFullscreen}
                            className="hidden xs:flex w-8 h-8 rounded-full bg-white/5 border border-white/10 items-center justify-center text-white/20 hover:text-white"
                        >
                            {isFullscreen ? <ExitFullscreenIcon className="w-3.5 h-3.5" /> : <FullscreenIcon className="w-3.5 h-3.5" />}
                        </button>

                        <button
                            onClick={() => setTheme(currentTheme === 'Classic' ? 'Neon' : 'Classic')}
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30"
                        >
                            {currentTheme === 'Classic' ? '🌙' : '☀️'}
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => { playClick(); setIsDropdownOpen(!isDropdownOpen); }}
                                className="flex items-center p-0.5 rounded-full border border-white/10 bg-black/40"
                            >
                                <div className="w-7 h-7 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden">
                                    <span className="text-[10px]">{userProfile?.isAdmin ? '🛡️' : '👤'}</span>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                                        <motion.circle 
                                            cx="18" cy="18" r="16.5" 
                                            fill="none" stroke="var(--gold)" strokeWidth="2.5" 
                                            strokeDasharray="100 100" 
                                            initial={{ strokeDashoffset: 100 }} 
                                            animate={{ strokeDashoffset: 100 - progress }} 
                                        />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-[150] sm:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-16 pb-safe">
                <NavButton icon={<HomeIcon />} label="Mission" active={true} onClick={onDashboardClick} />
                <NavButton icon={<BrainIcon className="w-5 h-5" />} label="Academy" onClick={() => onModuleClick('ai_academy')} />
                <NavButton icon={<CardStackIcon className="w-5 h-5" />} label="Memory" onClick={() => onModuleClick('study_guide')} />
                <NavButton icon={<TrophyIcon className="w-5 h-5" />} label="Rank" onClick={() => setIsDropdownOpen(true)} />
            </div>
        </>
    );
};

const NavButton = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1">
        <div className={`transition-all duration-300 ${active ? 'text-[var(--gold)]' : 'text-white/30'}`}>{icon}</div>
        <span className={`text-[7px] font-black uppercase tracking-widest ${active ? 'text-[var(--gold)]' : 'text-white/20'}`}>{label}</span>
    </button>
);

export default Header;