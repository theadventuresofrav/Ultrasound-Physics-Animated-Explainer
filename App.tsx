
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { categories } from './data/questions';
import CategoryTabs from './components/CategoryTabs';
import QuestionCard from './components/QuestionCard';
import type { Question } from './types';
import { decode, decodeAudioData } from './utils/audio';
import { saveNarration, getNarration } from './utils/db';

// --- ThemeSwitcher Component Definition ---
type Theme = 
  'theme-gold' | 'theme-cosmic' | 'theme-crimson' | 'theme-emerald' | 'theme-sapphire' | 'theme-amethyst' | 'theme-obsidian' | 'theme-sunstone' |
  'theme-gold-light' | 'theme-cosmic-light' | 'theme-crimson-light' | 'theme-emerald-light' | 'theme-sapphire-light' | 'theme-amethyst-light' | 'theme-obsidian-light' | 'theme-sunstone-light';

const DARK_THEMES: { name: Theme, color: string }[] = [
  { name: 'theme-gold', color: 'bg-[#D4AF37]' },
  { name: 'theme-cosmic', color: 'bg-[#06B6D4]' },
  { name: 'theme-crimson', color: 'bg-[#EF4444]' },
  { name: 'theme-emerald', color: 'bg-[#10B981]' },
  { name: 'theme-sapphire', color: 'bg-[#2563EB]' },
  { name: 'theme-amethyst', color: 'bg-[#d946ef]' },
  { name: 'theme-obsidian', color: 'bg-[#38bdf8]' },
  { name: 'theme-sunstone', color: 'bg-[#f97316]' },
];

const LIGHT_THEMES: { name: Theme, color: string }[] = [
    { name: 'theme-gold-light', color: 'bg-[#D4AF37]' },
    { name: 'theme-cosmic-light', color: 'bg-[#06B6D4]' },
    { name: 'theme-crimson-light', color: 'bg-[#EF4444]' },
    { name: 'theme-emerald-light', color: 'bg-[#10B981]' },
    { name: 'theme-sapphire-light', color: 'bg-[#2563EB]' },
    { name: 'theme-amethyst-light', color: 'bg-[#d946ef]' },
    { name: 'theme-obsidian-light', color: 'bg-[#38bdf8]' },
    { name: 'theme-sunstone-light', color: 'bg-[#f97316]' },
];

const ALL_THEMES = [...DARK_THEMES, ...LIGHT_THEMES];


interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className="mt-2 p-3 bg-[var(--color-bg-surface-light)] rounded-xl flex flex-col items-start gap-4 border border-[var(--color-border-base)]">
        <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] px-1 pb-2">Dark</p>
            <div className="flex flex-wrap gap-3">
                {DARK_THEMES.map(t => (
                    <button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={`w-7 h-7 rounded-full transition-all duration-200 ${t.color} ${theme === t.name ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface-light)] ring-[var(--color-primary-accent-light)]' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                        aria-label={`Switch to ${t.name.replace('theme-', '')} theme`}
                    />
                ))}
            </div>
        </div>
        <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)] px-1 pb-2">Light</p>
            <div className="flex flex-wrap gap-3">
                {LIGHT_THEMES.map(t => (
                    <button
                        key={t.name}
                        onClick={() => setTheme(t.name)}
                        className={`w-7 h-7 rounded-full transition-all duration-200 ${t.color} ${theme === t.name ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface-light)] ring-[var(--color-primary-accent)]' : 'hover:scale-110 opacity-80 hover:opacity-100'}`}
                        aria-label={`Switch to ${t.name.replace('theme-', '')} theme`}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};
// --- End ThemeSwitcher ---

// --- Icons ---
const SettingsIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.004.827c-.292.24-.437.613-.43.992a6.759 6.759 0 0 1 0 1.905c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.905c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
);
const CloseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('appTheme') as Theme;
    return ALL_THEMES.find(t => t.name === savedTheme) ? savedTheme : 'theme-gold';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    ALL_THEMES.forEach(t => root.classList.remove(t.name));
    root.classList.add(theme);
    localStorage.setItem('appTheme', theme);
  }, [theme]);


  const categoryTitles = useMemo<string[]>(() => categories.map(c => c.title), []);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string>(categories[0].title);
  const [favorites, setFavorites] = useState<string[]>([]);

  // --- Narration State ---
  const [narratingScenario, setNarratingScenario] = useState<string | null>(null);
  const [narrationStatus, setNarrationStatus] = useState<'idle' | 'loading' | 'playing' | 'paused'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentAudioBufferRef = useRef<AudioBuffer | null>(null);
  const playbackStartedAtRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const audioCacheRef = useRef(new Map<string, AudioBuffer>());


  const getAudioContext = () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  const handleStopNarration = () => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }
    setNarrationStatus('idle');
    setNarratingScenario(null);
    currentAudioBufferRef.current = null;
    playbackStartedAtRef.current = 0;
    pausedAtRef.current = 0;
  };

  const playAudio = (buffer: AudioBuffer, offset: number) => {
    const audioCtx = getAudioContext();
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);

    source.onended = () => {
        if (audioSourceRef.current === source) {
            setNarrationStatus('idle');
            pausedAtRef.current = 0;
            playbackStartedAtRef.current = 0;
            audioSourceRef.current = null;
        }
    };
    
    const startOffset = offset % buffer.duration;
    source.start(0, startOffset);
    
    audioSourceRef.current = source;
    currentAudioBufferRef.current = buffer;
    playbackStartedAtRef.current = audioCtx.currentTime - startOffset;
    setNarrationStatus('playing');
  };

  const handleNarrationToggle = async (question: Question) => {
    const isSameQuestion = narratingScenario === question.scenario;

    // Case 1: Toggling play/pause on the currently loaded track
    if (isSameQuestion) {
        if (narrationStatus === 'playing') {
            if (audioSourceRef.current && audioContextRef.current) {
                pausedAtRef.current = audioContextRef.current.currentTime - playbackStartedAtRef.current;
                audioSourceRef.current.stop();
                audioSourceRef.current = null;
                setNarrationStatus('paused');
            }
            return;
        }
        if (narrationStatus === 'paused') {
            if (currentAudioBufferRef.current) {
                playAudio(currentAudioBufferRef.current, pausedAtRef.current);
            }
            return;
        }
    }

    // Case 2: Playing a new track (or re-playing a finished one)
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
    }

    setNarratingScenario(question.scenario);
    setNarrationStatus('loading');
    pausedAtRef.current = 0;
    
    try {
        let audioBuffer: AudioBuffer | null = null;
        
        // 1. Check in-memory cache
        if (audioCacheRef.current.has(question.scenario)) {
            audioBuffer = audioCacheRef.current.get(question.scenario)!;
        } 
        // 2. Check persistent cache (IndexedDB)
        else {
            const cachedData = await getNarration(question.scenario);
            if (cachedData) {
                const audioCtx = getAudioContext();
                const audioBytes = new Uint8Array(cachedData);
                audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
                audioCacheRef.current.set(question.scenario, audioBuffer); // Populate memory cache
            }
        }

        // 3. Fetch from API if not found in caches
        if (!audioBuffer) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const textToNarrate = `Scenario: ${question.scenario}. Answer: ${question.answer}`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: textToNarrate }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data received.");

            const decodedBytes = decode(base64Audio);
            await saveNarration(question.scenario, decodedBytes.buffer);

            const audioCtx = getAudioContext();
            audioBuffer = await decodeAudioData(decodedBytes, audioCtx, 24000, 1);
            audioCacheRef.current.set(question.scenario, audioBuffer);
        }

        // 4. Play the buffer
        if (audioBuffer) {
            playAudio(audioBuffer, 0);
        } else {
            throw new Error("Could not obtain audio buffer.");
        }

    } catch (error) {
        console.error("Narration failed:", error);
        handleStopNarration(); // Full reset on error
    }
  };


  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem('ultrasoundFavorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse favorites from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ultrasoundFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (scenario: string) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(scenario)) {
        return prevFavorites.filter(s => s !== scenario);
      } else {
        return [...prevFavorites, scenario];
      }
    });
  };
  
  const allQuestions = useMemo<Question[]>(() => categories.flatMap(c => c.questions), []);
  
  const favoriteQuestions = useMemo<Question[]>(() => 
    allQuestions.filter(q => favorites.includes(q.scenario)),
    [allQuestions, favorites]
  );
  
  const activeCategoryContent = useMemo<{ title: string, questions: Question[] } | undefined>(() => {
    if (activeCategoryTitle === 'Favorites') {
      return { title: 'Favorites', questions: favoriteQuestions };
    }
    return categories.find(cat => cat.title === activeCategoryTitle);
  }, [activeCategoryTitle, categories, favoriteQuestions]);

  const tabs = ['Favorites', ...categoryTitles];

  return (
    <div className="font-sans min-h-screen">
      
      <header className="sticky top-0 z-10 bg-[var(--color-bg-surface)] bg-opacity-50 backdrop-blur-lg border-b border-[var(--color-border-base)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative py-6 text-center">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-[var(--color-gold-rich)] sm:text-5xl">
              Ultrasound Scenario Explainer
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              Interactive Q&A for Ultrasound Principles
            </p>
            <div className="absolute top-1/2 right-0 -translate-y-1/2">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] hover:bg-[var(--color-bg-surface-light)] transition-colors duration-200"
                    aria-label="Open settings panel"
                >
                    <SettingsIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
          <CategoryTabs
            categories={tabs}
            activeCategory={activeCategoryTitle}
            onSelectCategory={setActiveCategoryTitle}
            favoritesCount={favoriteQuestions.length}
          />
        </div>
      </header>

      {isSettingsOpen && (
          <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} aria-hidden="true"></div>
            
            <div 
              className="absolute top-20 right-4 w-full max-w-xs p-6 bg-[var(--color-bg-surface)] bg-opacity-80 backdrop-blur-xl rounded-2xl border border-[var(--color-border-base)] shadow-2xl animate-section-enter"
              style={{ boxShadow: `0 8px 30px ${'var(--color-primary-accent-glow)'}` }}
            >
              <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">Settings</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 -m-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] rounded-full hover:bg-[var(--color-bg-surface-light)] transition-colors" aria-label="Close settings">
                      <CloseIcon className="h-5 w-5" />
                  </button>
              </div>
              <div className="mt-6">
                  <label className="text-sm font-medium text-[var(--color-text-muted)]">Theme</label>
                  <ThemeSwitcher theme={theme} setTheme={setTheme} />
              </div>
            </div>
          </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeCategoryContent ? (
          <>
            {activeCategoryContent.questions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeCategoryContent.questions.map((q, index) => (
                   <div key={`${activeCategoryContent.title}-${q.scenario}`} className="animate-section-enter" style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}>
                    <QuestionCard 
                      question={q}
                      isFavorite={favorites.includes(q.scenario)}
                      onToggleFavorite={handleToggleFavorite}
                      onPlayNarration={() => handleNarrationToggle(q)}
                      narrationStatus={narratingScenario === q.scenario ? narrationStatus : 'idle'}
                    />
                  </div>
                ))}
              </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-[var(--color-bg-surface)] bg-opacity-60 border border-[var(--color-border-base)] rounded-2xl shadow-lg backdrop-blur-md animate-section-enter" style={{ boxShadow: `0 8px 30px ${'var(--color-primary-accent-glow)'}` }}>
                    <svg className="mx-auto h-12 w-12 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-[var(--color-text-heading)]">No Favorites Yet</h3>
                    <p className="mt-1 text-[var(--color-text-muted)]">
                        {activeCategoryTitle === 'Favorites' 
                        ? "You haven't marked any questions as favorites yet. Click the star on a question to add it here!"
                        : `No questions found for ${activeCategoryTitle}.`
                        }
                    </p>
                </div>
            )}
          </>
        ) : (
          <p className="text-center text-[var(--color-text-muted)]">Please select a category.</p>
        )}
      </main>

      <footer className="text-center py-8 text-sm text-[var(--color-text-muted)] opacity-60">
        <p>&copy; {new Date().getFullYear()} Ultrasound Physics Explainer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
