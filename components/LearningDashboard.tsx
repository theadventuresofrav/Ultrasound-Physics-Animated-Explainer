import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_MODULES } from '../constants';
import { DemoId, UserProfile, AIStudyPath, PodcastEpisode, VaultedMnemonic, StudyTask } from '../types';
import StudyPlanner from './StudyPlanner';
import FlashcardSummary from './FlashcardSummary';
import Hero from './Hero';
import CourseGrid, { FilterType } from './CourseGrid';
import SearchBar from './SearchBar';
import { TargetIcon, PlayIcon, BrainIcon, SparklesIcon, TrophyIcon, SpeakerWaveIcon } from './Icons';
import { useUser } from '../contexts/UserContext';
import AIStudyPathAnimation from './demos/AIStudyPathAnimation';
import ControlButton from './demos/ControlButton';
import AdminPortal from './AdminPortal';
import EchoBotMascot from './EchoBotMascot';
import { supabase } from '../lib/supabaseClient';

const SectorHeader: React.FC<{ title: string; progress: number }> = ({ title, progress }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 px-2 sm:px-4 mb-8 sm:mb-14 relative group">
        <div className="relative">
            <div className="sm:pl-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse shadow-[0_0_10px_var(--gold)]" />
                    <h2 className="text-[7px] sm:text-[10px] font-mono text-[var(--gold)]/60 uppercase tracking-[0.4em] sm:tracking-[0.5em] font-black">Sync_Sector: ACTIVE</h2>
                </div>
                <h3 className="text-2xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9] italic drop-shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
                    {title}
                </h3>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--gold)] via-[var(--gold)]/40 to-transparent rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
        </div>
        <div className="min-w-0 sm:min-w-[200px] bg-black/60 backdrop-blur-3xl p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-mono text-white/30 uppercase mb-2 sm:mb-3 font-black tracking-widest">
                <span>Synchronization</span>
                <span className="text-[var(--gold)] gold-text-glow">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-[var(--gold)] shadow-[0_0_15px_var(--gold)]" />
            </div>
        </div>
    </div>
);

const SECTORS = [
    { id: 'foundations', title: 'Foundations', range: ['waves', 'transducers', 'biomedical_physics', 'knobology'] },
    { id: 'physics', title: 'Dynamics', range: ['pulsed', 'resolution', 'harmonics', 'doppler', 'hemodynamics', 'dynamic_range', 'tgc', 'processing'] },
    { id: 'clinical', title: 'Intelligence', range: ['abdominal', 'vascular', 'msk', 'cardiac', 'clinical_case_simulator'] },
    { id: 'mastery', title: 'Mastery', range: ['artifacts', 'advanced_artifacts', 'qa', 'study_guide', 'jeopardy', 'spi_mock_exam'] }
];

