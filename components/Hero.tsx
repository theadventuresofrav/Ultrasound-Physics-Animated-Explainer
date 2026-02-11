
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
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full min-w-[120px] relative overflow-hidden group">
        <div className={`absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-all ${colorClass}`}>{icon}</div>
        <p className="text-[8px] sm:text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2 sm:mb-3 border-b border-white/5 pb-2 w-fit">{label}</p>
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
            {subtext && <p className={`text-[7px] sm:text-[9px] mt-1 sm:mt-1.5 font-bold uppercase tracking-wide opacity-80 ${colorClass}`}>{subtext}</p>}
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
        <div className="flex flex-col xl:flex-row justify-between items-stretch gap-4 sm:gap-6 mb-8 lg:mb-10 px-2 sm:px-0">
            {/* Column 1: Greeting */}
            <div className="xl:w-1/3 flex flex-col justify-center py-4 relative">
                <div className="flex items-center gap-3 mb-4">
                    <EchoBotMascot size={28} isThinking={isRefreshingInsight} />
                    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                        <span className="text-xs">🔥</span>
                        <span className="text-[10px] font-black text-red-400 font-mono">{streak} STREAK</span>
                    </div>
                </div>
                
                <NarrativeWrapper text={`${greeting}, ${pilotName}. Welcome back.`}>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.9] mb-4">
                        {greeting},<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                            {pilotName}.
                        </span>
                    </h1>
                </NarrativeWrapper>
                
                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl relative overflow-hidden group/insight mt-2">
                    <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1">Commander Harvey's Briefing</p>
                    <AnimatePresence mode="wait">
                        {userProfile?.dailyInsight?.text && (
                            <NarrativeWrapper text={userProfile.dailyInsight.text} title="Tactical Insight">
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs sm:text-sm text-white/70 leading-relaxed font-light italic">
                                    "{userProfile.dailyInsight.text}"
                                </motion.p>
                            </NarrativeWrapper>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Column 2: Stats Grid */}
            <div className="xl:w-1/3 grid grid-cols-2 gap-3 sm:gap-4">
                <StatWidget label="Echo Credits" value={credits.toLocaleString()} subtext="CURRENCY" icon="🪙" colorClass="text-yellow-400" />
                <StatWidget label="Intelligence" value={Math.floor(progress/10) + 1} subtext="RANK" icon={<TargetIcon className="w-5 h-5" />} colorClass="text-cyan-400" />
                <div className="col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
                    <div className="relative z-10">
                        <p className="text-[9px] font-mono text-white/40 uppercase mb-1">System Mastery</p>
                        <p className="text-2xl sm:text-3xl font-black text-white tracking-tighter">{progress.toFixed(0)}%</p>
                    </div>
                    <div className="w-24 sm:w-48 h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_white]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2 }} />
                    </div>
                </div>
            </div>

            {/* Column 3: Objective CTA */}
            <div className="xl:w-1/3">
                <button onClick={studyPath ? onContinuePathClick : onGeneratePathClick} className="w-full h-full min-h-[140px] sm:min-h-[180px] group relative bg-[#e5e5e5] text-black rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#f0f0f0] to-[#d4d4d4] z-0" />
                    <div className="h-full p-6 sm:p-7 flex flex-col justify-between relative z-10">
                        <div className="flex justify-between items-start">
                            <span className="text-[8px] font-bold font-mono uppercase tracking-[0.2em] px-2 py-1 rounded border border-black/10">
                                {studyPath ? 'MISSION ACTIVE' : 'NO ORDERS'}
                            </span>
                            <SparklesIcon className="w-5 h-5 text-black/20" />
                        </div>
                        <div className="flex items-end justify-between">
                            <div className="text-left">
                                <p className="text-[9px] text-black/40 font-bold uppercase mb-1">Next Objective</p>
                                <p className="text-xl sm:text-2xl font-black tracking-tight text-black">
                                    {studyPath ? 'Resume Path' : 'Generate Plan'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-black transition-all">
                                <ChevronRightIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default Hero;
