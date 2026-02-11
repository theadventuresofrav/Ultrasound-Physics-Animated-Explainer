import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_MODULES } from '../constants';
import { DemoId, UserProfile, AIStudyPath, PodcastEpisode, VaultedMnemonic, StudyTask } from '../types';
import StudyPlanner from './StudyPlanner';
import FlashcardSummary from './FlashcardSummary';
import Hero from './Hero';
import CourseGrid, { FilterType } from './CourseGrid';
import SearchBar from './SearchBar';
import { TargetIcon, PlayIcon, BrainIcon, SparklesIcon, TrophyIcon } from './Icons';
import { useUser } from '../contexts/UserContext';
import AIStudyPathAnimation from './demos/AIStudyPathAnimation';
import ControlButton from './demos/ControlButton';
import AdminPortal from './AdminPortal';
import EchoBotMascot from './EchoBotMascot';

const DEFAULT_PODCASTS: PodcastEpisode[] = [
    { 
        id: '5', 
        title: 'Attenuation Situation', 
        duration: '12 min', 
        description: 'Analyze acoustic shadowing and enhancement artifacts.',
        link: 'https://www.podbean.com/ew/pb-tz5cj-1992170',
        isNew: true,
        embedSrc: 'https://www.podbean.com/player-v2/?from=embed&i=tz5cj-1992170-pb&share=1&download=1&fonts=Impact&skin=1b1b1b&font-color=ffffff&rtl=1&logo_link=episode_page&btn-skin=60a0c8&size=150'
    },
    { 
        id: '4', 
        title: 'Transducer Tango', 
        duration: '14 min', 
        description: 'Step into the rhythm of piezoelectricity and bandwidth.',
        link: 'https://www.podbean.com/ew/pb-3qsj7-19342c3',
        isNew: false,
        embedSrc: 'https://www.podbean.com/player-v2/?i=3qsj7-19342c3-pb&from=pb6admin&share=1&download=1&rtl=1&fonts=Impact&skin=1b1b1b&font-color=ffffff&logo_link=episode_page&btn-skin=60a0c8&size=480'
    },
];