const LearningDashboard: React.FC<{ onModuleClick: (moduleId: DemoId) => void; userProfile: UserProfile | null }> = ({ onModuleClick, userProfile }) => {
    const { setStudyPath, deleteMnemonic, isSyncing, toggleAdmin } = useUser();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [showIntake, setShowIntake] = useState(false);
    const [pathAnimation, setPathAnimation] = useState(false);

    const userXP = useMemo(() => {
        const baseXP = (userProfile?.completedModules.length || 0) * 1000;
        const quizXP = Object.values(userProfile?.quizScores || {}).reduce<number>((acc, val) => acc + (Number(val) || 0) * 10, 0);
        return baseXP + Math.floor(quizXP);
    }, [userProfile]);

    if (userProfile?.isAdmin) return <AdminPortal />;

    const getSectorProgress = (moduleIds: string[]) => {
        const completed = userProfile?.completedModules || [];
        const count = moduleIds.filter(id => completed.includes(id as DemoId)).length;
        return (count / moduleIds.length) * 100;
    };

    return (
        <div className="p-4 sm:p-12 lg:p-16 max-w-[1800px] mx-auto space-y-12 sm:space-y-24 relative">
            <Hero 
                userProfile={userProfile} 
                onGeneratePathClick={() => setShowIntake(true)}
                studyPath={userProfile?.studyPath || null}
                onContinuePathClick={() => document.getElementById('foundations')?.scrollIntoView({ behavior: 'smooth' })}
            />

            <AnimatePresence>
                {showIntake && (
                    <StudyPlanIntake 
                        onGeneratePath={(path: any) => { 
                            setShowIntake(false); 
                            setPathAnimation(true); 
                            setStudyPath(path); 
                            setTimeout(() => setPathAnimation(false), 5000); 
                        }} 
                        onCancel={() => setShowIntake(false)} 
                    />
                )}
                {pathAnimation && (
                    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
                        <AIStudyPathAnimation />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Sector Jump Bar (Mobile Only) */}
            <div className="sticky top-14 z-30 flex sm:hidden gap-2 overflow-x-auto no-scrollbar py-3 px-3 bg-[#050505]/95 backdrop-blur-xl -mx-4 border-b border-white/10">
                {SECTORS.map((s) => (
                    <button 
                        key={s.id} 
                        onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 whitespace-nowrap active:bg-[var(--gold)] active:text-black transition-all"
                    >
                        {s.title}
                    </button>
                ))}
            </div>

            <div className="flex flex-col xl:flex-row gap-8 lg:gap-16">
                {/* Main Content Area */}
                <div className="flex-grow space-y-16 sm:space-y-32 order-2 xl:order-1">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0a0a0a]/80 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border border-white/10 backdrop-blur-3xl shadow-2xl">
                        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar px-1 pb-1">
                            {(['All', 'In Progress', 'Completed', 'Premium', 'Clinical', 'Advanced'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f as FilterType)}
                                    className={`px-5 sm:px-6 py-2.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border-2 ${activeFilter === f ? 'bg-white border-white text-black shadow-lg' : 'text-white/30 border-white/5 hover:border-white/20'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-20 sm:space-y-40">
                        {SECTORS.map((sector) => (
                            <section key={sector.id} id={sector.id} className="scroll-mt-32">
                                <SectorHeader title={sector.title} progress={getSectorProgress(sector.range)} />
                                <CourseGrid activeFilter={activeFilter} onModuleClick={onModuleClick} userProfile={userProfile} limitToIds={sector.range as DemoId[]} />
                            </section>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column */}
                <aside className="w-full xl:w-96 flex flex-col gap-8 sm:gap-12 order-1 xl:order-2">
                    {/* EchoBot Direct Link */}
                    <div className="bg-[#0c0c0e]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-8 relative overflow-hidden shadow-2xl text-center group transition-all duration-700 hover:border-[var(--gold)]/30">
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--gold)]/[0.02] to-transparent pointer-events-none" />
                        <div className="mb-6 sm:mb-10 relative inline-block">
                             <EchoBotMascot size={64} isThinking={isSyncing} />
                        </div>
                        <h3 className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-[0.4em] mb-4 sm:mb-6 italic">Neural_Link</h3>
                        <div className="bg-black/60 rounded-2xl p-5 text-left border border-white/5 mb-6 sm:mb-8 relative">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[var(--gold)] rounded-full" />
                            <p className="text-[11px] sm:text-[11px] text-white/60 italic leading-relaxed tracking-wide font-light">
                                "Ready for the next node, Cadet. System telemetry indicates optimal synchronization windows in Advanced Dynamics."
                            </p>
                        </div>
                        <ControlButton onClick={() => onModuleClick('ai_academy')} fullWidth secondary className="h-14 sm:h-14 text-[9px] font-black uppercase tracking-[0.3em] shadow-lg">
                            [ ACADEMY_UPLINK ]
                        </ControlButton>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                        <StudyPlanner />
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                        <FlashcardSummary userProfile={userProfile} onModuleClick={onModuleClick} />
                    </div>
                </aside>
            </div>
        </div>
    );
};

const StudyPlanIntake: React.FC<any> = ({ onGeneratePath, onCancel }) => (
    <div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-4 backdrop-blur-[40px]">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f0f11] rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 w-full max-w-xl border border-white/10 text-center shadow-[0_0_150px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)]" />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--gold)]/10 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-8 sm:mb-10 border border-[var(--gold)]/30 shadow-inner group relative">
                <div className="absolute inset-0 bg-[var(--gold)]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <BrainIcon className="w-9 h-9 sm:w-10 sm:h-10 text-[var(--gold)] relative z-10" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tighter italic">Mission_Calibration</h2>
            <p className="text-[11px] sm:text-base text-white/40 mb-10 sm:mb-12 leading-relaxed font-light px-2 sm:px-4">
                EchoBot will perform a multi-vector analysis of your proficiency gaps to optimize your learning trajectory. Engage synchronization?
            </p>
            <div className="flex flex-col gap-3 sm:gap-4">
                <ControlButton onClick={() => onGeneratePath({ summary: "Sync initiated.", weeklyPlan: [] })} className="h-16 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em]">Initiate_Neural_Mapping</ControlButton>
                <button onClick={onCancel} className="h-12 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 transition-colors">Abort_Operation</button>
            </div>
        </motion.div>
    </div>
);

export default LearningDashboard;