import React, { useState, useMemo, useEffect } from 'react';
import { categories } from './data/questions';
import CategoryTabs from './components/CategoryTabs';
import QuestionCard from './components/QuestionCard';
import type { Question } from './types';

// --- ThemeSwitcher Component Definition ---
type Theme = 'theme-gold' | 'theme-cosmic' | 'theme-crimson' | 'theme-emerald' | 'theme-sapphire' | 'theme-amethyst' | 'theme-obsidian' | 'theme-sunstone';

const THEMES: { name: Theme, color: string }[] = [
  { name: 'theme-gold', color: 'bg-[#D4AF37]' },
  { name: 'theme-cosmic', color: 'bg-[#06B6D4]' },
  { name: 'theme-crimson', color: 'bg-[#EF4444]' },
  { name: 'theme-emerald', color: 'bg-[#10B981]' }, // Using a representative green
  { name: 'theme-sapphire', color: 'bg-[#2563EB]' },
  { name: 'theme-amethyst', color: 'bg-[#d946ef]' },
  { name: 'theme-obsidian', color: 'bg-[#38bdf8]' },
  { name: 'theme-sunstone', color: 'bg-[#f97316]' },
];

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className="absolute top-4 right-4 z-20 p-1 bg-[var(--color-bg-surface)] bg-opacity-60 backdrop-blur-md rounded-full flex items-center gap-1 border border-[var(--color-border-base)]">
        {THEMES.map(t => (
            <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                className={`w-6 h-6 rounded-full transition-all duration-200 ${t.color} ${theme === t.name ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-surface)] ring-[var(--color-primary-accent-light)]' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                aria-label={`Switch to ${t.name.replace('theme-', '')} theme`}
            />
        ))}
    </div>
  );
};
// --- End ThemeSwitcher ---

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('appTheme') as Theme;
    return THEMES.find(t => t.name === savedTheme) ? savedTheme : 'theme-gold';
  });

  useEffect(() => {
    const root = document.documentElement;
    THEMES.forEach(t => root.classList.remove(t.name));
    root.classList.add(theme);
    localStorage.setItem('appTheme', theme);
  }, [theme]);


  const categoryTitles = useMemo<string[]>(() => categories.map(c => c.title), []);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string>(categories[0].title);
  const [favorites, setFavorites] = useState<string[]>([]);

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
    <div className="font-sans min-h-screen relative">
      <ThemeSwitcher theme={theme} setTheme={setTheme} />
      
      <header className="sticky top-0 z-10 bg-[var(--color-bg-surface)] bg-opacity-50 backdrop-blur-lg border-b border-[var(--color-border-base)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 text-center">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-[var(--color-gold-rich)] sm:text-5xl">
              Ultrasound Scenario Explainer
            </h1>
            <p className="mt-2 text-lg text-[var(--color-text-muted)]">
              Interactive Q&A for Ultrasound Principles
            </p>
          </div>
          <CategoryTabs
            categories={tabs}
            activeCategory={activeCategoryTitle}
            onSelectCategory={setActiveCategoryTitle}
            favoritesCount={favoriteQuestions.length}
          />
        </div>
      </header>

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