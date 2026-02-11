
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, DemoId, Theme } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { COURSE_MODULES } from '../constants';
import { useUser } from '../contexts/UserContext';
import SearchBar from './SearchBar';
import { useSound } from '../contexts/SoundContext';
import { FullscreenIcon, ExitFullscreenIcon, SpeakerWaveIcon, SpeakerXMarkIcon, MusicalNoteIcon } from './Icons';

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
    <div className="flex items-center gap-[2px] h-3">
        {[1, 2, 3, 4].map(i => (
            <motion.div
                key={i}
                className="w-[1.5px] bg-[var(--gold)] rounded-full"
                animate={isActive ? { height: [2, 12, 2] } : { height: 2 }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
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
    const [name, setName] = useState(userProfile?.name || '');

    const completedCount = userProfile?.completedModules.length ?? 0;
    const totalModules = COURSE_MODULES.length;
    const progress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
    const currentTheme = userProfile?.theme || 'Classic';

    useEffect(() => { if (userProfile?.name) setName(userProfile.name); }, [userProfile?.name]);

    const toggleFullscreen = useCallback(() => {
        playClick();
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
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
        <header className="sticky top-0 z-[150] w-full px-2 sm:px-6 py-1.5 sm:py-3">
            <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-xl border-b border-white/10 pointer-events-none" />

            <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-2 relative z-10">
                {/* Left Section: Cmd & Status */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                    <button 
                        onClick={onDashboardClick} onMouseEnter={playHover}
                        className="group flex-shrink-0 flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[var(--gold)]/40 transition-all"
                    >
                        <span className="text-[var(--gold)]"><HomeIcon /></span>
                        <span className="hidden lg:inline text-[9px] font-black uppercase tracking-[0.2em] text-white/80">CMD</span>
                    </button>

                    <AnimatePresence>
                        {isBriefingActive && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="hidden sm:flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-2.5 py-1.5 rounded-lg"
                            >
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest truncate max-w-[100px]">
                                    {briefingStatus || 'SYNC'} {queueLength > 1 && `[+${queueLength - 1}]`}
                                </span>
                            </motion.div>
                        )}
                        {isAudioSuspended && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={resumeAudio}
                                className="px-3 py-1.5 rounded-lg bg-orange-500 text-black text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-pulse"
                            >
                                <div className="w-1 h-1 bg-black rounded-full" /> REPAIR_AUDIO_LINK
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>

                {/* Center: Branding */}
                <div className="shrink-0 flex flex-col items-center cursor-pointer" onClick={onDashboardClick} onMouseEnter={playHover}>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-lg border border-white/10 flex items-center justify-center transition-all duration-500 relative">
                        <WaveLogo />
                    </div>
                </div>

                {/* Right Section: Tools & Profile */}
                <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3">
                    <div className="hidden xl:block w-full max-w-[200px]">
                        <SearchBar onResultClick={onModuleClick} />
                    </div>
                    
                    {/* Audio Global Control */}
                    <div className="relative" ref={audioMenuRef}>
                        <button 
                            onClick={() => { playClick(); setIsAudioMenuOpen(!isAudioMenuOpen); }}
                            onMouseEnter={playHover}
                            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isAnyAudioActive ? 'bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold)] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <AnimatePresence mode="wait">
                                    {isAnyAudioActive ? (
                                        <motion.div key="active" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                            <AudioVisualizer isActive={true} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="mute" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <SpeakerXMarkIcon className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isAudioMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: 5, scale: 0.95 }} 
                                    className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-4"
                                >
                                    <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
                                                <SpeakerWaveIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-white uppercase tracking-widest">Sonic HUD</p>
                                                <p className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em]">Global_Audio_Chain</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MusicalNoteIcon className={`w-3.5 h-3.5 ${settings.musicEnabled ? 'text-cyan-400' : 'text-white/20'}`} />
                                                <span className="text-[9px] font-bold text-white/60 uppercase">Atmosphere</span>
                                            </div>
                                            <button onClick={() => setMusicEnabled(!settings.musicEnabled)} className={`w-8 h-4 rounded-full relative transition-all ${settings.musicEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}>
                                                <motion.div className="absolute top-0.5 w-3 h-3 bg-white rounded-full" animate={{ left: settings.musicEnabled ? '18px' : '2px' }} />
                                            </button>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.01" value={settings.musicVolume} onChange={(e) => setMusicVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/5 accent-cyan-500 appearance-none rounded-full cursor-pointer" />

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-2">
                                                <SpeakerWaveIcon className={`w-3.5 h-3.5 ${settings.soundEnabled ? 'text-[var(--gold)]' : 'text-white/20'}`} />
                                                <span className="text-[9px] font-bold text-white/60 uppercase">Interface SFX</span>
                                            </div>
                                            <button onClick={() => setSoundEnabled(!settings.soundEnabled)} className={`w-8 h-4 rounded-full relative transition-all ${settings.soundEnabled ? 'bg-[var(--gold)]' : 'bg-white/10'}`}>
                                                <motion.div className="absolute top-0.5 w-3 h-3 bg-white rounded-full" animate={{ left: settings.soundEnabled ? '18px' : '2px' }} />
                                            </button>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.01" value={settings.volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-1 bg-white/5 accent-[var(--gold)] appearance-none rounded-full cursor-pointer" />
                                    </div>

                                    {isAudioSuspended && (
                                        <button 
                                            onClick={resumeAudio}
                                            className="mt-6 w-full py-2 bg-orange-500/10 border border-orange-500/40 text-orange-500 text-[9px] font-black uppercase rounded-xl hover:bg-orange-500 hover:text-black transition-all"
                                        >
                                            [ REPAIR_SIGNAL_LINK ]
                                        </button>
                                    )}

                                    {isBriefingActive && (
                                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse">Narration: Active</span>
                                                <span className="text-[8px] font-mono text-red-400/60 uppercase tracking-tighter">Queue: {queueLength}</span>
                                            </div>
                                            <button onClick={() => { playClick(); stopBriefing(); }} className="w-full py-1.5 bg-red-500/10 border border-red-500/30 text-[8px] font-black text-red-400 hover:bg-red-500 hover:text-black transition-all uppercase">[ PURGE_ALL_AUDIO ]</button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button 
                        onClick={toggleFullscreen}
                        onMouseEnter={playHover}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        title={isFullscreen ? 'Exit Tactical View' : 'Engage Immersive Mode'}
                    >
                        {isFullscreen ? <ExitFullscreenIcon className="w-4 h-4" /> : <FullscreenIcon className="w-4 h-4" />}
                    </button>

                    {/* Mobile Search Trigger */}
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="xl:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </button>

                    <button
                        onClick={() => setTheme(currentTheme === 'Classic' ? 'Neon' : 'Classic')}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40"
                    >
                        {currentTheme === 'Classic' ? '🌙' : '☀️'}
                    </button>

                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => { playClick(); setIsDropdownOpen(!isDropdownOpen); }}
                            className="flex items-center gap-2 p-1 rounded-full border border-white/10 bg-black/40 hover:border-[var(--gold)]/30 transition-all"
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
                                <span className="text-xs">{userProfile?.isAdmin ? '🛡️' : '👤'}</span>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                                    <motion.circle 
                                        cx="18" cy="18" r="16.5" 
                                        fill="none" stroke="var(--gold)" strokeWidth="2.5" 
                                        strokeDasharray="100 100" 
                                        initial={{ strokeDashoffset: 100 }} 
                                        animate={{ strokeDashoffset: 100 - progress }} 
                                        transition={{ duration: 1.2 }}
                                    />
                                </svg>
                            </div>
                        </button>

                        <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                                <div className="p-4 border-b border-white/5 bg-white/[0.02] text-center">
                                    <p className="font-black text-sm text-white cursor-pointer truncate uppercase tracking-tighter">{userProfile?.name || 'Cadet'}</p>
                                    <p className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mt-1">Mastery: {progress.toFixed(0)}%</p>
                                </div>
                                <div className="p-3 space-y-2">
                                    <button onClick={() => toggleAdmin()} className="w-full flex items-center justify-between p-2.5 hover:bg-white/5 rounded-lg transition-all group">
                                        <span className="text-[10px] font-bold text-white/60 uppercase">Root Access</span>
                                        <div className={`w-6 h-3 rounded-full relative ${userProfile?.isAdmin ? 'bg-red-500' : 'bg-white/10'}`}>
                                            <div className="absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all" style={{ left: userProfile?.isAdmin ? '14px' : '2px' }} />
                                        </div>
                                    </button>
                                    <button onClick={onResetProgress} className="w-full mt-2 text-[8px] text-red-500/60 hover:text-red-400 p-2 rounded-lg transition-all text-center font-bold uppercase tracking-[0.2em]">[ System_Reset ]</button>
                                </div>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="xl:hidden absolute top-full left-0 w-full p-3 bg-black/90 backdrop-blur-2xl border-b border-white/10"
                    >
                        <SearchBar onResultClick={(id) => { onModuleClick(id); setIsSearchOpen(false); }} className="w-full" />
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
