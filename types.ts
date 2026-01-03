
export type DemoId = 'waves' | 'transducers' | 'doppler' | 'pulsed' | 'artifacts' | 'safety' | 'hemodynamics' | 'qa' | 'resolution' | 'harmonics' | 'tgc' | 'dynamic_range' | 'processing' | 'study_guide' | 'contrast_agents' | 'elastography' | '3d_4d' | 'advanced_artifacts' | 'knobology' | 'biomedical_physics' | 'abdominal' | 'vascular' | 'msk' | 'cardiac' | 'jeopardy' | 'spi_mock_exam' | 'clinical_case_simulator' | 'ai_history' | 'ai_academy';

export type Theme = 'Classic' | 'Neon';

export interface CourseModuleData {
  id: DemoId;
  status: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  hasWaveAnimation?: boolean;
}

export interface SimulationMedium {
    id: string;
    name: string;
    speed: number; // m/s
    impedance: number; // MRayls
    attenuation: number; // dB/cm/MHz
    color: string;
}

export interface VaultedMnemonic {
    id: string;
    topic: string;
    content: string;
    timestamp: number;
}

export interface DailyInsight {
    text: string;
    timestamp: number;
}

export interface SRSCard {
  id: string;
  term: string;
  definition: string;
  frontImage?: string;
  backImage?: string;
  level: number;
  lastReviewed: number | null;
  nextReview: number;
}

export interface UserResource {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
  size: string;
  timestamp: number;
  category: 'PDF' | 'Image' | 'Document' | 'Other';
}

export interface PodcastEpisode {
    id: string;
    title: string;
    duration: string;
    description: string;
    link: string;
    isNew: boolean;
    embedSrc: string;
}

export interface SystemOverrides {
    podcasts?: PodcastEpisode[];
    flashcards?: Partial<AIFlashcard>[]; // Map by index or ID to override defaults
    systemLogo?: string;
    customMedia?: SimulationMedium[];
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface StudyTask {
  id: string;
  text: string;
  isCompleted: boolean;
  priority: Priority;
}

export interface UserProfile {
  name: string;
  joinDate: number;
  lastActiveModule: DemoId | null;
  completedModules: DemoId[];
  quizScores: {
    spi?: number;
    spiMockExam?: number;
  };
  achievements: string[];
  flashcardDecks: {
    [deckId: string]: SRSCard[];
  };
  studyTasks: StudyTask[];
  userResources: UserResource[];
  notes: { [sectionId: string]: string };
  learningStyle: LearningStyle | null;
  studyPath: AIStudyPath | null;
  hasCompletedOnboarding: boolean;
  theme: Theme;
  isAdmin: boolean;
  systemOverrides: SystemOverrides;
  mnemonicVault: VaultedMnemonic[];
  dailyInsight: DailyInsight | null;
  currentExamState: any;
  cachedExamReport: any;
}

export interface AIQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AIFlashcard {
  term: string;
  definition: string;
  frontImage?: string;
  backImage?: string;
}

export interface StudyPlanWeek {
  week: string;
  title: string;
  keyConcepts: string[];
  recommendedModuleIds: DemoId[];
  milestone: string;
  visualSuggestion: string;
  auditorySuggestion: string;
  readingWritingSuggestion: string;
  kinestheticSuggestion: string;
}

export type LearningStyle = 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic' | 'Multimodal';

export interface AIStudyPath {
  summary: string;
  learningStyle: LearningStyle;
  weeklyPlan: StudyPlanWeek[];
}

export interface AIStudyPlanWeakArea {
  concept: string;
  explanation: string;
  recommendedModules?: string[];
  keyTakeaway: string;
}

export interface AIStudyPlan {
  summary: string;
  weakAreas: AIStudyPlanWeakArea[];
}

export interface ClinicalCase {
  id: string;
  title: string;
  history: string;
  scanAreas: {
    id: string;
    name: string;
    imagePrompt: string;
    correctFindings: string[];
  }[];
  allFindings: string[];
  correctDiagnosis: string;
  feedbackPrompt: string;
}

export type AIHistoryItemType = 
  | 'studyPath' 
  | 'flashcards' 
  | 'chat' 
  | 'essayQuestion' 
  | 'definition' 
  | 'simplification' 
  | 'examReview' 
  | 'clinicalImage' 
  | 'clinicalFeedback'
  | 'aiLecture';

export interface AIHistoryItem {
  id: string;
  timestamp: number;
  type: AIHistoryItemType;
  content: any;
  context?: string;
}
