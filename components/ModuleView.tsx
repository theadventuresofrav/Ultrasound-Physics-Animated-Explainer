
import React, { Suspense, lazy, useLayoutEffect, useState, useCallback } from 'react';
import { DemoId } from '../types';
import { COURSE_MODULES } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleIntroSequence from './ModuleIntroSequence';

// Lazily import all demo components
const WavesDemo = lazy(() => import('./demos/WavesDemo'));
const TransducersDemo = lazy(() => import('./demos/TransducersDemo'));
const DopplerDemo = lazy(() => import('./demos/DopplerDemo'));
const PulsedWaveDemo = lazy(() => import('./demos/PulsedWaveDemo'));
const TgcDemo = lazy(() => import('./demos/TgcDemo'));
const DynamicRangeDemo = lazy(() => import('./demos/DynamicRangeDemo'));
const ProcessingDemo = lazy(() => import('./demos/ProcessingDemo'));
const ArtifactsDemo = lazy(() => import('./demos/ArtifactsDemo'));
const SafetyDemo = lazy(() => import('./demos/SafetyDemo'));
const HemodynamicsDemo = lazy(() => import('./demos/HemodynamicsDemo'));
const QualityAssuranceDemo = lazy(() => import('./demos/QualityAssuranceDemo'));
const ResolutionDemo = lazy(() => import('./demos/ResolutionDemo'));
const HarmonicsDemo = lazy(() => import('./demos/HarmonicsDemo'));
const ContrastAgentsDemo = lazy(() => import('./demos/ContrastAgentsDemo'));
const StudyGuideDemo = lazy(() => import('./demos/StudyGuideDemo'));
const ElastographyDemo = lazy(() => import('./demos/ElastographyDemo'));
const ThreeDDemo = lazy(() => import('./demos/ThreeDDemo'));
const AdvancedArtifactsDemo = lazy(() => import('./demos/AdvancedArtifactsDemo'));
const KnobologyDemo = lazy(() => import('./demos/KnobologyDemo'));
const BiomedicalPhysicsDemo = lazy(() => import('./demos/BiomedicalPhysicsDemo'));
const AbdominalDemo = lazy(() => import('./demos/AbdominalDemo'));
const VascularDemo = lazy(() => import('./demos/VascularDemo'));
const MSKDemo = lazy(() => import('./demos/MSKDemo'));
const CardiacDemo = lazy(() => import('./demos/CardiacDemo'));
const ComingSoonDemo = lazy(() => import('./demos/ComingSoonDemo'));
const JeopardyDemo = lazy(() => import('./demos/JeopardyDemo'));
const SpiMockExamDemo = lazy(() => import('./demos/SpiMockExamDemo'));
const ClinicalCaseDemo = lazy(() => import('./demos/ClinicalCaseDemo'));
const AIHistoryDemo = lazy(() => import('./demos/AIHistoryDemo'));
const AILectureDemo = lazy(() => import('./demos/AILectureDemo'));

interface ModuleViewProps {
  moduleId: DemoId;
  onClose: () => void;
  onNavigate: (newModuleId: DemoId) => void;
}

const ModuleNavigation: React.FC<{ currentModuleId: DemoId; onNavigate: (newModuleId: DemoId) => void; }> = ({ currentModuleId, onNavigate }) => {
    const currentIndex = COURSE_MODULES.findIndex(m => m.id === currentModuleId);
    if (currentIndex === -1) return null;

    const prevModule = currentIndex > 0 ? COURSE_MODULES[currentIndex - 1] : null;
    const nextModule = currentIndex < COURSE_MODULES.length - 1 ? COURSE_MODULES[currentIndex + 1] : null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-white/10"
        >
            {prevModule ? (
                <button 
                    onClick={() => onNavigate(prevModule.id)} 
                    className="flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-black/40 hover:border-[var(--gold)]/30 transition-all text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    </div>
                    <div className="min-w-0">
                        <span className="block text-[8px] text-white/40 uppercase tracking-widest mb-1">Previous</span>
                        <span className="block text-sm font-bold text-white truncate">{prevModule.title}</span>
                    </div>
                </button>
            ) : <div />}
            
            {nextModule ? (
                 <button 
                    onClick={() => onNavigate(nextModule.id)} 
                    className="flex items-center justify-end gap-3 p-4 rounded-xl border border-white/5 bg-black/40 hover:border-[var(--gold)]/30 transition-all text-right"
                >
                    <div className="min-w-0">
                        <span className="block text-[8px] text-white/40 uppercase tracking-widest mb-1">Next</span>
                        <span className="block text-sm font-bold text-white truncate">{nextModule.title}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                    </div>
                </button>
            ) : <div />}
        </motion.div>
    );
};

