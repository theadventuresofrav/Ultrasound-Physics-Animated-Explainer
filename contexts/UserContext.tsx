import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import { UserProfile, DemoId, AIFlashcard, SRSCard, Priority, StudyTask, AIStudyPath, Theme, SystemOverrides, PodcastEpisode, UserResource, SimulationMedium, VaultedMnemonic, DailyInsight } from '../types';
import { ACHIEVEMENTS } from '../achievements';
import { COURSE_MODULES } from '../constants';
import { useNotification } from './NotificationContext';
import { GoogleGenAI, Modality } from '@google/genai';
import { getModuleIntro } from '../data/moduleIntros';
import { supabase } from '../lib/supabaseClient';
import { getAudioContentHash } from '../utils/audio';

const USER_PROFILE_STORAGE_KEY = 'echoMastersUserProfile_v4';
const GUEST_ID_KEY = 'echoMasters_guest_uuid';

const ONBOARDING_TEXTS = [
    "System Initialization. Welcome to the EchoMasters Interface. We are calibrating your learning environment. Prepare for a high-fidelity deep dive into Ultrasound Physics.",
    "Interactive Physics Engine. Static text is obsolete. Engage with our real-time simulations to manipulate waves, artifacts, and hemodynamics. Don't just read physics—control it.",
    "AI Neural Link. EchoBot is online. Your advanced AI copilot is ready to analyze concepts, answer queries, and generate custom practice scenarios on demand.",
    "Tactical Study Path. Don't guess what to study. Generate a strategic, AI-driven roadmap tailored specifically to your exam date, strengths, and learning style.",
    "Mission: Mastery. Your command center is ready. Track your stats, conquer the modules, and prepare to dominate the SPI exam."
];

const defaultProfile: UserProfile = {
    name: 'Guest User',
    joinDate: Date.now(),
    lastActiveModule: null,
    completedModules: [],
    quizScores: {},
    achievements: [],
    flashcardDecks: {},
    studyTasks: [],
    userResources: [],
    notes: {},
    learningStyle: null,
    studyPath: null,
    hasCompletedOnboarding: false,
    theme: 'Classic',
    isAdmin: false,
    systemOverrides: {
        podcasts: [],
        flashcards: [],
        customMedia: []
    },
    mnemonicVault: [],
    dailyInsight: null,
    currentExamState: null,
    cachedExamReport: null,
    echoCredits: 250,
    streak: 1,
    lastLoginDate: Date.now()
};

interface UserContextType {
    userProfile: UserProfile | null;
    isSyncing: boolean;
    syncProgress: number;
    isQuotaExhausted: boolean;
    markModuleAsCompleted: (moduleId: DemoId) => void;
    awardAchievement: (achievementId: string) => void;
    setSpiQuizScore: (score: number) => void;
    setSpiMockExamScore: (score: number) => void;
    resetProgress: () => void;
    addFlashcardDeck: (deckId: string, cards: AIFlashcard[]) => void;
    updateCardPerformance: (deckId: string, cardId: string, isCorrect: boolean) => void;
    addStudyTask: (text: string, priority: Priority) => void;
    toggleStudyTask: (taskId: string) => void;
    deleteStudyTask: (taskId: string) => void;
    addUserResource: (resource: UserResource) => void;
    deleteUserResource: (resourceId: string) => void;
    updateNote: (sectionId: string, content: string) => void;
    setUserName: (name: string) => void;
    setStudyPath: (path: AIStudyPath | null) => void;
    setLastActiveModule: (moduleId: DemoId | null) => void;
    markOnboardingAsCompleted: () => void;
    setTheme: (theme: Theme) => void;
    vaultMnemonic: (topic: string, content: string) => void;
    deleteMnemonic: (id: string) => void;
    updateDailyInsight: (insight: string) => void;
    updateExamState: (state: any) => void;
    updateCachedReport: (report: any) => void;
    handleApiError: (error: any) => void;
    toggleAdmin: () => void;
    updatePodcasts: (podcasts: PodcastEpisode[]) => void;
    updateFlashcardOverrides: (overrides: Partial<AIFlashcard>[]) => void;
    updateSystemLogo: (logo: string | undefined) => void;
    updateThemeMusic: (musicKey: string | undefined) => void;
    updateSimulationMedia: (media: SimulationMedium[]) => void;
    addEchoCredits: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
    const { addNotification } = useNotification();
    const syncInitiated = useRef(false);
    const guestIdRef = useRef<string | null>(localStorage.getItem(GUEST_ID_KEY));

