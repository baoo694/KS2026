-- Quizlet Clone Database Schema
-- Run this in your Supabase SQL Editor

-- Study Sets table
CREATE TABLE IF NOT EXISTS study_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id UUID REFERENCES study_sets(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_flashcards_study_set ON flashcards(study_set_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_status ON flashcards(status);
CREATE INDEX IF NOT EXISTS idx_flashcards_position ON flashcards(study_set_id, position);

-- Enable Row Level Security (RLS)
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- For demo purposes, allow all operations (in production, add user-based policies)
CREATE POLICY "Allow all operations on study_sets" ON study_sets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on flashcards" ON flashcards
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_study_sets_updated_at
  BEFORE UPDATE ON study_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
