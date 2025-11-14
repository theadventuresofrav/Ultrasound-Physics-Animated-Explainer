import React, { useState } from 'react';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  isFavorite: boolean;
  onToggleFavorite: (scenario: string) => void;
}

const StarIcon: React.FC<{isFavorite: boolean, className?: string}> = ({ isFavorite, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isFavorite, onToggleFavorite }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const uniqueId = React.useMemo(() => `q-${Math.random().toString(36).substr(2, 9)}`, []);

  const handleFavoriteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onToggleFavorite(question.scenario);
  };

  return (
    <div
      className="bg-[var(--color-bg-surface)] bg-opacity-60 border border-[var(--color-border-base)] rounded-2xl shadow-lg backdrop-blur-md overflow-hidden transition-all duration-300 ease-in-out hover:border-[var(--color-border-hover)] focus-within:border-[var(--color-border-hover)]"
      style={{ boxShadow: `0 8px 30px ${'var(--color-primary-accent-glow)'}` }}
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsRevealed(!isRevealed)}
        onKeyPress={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setIsRevealed(!isRevealed)}}
        role="button"
        tabIndex={0}
        aria-expanded={isRevealed}
        aria-controls={uniqueId + '-answer'}
      >
        <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
                <p className="text-xs font-bold text-[var(--color-primary-accent)] uppercase tracking-wider" id={uniqueId}>Scenario</p>
                <p className="mt-2 text-[var(--color-text-heading)] font-medium">{question.scenario}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center justify-start gap-4 pt-1">
                <button
                    onClick={handleFavoriteClick}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleFavoriteClick(e);
                      }
                    }}
                    className={`p-2 -m-2 rounded-full transition-colors duration-200 ${
                    isFavorite ? 'text-[var(--color-gold-rich)] hover:bg-[var(--color-gold-glow)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-gold-rich)] hover:bg-[var(--color-gold-glow)]'
                    }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    tabIndex={0}
                >
                    <StarIcon isFavorite={isFavorite} className="h-6 w-6" />
                </button>
                <div aria-hidden="true" className="flex-grow flex items-end">
                    <ChevronDownIcon className={`h-5 w-5 text-[var(--color-text-muted)] transform transition-transform duration-500 ease-in-out ${isRevealed ? 'rotate-180' : ''}`} />
                </div>
            </div>
        </div>
      </div>
      
      <div
        id={uniqueId + '-answer'}
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          isRevealed ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className={`pt-2 pb-6 px-6 bg-[var(--color-bg-surface-light)] bg-opacity-50 border-t border-[var(--color-border-base)] transition-opacity duration-300 ease-in-out ${isRevealed ? 'opacity-100 delay-200' : 'opacity-0'}`}>
              {question.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden border border-[var(--color-border-base)] bg-black/20">
                  <img 
                    src={question.imageUrl} 
                    alt="Visual explanation" 
                    className="w-full h-auto object-cover" 
                    aria-label={`Visual explanation for: ${question.scenario}`}
                    loading="lazy"
                  />
                </div>
              )}
              <p className="text-xs font-bold text-[var(--color-primary-accent)] uppercase tracking-wider mt-4">Answer</p>
              <p className="mt-2 text-[var(--color-text-base)]">{question.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;