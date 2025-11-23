export interface Question {
  scenario: string;
  answer: string;
  animationUrl?: string;
}

export interface Category {
  title: string;
  questions: Question[];
}