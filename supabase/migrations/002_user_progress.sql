-- Migration: User Progress & Test Results
-- Created: 2026-02-06
-- Purpose: Per-user flashcard progress tracking and test result storage

-- ============================================================================
-- User Flashcard Progress Table
-- ============================================================================
-- Tracks each user's progress on individual flashcards
-- Allows multiple users to study the same flashcard set with separate progress

CREATE TABLE IF NOT EXISTS user_flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_studied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Each user can only have one progress record per flashcard
  UNIQUE(user_id, flashcard_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_flashcard ON user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_flashcard_progress(user_id, status);

-- ============================================================================
-- Test Results Table
-- ============================================================================
-- Stores complete test history with full answer details

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  -- Question type breakdown: {"multiple-choice": 5, "true-false": 3, "written": 2}
  question_types JSONB NOT NULL DEFAULT '{}',
  -- Full answer details array:
  -- [{
  --   "questionId": "uuid",
  --   "questionType": "multiple-choice",
  --   "term": "Hello",
  --   "correctAnswer": "Xin chào",
  --   "userAnswer": "Xin chào",
  --   "isCorrect": true
  -- }]
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_set ON test_results(study_set_id);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(user_id, completed_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
-- Ensure users can only access their own data

ALTER TABLE user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- User Flashcard Progress: Users can only CRUD their own progress
CREATE POLICY "Users can view own progress" 
  ON user_flashcard_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
  ON user_flashcard_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON user_flashcard_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" 
  ON user_flashcard_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Test Results: Users can only CRUD their own test results
CREATE POLICY "Users can view own test results" 
  ON test_results FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own test results" 
  ON test_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own test results" 
  ON test_results FOR DELETE 
  USING (auth.uid() = user_id);