    const handleApiError = useCallback((err: any) => {
        const errorString = JSON.stringify(err);
        if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
            setIsQuotaExhausted(true);
            setTimeout(() => setIsQuotaExhausted(false), 3 * 60 * 1000);
        }
    }, []);

    useEffect(() => {
        if (!guestIdRef.current) {
            const newId = crypto.randomUUID();
            localStorage.setItem(GUEST_ID_KEY, newId);
            guestIdRef.current = newId;
        }

        const initializeData = async () => {
            let profileData: UserProfile;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('data')
                    .eq('id', guestIdRef.current)
                    .single();

                if (data && !error) {
                    profileData = { ...defaultProfile, ...data.data };
                } else {
                    const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
                    profileData = storedProfile ? JSON.parse(storedProfile) : defaultProfile;
                }
            } catch (err) {
                const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
                profileData = storedProfile ? JSON.parse(storedProfile) : defaultProfile;
            }

            const now = Date.now();
            const lastLogin = profileData.lastLoginDate;
            if (lastLogin) {
                const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    profileData.streak += 1;
                } else if (diffDays > 1) {
                    profileData.streak = 1;
                }
            }
            profileData.lastLoginDate = now;
            setUserProfile(profileData);
        };

        initializeData();
    }, []);

    useEffect(() => {
        if (userProfile && guestIdRef.current) {
            try {
                localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
            } catch (e) {}

            const syncToCloud = async () => {
                try {
                    await supabase
                        .from('profiles')
                        .upsert({ 
                            id: guestIdRef.current, 
                            data: userProfile, 
                            updated_at: new Date().toISOString() 
                        });
                } catch (e) {}
            };
            syncToCloud();
        }
    }, [userProfile]);

    const runPregenerationSync = useCallback(async (profile: UserProfile) => {
        if (syncInitiated.current || !process.env.API_KEY || isQuotaExhausted) return;
        syncInitiated.current = true;
        setIsSyncing(true);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        // 1. Warm up Onboarding Cache
        for (const text of ONBOARDING_TEXTS) {
            if (isQuotaExhausted) break;
            const hash = getAudioContentHash(text);
            const cacheKey = `global_narr_${hash}`;
            
            if (!localStorage.getItem(cacheKey)) {
                try {
                    const { data } = await supabase.from('audio_cache').select('id').eq('id', cacheKey).single();
                    if (!data) {
                        const response = await ai.models.generateContent({
                            model: "gemini-2.5-flash-preview-tts",
                            contents: [{ parts: [{ text: `Narrate this naturally: ${text}` }] }],
                            config: {
                                responseModalities: [Modality.AUDIO],
                                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                            },
                        });
                        const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                        if (audio) {
                            localStorage.setItem(cacheKey, audio);
                            await supabase.from('audio_cache').upsert({ id: cacheKey, audio_base64: audio, created_at: new Date().toISOString() });
                            await new Promise(r => setTimeout(r, 10000)); // Throttle
                        }
                    }
                } catch (e) { handleApiError(e); }
            }
        }

        // 2. Warm up Module Intro Cache (First 5)
        const targets = COURSE_MODULES.map(m => m.id).slice(0, 5);
        for (const moduleId of targets) {
            if (isQuotaExhausted) break;
            const introData = getModuleIntro(moduleId);
            const fullText = `Narrate this naturally: Mission Objective: ${introData.title}. ${introData.lines.join(' ')}`;
            const hash = getAudioContentHash(fullText);
            const cacheKey = `global_narr_${hash}`;
            
            if (!localStorage.getItem(cacheKey)) {
                try {
                    const { data } = await supabase.from('audio_cache').select('id').eq('id', cacheKey).single();
                    if (!data) {
                        const response = await ai.models.generateContent({
                            model: "gemini-2.5-flash-preview-tts",
                            contents: [{ parts: [{ text: fullText }] }],
                            config: {
                                responseModalities: [Modality.AUDIO],
                                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' }}},
                            },
                        });
                        const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                        if (audio) {
                            localStorage.setItem(cacheKey, audio);
                            await supabase.from('audio_cache').upsert({ id: cacheKey, audio_base64: audio, created_at: new Date().toISOString() });
                            await new Promise(r => setTimeout(r, 10000));
                        }
                    }
                } catch (e) { handleApiError(e); }
            }
        }

        setIsSyncing(false);
    }, [isQuotaExhausted, handleApiError]);

    useEffect(() => {
        if (userProfile && !syncInitiated.current) {
            const timer = setTimeout(() => runPregenerationSync(userProfile), 10000);
            return () => clearTimeout(timer);
        }
    }, [userProfile, runPregenerationSync]);

    const addEchoCredits = useCallback((amount: number) => {
        setUserProfile(prev => prev ? { ...prev, echoCredits: (prev.echoCredits || 0) + amount } : null);
    }, []);

    const updateExamState = useCallback((currentExamState: any) => {
        setUserProfile(prev => prev ? { ...prev, currentExamState } : null);
    }, []);

    const updateCachedReport = useCallback((cachedExamReport: any) => {
        setUserProfile(prev => prev ? { ...prev, cachedExamReport } : null);
    }, []);

    const markModuleAsCompleted = useCallback((moduleId: DemoId) => {
        setUserProfile(prev => {
            if (!prev || prev.completedModules.includes(moduleId)) return prev;
            return { 
                ...prev, 
                completedModules: [...prev.completedModules, moduleId],
                echoCredits: (prev.echoCredits || 0) + 100 
            };
        });
    }, []);

    const awardAchievement = useCallback((achievementId: string) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;
        setUserProfile(prev => {
            if (!prev || prev.achievements.includes(achievementId)) return prev;
            addNotification(achievement);
            return { 
                ...prev, 
                achievements: [...prev.achievements, achievementId],
                echoCredits: (prev.echoCredits || 0) + 50
            };
        });
    }, [addNotification]);
    
    const setSpiQuizScore = useCallback((score: number) => {
        setUserProfile(prev => {
            if (!prev) return prev;
            const currentBest = prev.quizScores.spi ?? -1;
            const creditAward = score > currentBest ? Math.floor(score * 2) : 0;
            if (score > currentBest) return { ...prev, echoCredits: (prev.echoCredits || 0) + creditAward, quizScores: { ...prev.quizScores, spi: score } };
            return prev;
        });
    }, []);

    const setSpiMockExamScore = useCallback((score: number) => {
        setUserProfile(prev => {
            if (!prev) return prev;
            const currentBest = prev.quizScores.spiMockExam ?? -1;
            const creditAward = score > currentBest ? Math.floor(score * 5) : 0;
            if (score > currentBest) {
                 const newProfile = { 
                    ...prev, 
                    echoCredits: (prev.echoCredits || 0) + creditAward,
                    quizScores: { ...prev.quizScores, spiMockExam: score } 
                };
                if (score >= 90 && !newProfile.achievements.includes('exam_master')) {
                    const achievement = ACHIEVEMENTS.find(a => a.id === 'exam_master');
                    if (achievement) { newProfile.achievements.push('exam_master'); addNotification(achievement); }
                }
                return newProfile;
            }
            return prev;
        });
    }, [addNotification]);

    const resetProgress = useCallback(async () => {
        if (window.confirm("Perform core system reset? This will also wipe your cloud backup.")) {
            if (guestIdRef.current) {
                try { await supabase.from('profiles').delete().eq('id', guestIdRef.current); } catch(e) {}
            }
            setUserProfile(prev => ({
                ...defaultProfile,
                name: prev?.name || 'Guest User',
                joinDate: prev?.joinDate || Date.now(),
                isAdmin: prev?.isAdmin || false
            }));
        }
    }, []);
    
    const markOnboardingAsCompleted = useCallback(() => {
        setUserProfile(prev => prev ? { ...prev, hasCompletedOnboarding: true } : null);
    }, []);

    const addFlashcardDeck = useCallback((deckId: string, cards: AIFlashcard[]) => {
        const newCards: SRSCard[] = cards.map((card, index) => ({
            id: `${deckId}-${Date.now()}-${index}`,
            term: card.term,
            definition: card.definition,
            frontImage: card.frontImage,
            backImage: card.backImage,
            level: 0,
            lastReviewed: null,
            nextReview: Date.now(),
        }));
        setUserProfile(prev => {
            if (!prev) return prev;
            return { ...prev, flashcardDecks: { ...prev.flashcardDecks, [deckId]: [...(prev.flashcardDecks[deckId] || []), ...newCards] } };
        });
    }, []);

    const updateCardPerformance = useCallback((deckId: string, cardId: string, isCorrect: boolean) => {
        const SRS_INTERVALS = [10 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000, 14 * 24 * 60 * 60 * 1000, 30 * 24 * 60 * 60 * 1000];
        setUserProfile(prev => {
            if (!prev || !prev.flashcardDecks[deckId]) return prev;
            const now = Date.now();
            let creditBonus = 0;
            const updatedCards = prev.flashcardDecks[deckId].map(card => {
                if (card.id === cardId) {
                    let newLevel = isCorrect ? Math.min(5, card.level + 1) : 0;
                    if (isCorrect && newLevel > card.level) creditBonus = 5;
                    const nextReviewTime = now + (SRS_INTERVALS[newLevel] || SRS_INTERVALS[5]);
                    return { ...card, level: newLevel, lastReviewed: now, nextReview: nextReviewTime };
                }
                return card;
            });
            return { ...prev, echoCredits: (prev.echoCredits || 0) + creditBonus, flashcardDecks: { ...prev.flashcardDecks, [deckId]: updatedCards } };
        });
    }, []);

    const addStudyTask = useCallback((text: string, priority: Priority) => {
        setUserProfile(prev => {
            if (!prev) return prev;
            const reward = priority === 'High' ? 25 : priority === 'Medium' ? 15 : 10;
            const newTask: StudyTask = { id: Math.random().toString(36).substr(2, 9), text, isCompleted: false, priority, reward };
            return { ...prev, studyTasks: [...(prev.studyTasks || []), newTask] };
        });
    }, []);

    const toggleStudyTask = useCallback((taskId: string) => {
        setUserProfile(prev => {
            if (!prev) return null;
            let earned = 0;
            const tasks = (prev.studyTasks || []).map(task => {
                if (task.id === taskId) {
                    if (!task.isCompleted) earned = task.reward || 10;
                    return { ...task, isCompleted: !task.isCompleted };
                }
                return task;
            });
            return { ...prev, echoCredits: (prev.echoCredits || 0) + earned, studyTasks: tasks };
        });
    }, []);

    const deleteStudyTask = useCallback((taskId: string) => {
        setUserProfile(prev => prev ? { ...prev, studyTasks: (prev.studyTasks || []).filter(task => task.id !== taskId) } : null);
    }, []);

    const addUserResource = useCallback((resource: UserResource) => {
        setUserProfile(prev => prev ? { ...prev, userResources: [resource, ...(prev.userResources || [])] } : null);
    }, []);

    const deleteUserResource = useCallback((resourceId: string) => {
        setUserProfile(prev => prev ? { ...prev, userResources: (prev.userResources || []).filter(r => r.id !== resourceId) } : null);
    }, []);
    
    const updateNote = useCallback((sectionId: string, content: string) => {
        setUserProfile(prev => prev ? { ...prev, notes: { ...prev.notes, [sectionId]: content } } : null);
    }, []);

    const setUserName = useCallback((name: string) => {
        setUserProfile(prev => (prev ? { ...prev, name } : null));
    }, []);

    const setTheme = useCallback((theme: Theme) => {
        setUserProfile(prev => (prev ? { ...prev, theme } : null));
    }, []);

    const setStudyPath = useCallback((path: AIStudyPath | null) => {
        setUserProfile(prev => prev ? { ...prev, studyPath: path, learningStyle: path ? path.learningStyle : prev.learningStyle } : null);
    }, []);

    const setLastActiveModule = useCallback((moduleId: DemoId | null) => {
        setUserProfile(prev => (prev ? { ...prev, lastActiveModule: moduleId } : null));
    }, []);

    const vaultMnemonic = useCallback((topic: string, content: string) => {
        setUserProfile(prev => {
            if (!prev) return null;
            const newItem: VaultedMnemonic = { id: `mnem-${Date.now()}`, topic, content, timestamp: Date.now() };
            return { ...prev, mnemonicVault: [newItem, ...(prev.mnemonicVault || [])] };
        });
    }, []);

    const deleteMnemonic = useCallback((id: string) => {
        setUserProfile(prev => prev ? { ...prev, mnemonicVault: prev.mnemonicVault.filter(m => m.id !== id) } : null);
    }, []);

    const updateDailyInsight = useCallback((insight: string) => {
        setUserProfile(prev => prev ? { ...prev, dailyInsight: { text: insight, timestamp: Date.now() } } : null);
    }, []);

    const toggleAdmin = useCallback(() => {
        setUserProfile(prev => prev ? { ...prev, isAdmin: !prev.isAdmin } : null);
    }, []);

    const updatePodcasts = useCallback((podcasts: PodcastEpisode[]) => {
        setUserProfile(prev => prev ? { ...prev, systemOverrides: { ...(prev.systemOverrides || {}), podcasts } } : null);
    }, []);

    const updateFlashcardOverrides = useCallback((flashcards: Partial<AIFlashcard>[]) => {
        setUserProfile(prev => prev ? { ...prev, systemOverrides: { ...(prev.systemOverrides || {}), flashcards } } : null);
    }, []);

    const updateSystemLogo = useCallback((systemLogo: string | undefined) => {
        setUserProfile(prev => prev ? { ...prev, systemOverrides: { ...(prev.systemOverrides || {}), systemLogo } } : null);
    }, []);

    const updateThemeMusic = useCallback((themeMusicKey: string | undefined) => {
        setUserProfile(prev => prev ? { ...prev, systemOverrides: { ...(prev.systemOverrides || {}), themeMusicKey } } : null);
    }, []);

    const updateSimulationMedia = useCallback((customMedia: SimulationMedium[]) => {
        setUserProfile(prev => prev ? { ...prev, systemOverrides: { ...(prev.systemOverrides || {}), customMedia } } : null);
    }, []);

    return (
        <UserContext.Provider value={{ 
            userProfile, isSyncing, syncProgress: 0, isQuotaExhausted, handleApiError, markModuleAsCompleted, awardAchievement, setSpiQuizScore, setSpiMockExamScore, resetProgress, addFlashcardDeck, updateCardPerformance, addStudyTask, toggleStudyTask, deleteStudyTask, addUserResource, deleteUserResource, updateNote, setUserName, setStudyPath, setLastActiveModule, markOnboardingAsCompleted, setTheme, vaultMnemonic, deleteMnemonic, updateDailyInsight, updateExamState, updateCachedReport, toggleAdmin, updatePodcasts, updateFlashcardOverrides, updateSystemLogo, updateThemeMusic, updateSimulationMedia, addEchoCredits
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
};