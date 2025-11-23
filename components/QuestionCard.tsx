import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  isFavorite: boolean;
  onToggleFavorite: (scenario: string) => void;
  onPlayNarration: () => void;
  narrationStatus: 'idle' | 'loading' | 'playing' | 'paused';
}

interface RefinedAnswer {
  takeaway: string;
  highlightedAnswer: string;
}

// --- Icons ---
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

const SpeakerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

const LoadingSpinnerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${className}`}>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const ReplayIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-3.181-4.991-3.181-3.183a8.25 8.25 0 0 0-11.664 0l-3.181 3.183" />
    </svg>
);

const LightbulbIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.42 0-2.798-.82-3.535-2.186 1.294-1.292 3.12-2.186 5.285-2.186s4 .894 5.285 2.186c-.737 1.366-2.115 2.186-3.535 2.186ZM12 3.283c.963 0 1.896.223 2.748.641A9.011 9.011 0 0 1 18 10.5c0 1.531-.482 2.952-1.252 4.14M12 3.283S10.237 2.25 9 2.25c-2.485 0-4.5 2.015-4.5 4.5 0 2.028 1.343 3.725 3.208 4.316" />
    </svg>
);

const AnswerSkeleton = () => (
    <div className="space-y-4 pt-4 animate-pulse">
        <div className="h-4 bg-[var(--color-bg-surface-light)] rounded w-1/4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-[var(--color-bg-surface-light)] rounded w-full"></div>
            <div className="h-4 bg-[var(--color-bg-surface-light)] rounded w-5/6"></div>
        </div>
        <div className="h-20 bg-[var(--color-bg-surface-light)] rounded-lg mt-6"></div>
    </div>
);


const QuestionCard: React.FC<QuestionCardProps> = ({ question, isFavorite, onToggleFavorite, onPlayNarration, narrationStatus }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [refinedAnswer, setRefinedAnswer] = useState<RefinedAnswer | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementError, setRefinementError] = useState(false);

  // --- Animation Player State ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);

  const uniqueId = React.useMemo(() => `q-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    const refineAnswer = async () => {
      // Don't fetch if not revealed, or we already have data, or are fetching, or have an error.
      if (!isRevealed || refinedAnswer || isRefining || refinementError) {
        return;
      }

      setIsRefining(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Given the following ultrasound physics question and answer:
        Question: "${question.scenario}"
        Answer: "${question.answer}"

        Please process the answer and return a JSON object with two properties:
        1. "takeaway": A very concise, one-sentence "Key Takeaway" or "Clinical Pearl" summarizing the most important point of the answer.
        2. "highlightedAnswer": The original answer text, but with key technical terms, values, or concepts wrapped in <mark> tags for emphasis.
        
        Return ONLY the raw JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        takeaway: { type: Type.STRING },
                        highlightedAnswer: { type: Type.STRING }
                    },
                    required: ['takeaway', 'highlightedAnswer']
                },
            },
        });
        
        const jsonText = response.text;
        const parsedAnswer: RefinedAnswer = JSON.parse(jsonText);
        setRefinedAnswer(parsedAnswer);

      } catch (error) {
        console.error("Failed to refine answer:", error);
        setRefinementError(true); // Prevent retries on error
      } finally {
        setIsRefining(false);
      }
    };

    refineAnswer();
  }, [isRevealed, question.scenario, question.answer, refinedAnswer, isRefining, refinementError]);

  const handleFavoriteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onToggleFavorite(question.scenario);
  };
  
  const handleNarrationClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onPlayNarration();
  }

  // --- Animation Player Handlers ---
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setHasEnded(false);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (Number(e.target.value) / 100) * duration;
    if (videoRef.current) {
        videoRef.current.currentTime = newTime;
        setProgress(Number(e.target.value));
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    }
  };
  
  const formatTime = (timeInSeconds: number): string => {
      if (isNaN(timeInSeconds) || timeInSeconds === 0) return '0:00';
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
        setIsPlaying(false);
        setHasEnded(true);
    }

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef.current]);


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
            <div className="flex-shrink-0 flex flex-col items-center justify-start gap-3 pt-1">
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
                 <button
                    onClick={handleNarrationClick}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleNarrationClick(e);
                        }
                    }}
                    disabled={narrationStatus === 'loading'}
                    className="p-2 -m-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary-accent-light)] hover:bg-[var(--color-primary-accent-glow)] disabled:opacity-50 disabled:pointer-events-none transition-all"
                    aria-label={
                        narrationStatus === 'loading' ? 'Loading narration...' :
                        narrationStatus === 'playing' ? 'Pause narration' :
                        narrationStatus === 'paused' ? 'Resume narration' :
                        'Narrate question and answer'
                    }
                >
                    {narrationStatus === 'loading' && <LoadingSpinnerIcon className="h-5 w-5" />}
                    {narrationStatus === 'playing' && <PauseIcon className="h-5 w-5 text-[var(--color-primary-accent-light)]" />}
                    {narrationStatus === 'paused' && <PlayIcon className="h-5 w-5 text-[var(--color-primary-accent-light)]" />}
                    {narrationStatus === 'idle' && <SpeakerIcon className="h-5 w-5" />}
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
              {question.animationUrl && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-[var(--color-border-base)] bg-black/20">
                      <video
                          ref={videoRef}
                          src={question.animationUrl}
                          className="w-full h-auto object-cover"
                          aria-label={`Animation for: ${question.scenario}`}
                          playsInline
                          loop={false}
                          muted // Best practice for autoplay, though we control it manually
                      />
                      <div className="p-3 bg-black/30 backdrop-blur-sm space-y-2">
                          {/* -- Seek Bar -- */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white/70 w-9 text-center">{formatTime(videoRef.current?.currentTime || 0)}</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={handleProgressChange}
                              className="w-full h-2 rounded-lg appearance-none cursor-pointer animation-slider"
                              aria-label="Animation progress"
                            />
                             <span className="text-xs font-mono text-white/70 w-9 text-center">{formatTime(duration)}</span>
                          </div>
                          {/* -- Controls -- */}
                          <div className="flex justify-between items-center">
                              <button 
                                onClick={hasEnded ? handleReplay : togglePlayPause}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                aria-label={hasEnded ? "Replay" : isPlaying ? "Pause" : "Play"}
                              >
                                {hasEnded ? <ReplayIcon className="w-5 h-5" /> : (isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />)}
                              </button>
                              <div className="flex items-center gap-1">
                                  {[0.5, 1, 1.5, 2].map(rate => (
                                      <button
                                          key={rate}
                                          onClick={() => changePlaybackRate(rate)}
                                          className={`px-2 py-0.5 text-xs font-semibold rounded-md transition-colors ${playbackRate === rate ? 'bg-[var(--color-primary-accent)] text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                          aria-pressed={playbackRate === rate}
                                      >
                                          {rate}x
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
              
              {isRefining ? (
                <AnswerSkeleton />
              ) : (
                <>
                  <p className="text-xs font-bold text-[var(--color-primary-accent)] uppercase tracking-wider mt-4">Answer</p>
                  <p 
                    className="mt-2 text-[var(--color-text-base)]"
                    dangerouslySetInnerHTML={{ __html: refinedAnswer?.highlightedAnswer || question.answer }}
                  />
                  
                  {refinedAnswer && (
                     <div className="mt-6 p-4 rounded-xl bg-[var(--color-primary-accent-glow)] border border-[var(--color-primary-accent)]/30">
                        <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-0.5">
                            <LightbulbIcon className="h-5 w-5 text-[var(--color-primary-accent-light)]" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-[var(--color-primary-accent-light)]">Key Takeaway</h4>
                            <p className="mt-1 text-sm text-[var(--color-text-base)]">{refinedAnswer.takeaway}</p>
                        </div>
                        </div>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;