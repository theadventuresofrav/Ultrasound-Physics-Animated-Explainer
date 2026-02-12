import React, { useState, useEffect } from 'react';
import { UserProfile, AIStudyPath } from '../types';
import { COURSE_MODULES } from '../constants';
import { TrophyIcon, SparklesIcon, ChevronRightIcon, BrainIcon, TargetIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import EchoBotMascot from './EchoBotMascot';
import { useUser } from '../contexts/UserContext';
import { GoogleGenAI } from '@google/genai';
import NarrativeWrapper from './NarrativeWrapper';

interface HeroProps {
    userProfile: UserProfile | null;
    onGeneratePathClick: () => void;
    studyPath: AIStudyPath | null;
    onContinuePathClick: () => void;
}

const StatWidget: React.FC<{ label: string, value: string | number, subtext?: string, icon: React.ReactNode, colorClass?: string }> = ({ label, value, subtext, icon, colorClass = "text-[var(--gold)]" }) => (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full min-w-[130px] sm:min-w-[140px] relative overflow-hidden group shrink-0 sm:shrink">
        <div className={`absolute top-2 right-2 opacity-5 group-hover:opacity-100 transition-all ${colorClass}`}>{icon}</div>
        <p className="text-[7px] sm:text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1 sm:mb-3 border-b border-white/5 pb-1 sm:pb-2 w-fit">{label}</p>
        <div className="relative z-10">
            <AnimatePresence mode="wait">
                <motion.p 
                    key={value}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter"
                >
                    {value}
                </motion.p>
            </AnimatePresence>
            {subtext && <p className={`text-[6px] sm:text-[9px] mt-0.5 sm:mt-1.5 font-bold uppercase tracking-wide opacity-80 ${colorClass}`}>{subtext}</p>}
        </div>
    </div>
);

const Hero: React.FC<HeroProps> = ({ userProfile, onGeneratePathClick, studyPath, onContinuePathClick }) => {
    const { updateDailyInsight } = useUser();
    const [isRefreshingInsight, setIsRefreshingInsight] = useState(false);

    const completedCount = userProfile?.completedModules.length ?? 0;
    const totalModules = COURSE_MODULES.length;
    const progress = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
    const credits = userProfile?.echoCredits || 0;
    const streak = userProfile?.streak || 0;
    
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    const pilotName = userProfile?.name?.split(' ')[0] || 'Cadet';

    useEffect(() => {
        const checkInsight = async () => {
            const now = Date.now();
            const lastInsight = userProfile?.dailyInsight;
            const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
            if (!lastInsight || (now - lastInsight.timestamp) > TWENTY_FOUR_HOURS) {
                generateNewInsight();
            }
        };
        if (userProfile) checkInsight();
    }, [userProfile?.dailyInsight?.timestamp, userProfile === null]);

    const generateNewInsight = async () => {
        if (isRefreshingInsight) return;
        setIsRefreshingInsight(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Act as "Harvey", an elite ultrasound physics mentor. Short briefing for exam prep. Max 2 sentences. Intense, authoritative.`;
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
            updateDailyInsight(response.text);
        } catch (e) { console.error(e); } finally { setIsRefreshingInsight(false); }
    };

    return (
        <div className="flex flex-col xl:flex-row justify-between items-stretch gap-6 sm:gap-8 mb-8 px-1 sm:px-0">
            {/* Greeting & Harvey Insight */}
            <div className="xl:w-1/3 flex flex-col justify-center py-2 sm:py-4 relative group/hero">
                <motion.div 
                    className="absolute left-0 w-full h-[1px] bg-cyan-400 shadow-[0_0_10px_cyan] z-50 pointer-events-none"
                    initial={{ top: '0%' }}
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="flex items-center gap-3 mb-4">
                    <EchoBotMascot size={28} isThinking={isRefreshingInsight} />
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                        <span className="text-[10px]">🔥</span>
                        <span className="text-[8px] sm:text-[10px] font-black text-red-400 font-mono tracking-widest">{streak} DAY STREAK</span>
                    </div>
                </div>
                
                <NarrativeWrapper text={`${greeting}, ${pilotName}. Welcome back.`}>
                    <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-4 italic uppercase break-words">
                        {greeting},<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/30">
                            {pilotName}.
                        </span>
                    </h1>
                </NarrativeWrapper>
                
                <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl relative overflow-hidden group/insight mt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-3 bg-[var(--gold)]" />
                        <p className="text-[7px] sm:text-[8px] font-mono text-white/30 uppercase tracking-[0.4em]">Harvey_Link_v5</p>
                    </div>
                    <AnimatePresence mode="wait">
                        {userProfile?.dailyInsight?.text && (
                            <NarrativeWrapper text={userProfile.dailyInsight.text} title="Tactical Insight">
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs sm:text-sm text-white/60 leading-relaxed font-light italic">
                                    "{userProfile.dailyInsight.text}"
                                </motion.p>
                            </NarrativeWrapper>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Stats Scroller (Mobile) / Grid (Desktop) */}
            <div className="xl:w-1/3 flex flex-col gap-4">
                <div className="flex overflow-x-auto no-scrollbar gap-3 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible min-h-[90px] sm:h-auto">
                    <StatWidget label="Echo Credits" value={credits.toLocaleString()} subtext="Liquid_Cap" icon="🪙" colorClass="text-yellow-400" />
                    <StatWidget label="Intel Rank" value={Math.floor(progress/10) + 1} subtext="Neural_Lvl" icon={<TargetIcon className="w-5 h-5" />} colorClass="text-cyan-400" />
                </div>
                
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-5 flex items-center justify-between shadow-xl backdrop-blur-md">
                    <div className="relative z-10 shrink-0">
                        <p className="text-[8px] sm:text-[10px] font-mono text-white/30 uppercase mb-1 tracking-widest">Mastery_Link</p>
                        <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">{progress.toFixed(0)}%</p>
                    </div>
                    <div className="flex-grow max-w-[150px] sm:max-w-[200px] ml-4 sm:ml-8 h-1.5 sm:h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_cyan]" 
                            initial={{ width: 0 }} 
                            animate={{ width: `${progress}%` }} 
                            transition={{ duration: 2, ease: "circOut" }} 
                        />
                    </div>
                </div>
            </div>

            {/* Next Objective Mission Card */}
            <div className="xl:w-1/3">
                <button onClick={studyPath ? onContinuePathClick : onGeneratePathClick} className="w-full h-full min-h-[140px] sm:min-h-[220px] group relative bg-white text-black rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all active:scale-[0.98] shadow-2xl border border-white/20">
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#fff_0%,#f0f0f0_100%)] z-0" />
                    <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <BrainIcon className="w-24 h-24 sm:w-40 sm:h-40" />
                    </div>
                    <div className="h-full p-6 sm:p-10 flex flex-col justify-between relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-[8px] sm:text-[10px] font-black font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] px-2.5 sm:px-3 py-1 rounded-full border-2 border-black/10">
                                {studyPath ? 'MISSION_READY' : 'WAITING_ORDERS'}
                            </span>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/5 flex items-center justify-center">
                                <SparklesIcon className="w-3 h-3 sm:w-4 sm:h-4 text-black/40" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-left">
                                <p className="text-[8px] sm:text-[11px] text-black/40 font-black uppercase mb-1 tracking-widest">Immediate Objective</p>
                                <h3 className="text-xl sm:text-3xl font-black tracking-tighter text-black italic uppercase leading-none">
                                    {studyPath ? 'Resume Path' : 'Generate Plan'}
                                </h3>
                            </div>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-black transition-all duration-500 shadow-2xl group-hover:scale-110">
                                <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default Hero;