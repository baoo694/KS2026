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
  // ID of the Supabase auth user who created this set
  user_id?: string;
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

// ============================================================================
// User Progress Types (per-user, per-flashcard tracking)
// ============================================================================

export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  status: FlashcardStatus;
  correct_count: number;
  incorrect_count: number;
  last_studied_at: string | null;
  created_at: string;
}

// Extended flashcard with user's personal progress
export interface FlashcardWithProgress extends Flashcard {
  user_progress?: UserFlashcardProgress | null;
}

// ============================================================================
// Saved Test Result Types (persisted to database)
// ============================================================================

export interface TestAnswerDetail {
  questionId: string;
  questionType: QuestionType;
  term: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface SavedTestResult {
  id: string;
  user_id: string;
  study_set_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  question_types: Record<string, number>;
  answers: TestAnswerDetail[];
  completed_at: string;
  // Joined from study_sets table
  study_set?: { title: string };
}

// Input for saving a new test result
export interface SaveTestResultInput {
  study_set_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  question_types: Record<string, number>;
  answers: TestAnswerDetail[];
}

