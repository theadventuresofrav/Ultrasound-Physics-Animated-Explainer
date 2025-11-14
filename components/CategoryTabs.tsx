import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  favoritesCount: number;
}

const StarIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);


const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelectCategory, favoritesCount }) => {
  return (
    <div className="pb-4 overflow-x-auto">
      <nav className="flex space-x-2" aria-label="Tabs">
        {categories.map((category) => {
          const isFavoritesTab = category === 'Favorites';
          const isActive = activeCategory === category;
          const activeClasses = "border-2 border-[var(--color-primary-accent)] bg-[var(--color-primary-accent-glow)] text-[var(--color-text-heading)]";
          const inactiveClasses = "border-2 border-[var(--color-border-base)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-surface)] bg-opacity-70 text-[var(--color-text-muted)] hover:text-[var(--color-text-base)]";
          
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`${
                isActive ? activeClasses : inactiveClasses
              } flex-shrink-0 flex justify-center items-center gap-2 whitespace-nowrap py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary-accent)]`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isFavoritesTab && <StarIcon className={`h-4 w-4 ${isActive ? 'text-[var(--color-primary-accent-light)]' : 'text-[var(--color-gold-rich)]'}`} />}
              <span>{category}</span>
              {isFavoritesTab && favoritesCount > 0 && (
                <span className={`ml-1 text-xs font-bold rounded-full px-2 py-0.5 ${isActive ? 'bg-black/20 text-white' : 'bg-[var(--color-gold-rich)] text-black'}`}>{favoritesCount}</span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  );
};

export default CategoryTabs;