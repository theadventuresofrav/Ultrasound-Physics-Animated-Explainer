
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingParticles from './components/FloatingParticles';
import SystemFrame from './components/SystemFrame';
import LearningDashboard from './components/LearningDashboard';
import ModuleView from './components/ModuleView';
import AIAssistant from './components/AIAssistant';
import { DemoId } from './types';
import { useUser } from './contexts/UserContext';
import { COURSE_MODULES } from './constants';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotification } from './contexts/NotificationContext';
import AchievementToast from './components/AchievementToast';
import { useSettings } from './contexts/SettingsContext';
import { SoundProvider } from './contexts/SoundContext';

const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<DemoId | null>(null);
  const { userProfile, resetProgress, setLastActiveModule } = useUser();
  const { notifications, removeNotification } = useNotification();
  const { settings } = useSettings();

  useEffect(() => {
    const theme = userProfile?.theme || 'Classic';
    document.documentElement.setAttribute('data-theme', theme);
  }, [userProfile?.theme]);

  const handleModuleClick = useCallback((moduleId: DemoId) => {
    setActiveModuleId(moduleId);
    setLastActiveModule(moduleId);
  }, [setLastActiveModule]);

  const handleNavigate = (newModuleId: DemoId) => {
    setActiveModuleId(newModuleId);
    setLastActiveModule(newModuleId);
  };

  const handleCloseModule = useCallback(() => {
    if (activeModuleId) {
      setLastActiveModule(activeModuleId);
    }
    setActiveModuleId(null);
  }, [activeModuleId, setLastActiveModule]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModule();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseModule]);

  const activeModule = useMemo(() => {
    if (!activeModuleId) return null;
    return COURSE_MODULES.find(m => m.id === activeModuleId) || null;
  }, [activeModuleId]);

  return (
    <SoundProvider> 
      <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col relative overflow-hidden">
        {settings.animationsEnabled && <FloatingParticles />}
        
        {/* Global UI Frame */}
        <SystemFrame />
        
        <Header 
            onDashboardClick={() => setActiveModuleId(null)} 
            userProfile={userProfile} 
            onResetProgress={resetProgress} 
            onModuleClick={handleModuleClick}
        />

        <main className="flex-grow relative z-10">
            <AnimatePresence mode="wait">
                {activeModuleId ? (
                    <motion.div
                        key="module-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-full"
                    >
                        <ModuleView 
                            moduleId={activeModuleId} 
                            onClose={handleCloseModule} 
                            onNavigate={handleNavigate}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="h-full"
                    >
                        <LearningDashboard 
                            onModuleClick={handleModuleClick} 
                            userProfile={userProfile} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>

        {!activeModuleId && <Footer />}
        
        <AIAssistant activeModule={activeModule} />

        {/* Notification Container */}
        <div className="fixed bottom-6 left-6 z-[200] space-y-4">
          <AnimatePresence>
            {notifications.map(notification => (
              <AchievementToast
                key={notification.id}
                achievement={notification.achievement}
                onRemove={() => removeNotification(notification.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </SoundProvider>
  );
};

export default App;
