// Core Types for Quizlet Clone

export type FlashcardStatus = "new" | "learning" | "mastered";

export interface Flashcard {
  id: string;
  study_set_id: string;
  term: string;
  definition: string;
  status: FlashcardStatus;
  position: number;
  created_at: string;
}

export interface StudySet {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  flashcards?: Flashcard[];
}

// Form types for creating/editing
export interface FlashcardInput {
  term: string;
  definition: string;
}

export interface StudySetInput {
  title: string;
  description?: string;
  flashcards: FlashcardInput[];
}

// Test Mode types
export type QuestionType = "multiple-choice" | "true-false" | "written";

export interface TestConfig {
  questionCount: number;
  questionTypes: QuestionType[];
}

export interface TestQuestion {
  id: string;
  type: QuestionType;
  flashcard: Flashcard;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  isPairCorrect?: boolean; // For true/false
  displayedDefinition?: string; // For true/false
}

export interface TestAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Percentage
  answers: TestAnswer[];
}

// Match Game types
export interface MatchItem {
  id: string;
  flashcardId: string;
  content: string;
  type: "term" | "definition";
  isMatched: boolean;
  isSelected: boolean;
}

export interface MatchGameState {
  items: MatchItem[];
  selectedItem: MatchItem | null;
  matchedPairs: number;
  mistakes: number;
  startTime: number;
  elapsedTime: number;
  penaltyTime: number;
  isComplete: boolean;
}

// Learn Mode types
export interface LearnProgress {
  new: number;
  learning: number;
  mastered: number;
  total: number;
}
