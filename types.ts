export interface Question {
  scenario: string;
  answer: string;
  imageUrl?: string;
}

export interface Category {
  title: string;
  questions: Question[];
}