const ModuleView: React.FC<ModuleViewProps> = ({ moduleId, onClose, onNavigate }) => {
  const [showIntro, setShowIntro] = useState(true);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setShowIntro(true);
  }, [moduleId]);

  const moduleInfo = COURSE_MODULES.find(m => m.id === moduleId);
  if (!moduleInfo) return null;

  const renderDemoComponent = () => {
    switch (moduleId) {
        case 'waves': return <WavesDemo />;
        case 'transducers': return <TransducersDemo />;
        case 'doppler': return <DopplerDemo />;
        case 'pulsed': return <PulsedWaveDemo />;
        case 'tgc': return <TgcDemo />;
        case 'dynamic_range': return <DynamicRangeDemo />;
        case 'processing': return <ProcessingDemo />;
        case 'artifacts': return <ArtifactsDemo />;
        case 'safety': return <SafetyDemo />;
        case 'hemodynamics': return <HemodynamicsDemo />;
        case 'qa': return <QualityAssuranceDemo />;
        case 'resolution': return <ResolutionDemo />;
        case 'harmonics': return <HarmonicsDemo />;
        case 'contrast_agents': return <ContrastAgentsDemo />;
        case 'study_guide': return <StudyGuideDemo />;
        case 'elastography': return <ElastographyDemo />;
        case '3d_4d': return <ThreeDDemo />;
        case 'advanced_artifacts': return <AdvancedArtifactsDemo />;
        case 'knobology': return <KnobologyDemo />;
        case 'biomedical_physics': return <BiomedicalPhysicsDemo />;
        case 'abdominal': return <AbdominalDemo />;
        case 'vascular': return <VascularDemo />;
        case 'msk': return <MSKDemo />;
        case 'cardiac': return <CardiacDemo />;
        case 'jeopardy': return <JeopardyDemo />;
        case 'spi_mock_exam': return <SpiMockExamDemo onNavigate={onNavigate} />;
        case 'clinical_case_simulator': return <ClinicalCaseDemo />;
        case 'ai_history': return <AIHistoryDemo />;
        case 'ai_academy': return <AILectureDemo />;
        default: return <ComingSoonDemo moduleName={moduleInfo.title} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
        <AnimatePresence mode="wait">
            {showIntro ? (
                <motion.div key="intro-seq" className="absolute inset-0 z-[100]" exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}>
                    <ModuleIntroSequence moduleId={moduleId} onComplete={() => setShowIntro(false)} />
                </motion.div>
            ) : (
                <motion.div key="module-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                    {/* Sticky Module Header */}
                    <div className="sticky top-0 z-40 w-full bg-[#050505]/90 backdrop-blur-xl border-b border-white/10">
                        <div className="max-w-[1600px] mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[var(--gold)]/50 shrink-0">
                                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                                </button>
                                <div className="min-w-0">
                                    <p className="text-[7px] sm:text-[9px] font-mono uppercase text-white/30 tracking-widest mb-0.5">Tactical Module</p>
                                    <h1 className="text-xs sm:text-base font-black text-white truncate uppercase tracking-tighter italic">
                                        {moduleInfo.title}
                                    </h1>
                                </div>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--gold)]/20 bg-[var(--gold)]/5 text-[var(--gold)] shrink-0">
                                {moduleInfo.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <main className="flex-grow p-3 sm:p-8 max-w-[1600px] mx-auto w-full">
                        <div className="bg-black/20 border border-white/5 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden min-h-[calc(100vh-140px)] flex flex-col">
                             <div className="relative z-10 space-y-8 flex-grow">
                                <Suspense fallback={<LoadingSpinner />}>
                                  {renderDemoComponent()}
                                </Suspense>
                            </div>
                            <ModuleNavigation currentModuleId={moduleId} onNavigate={onNavigate} />
                        </div>
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default ModuleView;