const GlobalLeaderboard: React.FC<{ userXP: number, userName: string }> = ({ userXP, userName }) => {
    // Fix: Added isUser property to static leaderboard items to fix type safety errors in combinedData processing
    const combinedData = useMemo(() => {
        const list = [
            { name: 'Dr. Echo', xp: 24500, rank: 1, avatar: '🔬', isUser: false },
            { name: 'SonarWiz', xp: 21200, rank: 2, avatar: '🐬', isUser: false },
            { name: 'PZTMaster', xp: 19800, rank: 3, avatar: '💎', isUser: false }
        ];
        const listWithUser = [...list, { name: userName, xp: userXP, rank: 0, avatar: '👤', isUser: true }];
        return listWithUser.sort((a, b) => b.xp - a.xp).map((item, i) => ({ ...item, rank: i + 1 }));
    }, [userXP, userName]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-5 px-1 border-b border-white/5 pb-3">
               <div className="flex items-center gap-2">
                    <TrophyIcon className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Rankings</span>
               </div>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2 custom-scrollbar pr-1">
                {combinedData.map((pilot) => (
                    <div key={pilot.name} className={`flex items-center justify-between p-3 rounded-xl border ${pilot.isUser ? 'bg-[var(--gold)]/10 border-[var(--gold)]/40 shadow-lg' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black font-mono w-4 ${pilot.rank <= 3 ? 'text-yellow-400' : 'text-white/20'}`}>#{pilot.rank}</span>
                            <span className="text-lg">{pilot.avatar}</span>
                            <span className={`text-xs font-bold truncate max-w-[80px] ${pilot.isUser ? 'text-white' : 'text-white/60'}`}>{pilot.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{pilot.xp.toLocaleString()} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PodcastPlayer: React.FC = () => {
    const { userProfile } = useUser();
    const [activeId, setActiveId] = useState<string | null>(null);

    const podcastList = useMemo(() => {
        const overrides = userProfile?.systemOverrides.podcasts;
        return (overrides && overrides.length > 0) ? overrides : DEFAULT_PODCASTS;
    }, [userProfile?.systemOverrides.podcasts]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Sonic_Feed</span>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {podcastList.map((ep) => (
                    <div key={ep.id} className={`rounded-xl border transition-all ${activeId === ep.id ? 'bg-[var(--gold)]/5 border-[var(--gold)]/30' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="p-3 flex items-center gap-3 cursor-pointer" onClick={() => setActiveId(activeId === ep.id ? null : ep.id)}>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--gold)]">
                                {activeId === ep.id ? '⏸' : '▶'}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] font-black truncate uppercase text-white/90">{ep.title}</h4>
                                <p className="text-[8px] text-white/30 font-mono">{ep.duration}</p>
                            </div>
                        </div>
                        <AnimatePresence>
                            {activeId === ep.id && ep.embedSrc && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-3 pb-3 overflow-hidden">
                                    <iframe title={ep.title} height="100" width="100%" style={{ border: 'none' }} src={`${ep.embedSrc}&auto_play=1`} loading="lazy"></iframe>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SectorHeader: React.FC<{ title: string; progress: number }> = ({ title, progress }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 mb-8 relative">
        <div className="relative">
            <div className="sm:pl-6">
                <h2 className="text-[8px] font-mono text-[var(--gold)]/50 uppercase tracking-[0.4em] mb-1 font-black">Sector_Link: OK</h2>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-tight drop-shadow-lg">
                    {title}
                </h3>
            </div>
        </div>
        <div className="min-w-[150px] bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
            <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase mb-2">
                <span>Sync</span>
                <span className="text-[var(--gold)]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-[var(--gold)]" />
            </div>
        </div>
    </div>
);

const SECTORS = [
    { id: 'foundations', title: 'Physics Foundations', range: ['waves', 'transducers', 'biomedical_physics', 'knobology'] },
    { id: 'physics', title: 'Advanced Dynamics', range: ['pulsed', 'resolution', 'harmonics', 'doppler', 'hemodynamics', 'dynamic_range', 'tgc', 'processing'] },
    { id: 'clinical', title: 'Clinical Intelligence', range: ['abdominal', 'vascular', 'msk', 'cardiac', 'clinical_case_simulator'] },
    { id: 'mastery', title: 'Final Certification', range: ['artifacts', 'advanced_artifacts', 'qa', 'study_guide', 'jeopardy', 'spi_mock_exam'] }
];

const LearningDashboard: React.FC<{ onModuleClick: (moduleId: DemoId) => void; userProfile: UserProfile | null }> = ({ onModuleClick, userProfile }) => {
    // 1. Declare all hooks first (Rules of Hooks)
    const { setStudyPath, deleteMnemonic, isSyncing } = useUser();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [showIntake, setShowIntake] = useState(false);
    const [pathAnimation, setPathAnimation] = useState(false);

    const userXP = useMemo(() => {
        const baseXP = (userProfile?.completedModules.length || 0) * 1000;
        const quizXP = Object.values(userProfile?.quizScores || {}).reduce<number>((acc, val) => acc + (Number(val) || 0) * 10, 0);
        return baseXP + Math.floor(quizXP);
    }, [userProfile]);

    // 2. Perform conditional returns AFTER all hooks are defined
    if (userProfile?.isAdmin) return <AdminPortal />;

    const getSectorProgress = (moduleIds: string[]) => {
        const completed = userProfile?.completedModules || [];
        const count = moduleIds.filter(id => completed.includes(id as DemoId)).length;
        return (count / moduleIds.length) * 100;
    };

    return (
        <div className="p-3 sm:p-8 lg:p-12 max-w-[1800px] mx-auto space-y-12 sm:space-y-20 relative">
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
                    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6">
                        <AIStudyPathAnimation />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col xl:flex-row gap-8 sm:gap-12">
                {/* Main: Sectors */}
                <div className="flex-grow space-y-16 sm:space-y-24 order-2 xl:order-1">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.02] p-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl">
                        <div className="flex gap-2 overflow-x-auto w-full no-scrollbar pb-1">
                            {(['All', 'In Progress', 'Completed', 'Premium', 'Clinical', 'Advanced'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f as FilterType)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFilter === f ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-lg' : 'text-white/40 border-white/5 hover:bg-white/5'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-20 sm:space-y-32">
                        {SECTORS.map((sector) => (
                            <section key={sector.id} id={sector.id} className="scroll-mt-24">
                                <SectorHeader title={sector.title} progress={getSectorProgress(sector.range)} />
                                <CourseGrid activeFilter={activeFilter} onModuleClick={onModuleClick} userProfile={userProfile} limitToIds={sector.range as DemoId[]} />
                            </section>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Widgets */}
                <aside className="w-full xl:w-80 flex flex-col gap-6 sm:gap-10 order-1 xl:order-2">
                    {/* Bot Interface */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl text-center">
                        <div className="mb-6 relative inline-block">
                             <EchoBotMascot size={70} isThinking={isSyncing} />
                        </div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Neural Intelligence</h3>
                        <div className="bg-white/5 rounded-xl p-3 text-left border-l-2 border-[var(--gold)]/30 mb-6">
                            <p className="text-[10px] text-white/70 italic leading-relaxed">
                                "Keep going, Cadet. Tactical data suggests high success probability."
                            </p>
                        </div>
                        <ControlButton onClick={() => onModuleClick('ai_academy')} fullWidth secondary className="h-11 text-[9px] font-black uppercase">
                            [ Academy Uplink ]
                        </ControlButton>
                    </div>

                    {/* Leaderboard & Log */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6 sm:gap-10">
                        <div className="bg-black/20 border border-white/10 rounded-3xl p-6 h-80 shadow-2xl">
                            <GlobalLeaderboard userXP={userXP} userName={userProfile?.name || 'Cadet'} />
                        </div>
                        <div className="bg-black/20 border border-white/10 rounded-3xl p-6 h-80 shadow-2xl">
                             <MnemonicVault vault={userProfile?.mnemonicVault || []} deleteMnemonic={deleteMnemonic} />
                        </div>
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <StudyPlanner />
                    </div>

                    <div className="bg-black/20 border border-white/10 rounded-3xl p-6 h-80 shadow-2xl">
                        <PodcastPlayer />
                    </div>
                    
                    <div className="bg-black/20 border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <FlashcardSummary userProfile={userProfile} onModuleClick={onModuleClick} />
                    </div>
                </aside>
            </div>
        </div>
    );
};

const MnemonicVault: React.FC<{ vault: VaultedMnemonic[], deleteMnemonic: (id: string) => void }> = ({ vault, deleteMnemonic }) => (
    <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-5 px-1 border-b border-white/5 pb-3">
            <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Harvey's Vault</span>
        </div>
        <div className="flex-grow overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {vault.length > 0 ? vault.slice(0, 5).map(item => (
                <div key={item.id} className="bg-white/5 p-3 rounded-xl relative group">
                    <button onClick={() => deleteMnemonic(item.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 text-[10px]">✕</button>
                    <p className="text-[8px] font-bold text-[var(--gold)] uppercase mb-1">{item.topic}</p>
                    <p className="text-[10px] text-white/80 italic">"{item.content}"</p>
                </div>
            )) : <p className="text-[10px] text-white/20 italic text-center mt-10">Vault is empty.</p>}
        </div>
    </div>
);

const StudyPlanIntake: React.FC<any> = ({ onGeneratePath, onCancel }) => (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-2xl">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f0f11] rounded-[2.5rem] p-8 sm:p-14 w-full max-w-xl border border-[var(--gold)]/20 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[var(--gold)]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[var(--gold)]/20">
                <BrainIcon className="w-8 h-8 text-[var(--gold)]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 uppercase tracking-tighter">Mission Calibration</h2>
            <p className="text-sm text-white/50 mb-10 leading-relaxed font-light">System will analyze your proficiency gaps and optimize your learning vector. Engage?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ControlButton onClick={() => onGeneratePath({ summary: "Sync initiated.", weeklyPlan: [] })} className="px-10 py-4 text-sm font-black uppercase tracking-widest">Engage</ControlButton>
                <ControlButton onClick={onCancel} secondary className="px-10 py-4 text-sm font-black uppercase tracking-widest">Abort</ControlButton>
            </div>
        </motion.div>
    </div>
);

export default LearningDashboard;