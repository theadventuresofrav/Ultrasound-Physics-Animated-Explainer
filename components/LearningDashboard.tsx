
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_MODULES } from '../constants';
import { DemoId, UserProfile, AIStudyPath, PodcastEpisode, VaultedMnemonic } from '../types';
import StudyPlanner from './StudyPlanner';
import FlashcardSummary from './FlashcardSummary';
import Hero from './Hero';
import CourseGrid, { FilterType } from './CourseGrid';
import SearchBar from './SearchBar';
import { TargetIcon, PlayIcon, BrainIcon, SparklesIcon } from './Icons';
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

let currentAudio: HTMLAudioElement | null = null;

const SimulatedVisualizer = ({ isActive }: { isActive: boolean }) => (
    <div className="flex items-center gap-[2px] h-3 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
                key={i}
                className="w-[2px] bg-[var(--gold)]/60 rounded-full"
                animate={isActive ? { height: [2, 10, 3, 12, 2] } : { height: 2 }}
                transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
            />
        ))}
    </div>
);

const MnemonicVaultItem: React.FC<{ item: VaultedMnemonic, onDelete: (id: string) => void }> = ({ item, onDelete }) => (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl group/mnem relative">
        <button onClick={() => onDelete(item.id)} className="absolute top-2 right-2 opacity-0 group-hover/mnem:opacity-100 text-white/20 hover:text-red-400 transition-all">✕</button>
        <p className="text-[8px] font-mono text-[var(--gold)]/50 uppercase tracking-widest mb-1">{item.topic}</p>
        <p className="text-xs text-white/80 font-light italic leading-relaxed">"{item.content}"</p>
        <p className="text-[7px] font-mono text-white/10 mt-2 text-right">{new Date(item.timestamp).toLocaleDateString()}</p>
    </div>
);

const MnemonicVault: React.FC<{ vault: VaultedMnemonic[], deleteMnemonic: (id: string) => void }> = ({ vault, deleteMnemonic }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-5 px-1 border-b border-white/5 pb-3">
               <div className="flex items-center gap-2">
                    <BrainIcon className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Harvey's_Vault</span>
               </div>
               <span className="text-[8px] font-mono text-white/20 tracking-tighter">DATASET_V2.1</span>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {vault && vault.length > 0 ? (
                    vault.slice(0, 8).map(item => (
                        <MnemonicVaultItem key={item.id} item={item} onDelete={deleteMnemonic} />
                    ))
                ) : (
                    <div className="h-20 flex flex-col items-center justify-center opacity-20 italic">
                        <SparklesIcon className="w-6 h-6 mb-2" />
                        <p className="text-[10px] text-center px-4">Engage briefings to store specialized mnemonics here.</p>
                    </div>
                )}
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

    useEffect(() => {
        return () => { if (currentAudio) { currentAudio.pause(); currentAudio = null; } };
    }, []);

    const handlePlay = (episode: PodcastEpisode) => {
        if (activeId === episode.id) {
            setActiveId(null);
            if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            return;
        }
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
        setActiveId(episode.id);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-5 px-1 border-b border-white/5 pb-3">
               <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-[0.3em] font-black">Sonic_Feed</span>
               </div>
               <SimulatedVisualizer isActive={activeId !== null} />
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {podcastList.map((ep) => {
                    const isActive = activeId === ep.id;
                    const isDirectFile = ep.embedSrc?.startsWith('data:audio');

                    return (
                        <div 
                            key={ep.id} 
                            className={`rounded-2xl border transition-all duration-500 group ${isActive ? 'bg-[var(--gold)]/5 border-[var(--gold)]/30 shadow-[0_0_25px_rgba(212,175,55,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                        >
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => handlePlay(ep)}>
                                <div className="flex items-center gap-4 w-full">
                                    <button className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-[var(--gold)] text-black' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                                        {isActive ? <div className="w-3 h-3 bg-current rounded-sm animate-pulse" /> : <PlayIcon className="w-4 h-4 ml-0.5" />}
                                    </button>
                                    <div className="flex-grow min-w-0">
                                        <h4 className={`text-xs font-black truncate uppercase tracking-tighter ${isActive ? 'text-[var(--gold)]' : 'text-white/80'}`}>{ep.title}</h4>
                                        <p className="text-[9px] text-white/30 font-mono mt-1 tracking-widest">{ep.duration} // SOURCE:OS_CORE</p>
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {isActive && ep.embedSrc && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                                        <div className="bg-black/60 rounded-xl border border-white/5 overflow-hidden">
                                            {isDirectFile ? (
                                                <div className="p-3">
                                                    <audio src={ep.embedSrc} controls autoPlay className="w-full h-8 brightness-90" />
                                                </div>
                                            ) : (
                                                <iframe title={ep.title} allowTransparency={true} height="120" width="100%" style={{border: 'none'}} src={`${ep.embedSrc}&auto_play=1`} allow="autoplay" loading="lazy"></iframe>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SectorHeader: React.FC<{ title: string; progress: number }> = ({ title, progress }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-4 mb-10 relative">
        <div className="relative">
            <motion.div 
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-[var(--gold)]/20 rounded-full opacity-0 sm:opacity-100"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--gold)] rounded-full blur-[1px]" />
            </motion.div>
            <div className="sm:pl-10">
                <h2 className="text-[9px] font-mono text-[var(--gold)]/50 uppercase tracking-[0.5em] mb-2 font-black">Sector_Link_Authenticated</h2>
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-2xl">
                    {title}<span className="text-[var(--gold)] opacity-30">.</span>
                </h3>
            </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[180px] bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex justify-between w-full text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">
                <span>Synchronization</span>
                <span className="text-[var(--gold)]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] shadow-[0_0_15px_rgba(212,175,55,0.4)] rounded-full" 
                />
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
    const { setStudyPath, deleteMnemonic, isSyncing } = useUser();
    const [activeFilter, setActiveFilter] = useState<FilterType>('All');
    const [showIntake, setShowIntake] = useState(false);
    const [pathAnimation, setPathAnimation] = useState(false);

    if (userProfile?.isAdmin) return <AdminPortal />;

    const getSectorProgress = (moduleIds: string[]) => {
        const completed = userProfile?.completedModules || [];
        const count = moduleIds.filter(id => completed.includes(id as DemoId)).length;
        return (count / moduleIds.length) * 100;
    };

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1800px] mx-auto space-y-20 relative">
            <Hero 
                userProfile={userProfile} 
                onGeneratePathClick={() => setShowIntake(true)}
                studyPath={userProfile?.studyPath || null}
                onContinuePathClick={() => document.getElementById('foundations')?.scrollIntoView({ behavior: 'smooth' })}
            />

            <AnimatePresence>
                {showIntake && <StudyPlanIntake onGeneratePath={(path) => { setShowIntake(false); setPathAnimation(true); setStudyPath(path); setTimeout(() => setPathAnimation(false), 5000); }} onCancel={() => setShowIntake(false)} userProfile={userProfile} />}
                {pathAnimation && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8"><div className="w-full max-w-4xl"><AIStudyPathAnimation /></div></motion.div>}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
                {/* Main Content: 3 Cols */}
                <div className="xl:col-span-3 space-y-24">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/[0.02] p-4 rounded-3xl border border-white/10 backdrop-blur-xl relative group shadow-2xl">
                        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar relative z-10">
                            {(['All', 'In Progress', 'Completed', 'Premium', 'Clinical', 'Advanced'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f as FilterType)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2 ${activeFilter === f ? 'bg-[var(--gold)] border-[var(--gold)] text-black shadow-[0_0_30px_rgba(212,175,55,0.3)]' : 'text-white/40 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div className="hidden sm:block h-10 w-[1px] bg-white/10" />
                            <SearchBar onResultClick={onModuleClick} />
                        </div>
                    </div>

                    <div className="space-y-32">
                        {SECTORS.map((sector) => {
                            const progress = getSectorProgress(sector.range);
                            return (
                                <section key={sector.id} id={sector.id} className="scroll-mt-24">
                                    <SectorHeader title={sector.title} progress={progress} />
                                    <CourseGrid 
                                        activeFilter={activeFilter} 
                                        onModuleClick={onModuleClick} 
                                        userProfile={userProfile} 
                                        limitToIds={sector.range as DemoId[]}
                                    />
                                </section>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar: 1 Col */}
                <div className="xl:col-span-1 space-y-10 flex flex-col">
                    {/* Mission Intelligence Widget */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 blur-[50px] rounded-full pointer-events-none" />
                        
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 relative">
                                <motion.div 
                                    className="absolute -inset-4 rounded-full border border-[var(--gold)]/20"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                />
                                <EchoBotMascot size={80} isThinking={isSyncing} />
                            </div>
                            
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-2">EchoBot Intelligence</h3>
                            <p className="text-[10px] text-white/40 font-mono mb-6 uppercase tracking-widest">Status: Ready to Brief</p>
                            
                            <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/5 mb-6 text-left relative overflow-hidden group/brief">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]/30 group-hover/brief:bg-[var(--gold)]/60 transition-colors" />
                                <p className="text-[11px] text-white/70 italic leading-relaxed">
                                    "Cadet, I've analyzed your current trajectory. You're showing strong aptitude in Wave Mechanics, but we need to sharpen your Doppler vector analysis."
                                </p>
                            </div>
                            
                            <ControlButton onClick={() => onModuleClick('ai_academy')} fullWidth secondary className="h-12 text-[10px] tracking-widest font-black uppercase">
                                [ Engage Academy ]
                            </ControlButton>
                        </div>
                    </div>

                    {/* Harvey's Mnemonic Vault */}
                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-7 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--gold)]/5 blur-[50px] rounded-full pointer-events-none" />
                         <MnemonicVault vault={userProfile?.mnemonicVault || []} deleteMnemonic={deleteMnemonic} />
                    </div>

                    <div className="bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-7 relative overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10 min-h-[300px] flex flex-col">
                            <PodcastPlayer />
                        </div>
                    </div>

                    <div className="min-h-[300px] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-7 shadow-2xl" id="study-planner">
                        <StudyPlanner />
                    </div>
                    
                    <div className="min-h-[500px] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-7 shadow-2xl">
                        <FlashcardSummary userProfile={userProfile} onModuleClick={onModuleClick} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudyPlanIntake: React.FC<any> = ({ onGeneratePath, onCancel, userProfile }) => {
    return (
        <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0f0f11] rounded-[3rem] p-10 sm:p-14 w-full max-w-2xl border border-[var(--gold)]/20 text-center shadow-[0_0_100px_rgba(212,175,55,0.1)] relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />
                <div className="w-20 h-20 bg-[var(--gold)]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[var(--gold)]/20 shadow-inner">
                    <BrainIcon className="w-10 h-10 text-[var(--gold)]" />
                </div>
                <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Study Path Calibration</h2>
                <p className="text-white/50 mb-10 leading-relaxed font-light text-lg">System is ready to analyze your learning profile and current XP. Start mission calibration?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <ControlButton onClick={() => onGeneratePath({ summary: "Strategic path confirmed.", weeklyPlan: [] })} className="px-12 py-5 text-base">ENGAGE INITIALIZATION</ControlButton>
                    <ControlButton onClick={onCancel} secondary className="px-12 py-5 text-base">CANCEL MISSION</ControlButton>
                </div>
            </motion.div>
        </div>
    );
}

export default LearningDashboard;
