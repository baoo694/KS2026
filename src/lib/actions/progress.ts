'use server';

import { createClient } from '@/lib/supabase/server';
import { UserFlashcardProgress, FlashcardWithProgress, LearnProgress } from '@/types';
import { revalidatePath } from 'next/cache';

// ============================================================================
// User Flashcard Progress Actions
// ============================================================================

/**
 * Get user's progress for all flashcards in a study set
 * Returns flashcards with their user-specific progress attached
 */
export async function getUserProgressForSet(
  studySetId: string
): Promise<FlashcardWithProgress[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Get flashcards with user's progress via left join
  const { data: flashcards, error: fcError } = await supabase
    .from('flashcards')
    .select('*')
    .eq('study_set_id', studySetId)
    .order('position', { ascending: true });
  
  if (fcError || !flashcards) {
    console.error('Error fetching flashcards:', fcError);
    return [];
  }
  
  // Get user's progress for these flashcards
  const flashcardIds = flashcards.map(fc => fc.id);
  const { data: progressData } = await supabase
    .from('user_flashcard_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('flashcard_id', flashcardIds);
  
  // Create a map for quick lookup
  const progressMap = new Map<string, UserFlashcardProgress>();
  progressData?.forEach(p => progressMap.set(p.flashcard_id, p));
  
  // Attach progress to flashcards
  return flashcards.map(fc => ({
    ...fc,
    user_progress: progressMap.get(fc.id) || null,
  }));
}

/**
 * Update user's progress for a flashcard based on answer correctness
 * Creates progress record if it doesn't exist
 */
export async function updateUserProgress(
  flashcardId: string,
  isCorrect: boolean
): Promise<{ success: boolean; newStatus?: string; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // Check if progress exists
  const { data: existing } = await supabase
    .from('user_flashcard_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('flashcard_id', flashcardId)
    .maybeSingle();
  
  // Calculate new status based on answer
  let newStatus: 'new' | 'learning' | 'mastered';
  let correctCount = existing?.correct_count || 0;
  let incorrectCount = existing?.incorrect_count || 0;
  
  if (isCorrect) {
    correctCount++;
    // Mastered when:
    // 1. First actual try (no prior answers) and answered correctly
    // 2. OR accumulated 2+ correct answers total
    const isFirstActualTry = !existing || (existing.correct_count === 0 && existing.incorrect_count === 0);
    newStatus = correctCount >= 2 || isFirstActualTry ? 'mastered' : 'learning';
  } else {
    incorrectCount++;
    newStatus = 'learning';
  }
  
  if (existing) {
    // Update existing progress
    const { error } = await supabase
      .from('user_flashcard_progress')
      .update({
        status: newStatus,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        last_studied_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    
    if (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Create new progress record
    const { error } = await supabase
      .from('user_flashcard_progress')
      .insert({
        user_id: user.id,
        flashcard_id: flashcardId,
        status: newStatus,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        last_studied_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error creating progress:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: true, newStatus };
}

/**
 * Get overall progress stats across all user's studied sets
 */
export async function getOverallProgress(): Promise<{
  stats: LearnProgress;
  setProgress: Array<{
    study_set_id: string;
    title: string;
    new: number;
    learning: number;
    mastered: number;
    total: number;
  }>;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { stats: { new: 0, learning: 0, mastered: 0, total: 0 }, setProgress: [] };
  
  // Get all user's progress records with flashcard and study_set info
  const { data: progressData } = await supabase
    .from('user_flashcard_progress')
    .select(`
      status,
      flashcard:flashcards!inner(
        id,
        study_set_id,
        study_set:study_sets!inner(id, title)
      )
    `)
    .eq('user_id', user.id);
  
  // Calculate overall stats
  const stats: LearnProgress = { new: 0, learning: 0, mastered: 0, total: 0 };
  const setMap = new Map<string, { title: string; new: number; learning: number; mastered: number; total: number }>();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progressData?.forEach((p: any) => {
    stats.total++;
    if (p.status === 'new') stats.new++;
    else if (p.status === 'learning') stats.learning++;
    else if (p.status === 'mastered') stats.mastered++;
    
    // Group by study set
    const flashcard = p.flashcard;
    if (!flashcard) return;
    
    const setId = flashcard.study_set_id;
    const setTitle = flashcard.study_set?.title || 'Unknown';
    if (!setMap.has(setId)) {
      setMap.set(setId, { title: setTitle, new: 0, learning: 0, mastered: 0, total: 0 });
    }
    const set = setMap.get(setId)!;
    set.total++;
    if (p.status === 'new') set.new++;
    else if (p.status === 'learning') set.learning++;
    else if (p.status === 'mastered') set.mastered++;
  });
  
  const setProgress = Array.from(setMap.entries()).map(([study_set_id, data]) => ({
    study_set_id,
    ...data,
  }));
  
  return { stats, setProgress };
}

/**
 * Reset user's progress for a study set
 */
export async function resetUserProgressForSet(
  studySetId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // Get flashcard IDs for this set
  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id')
    .eq('study_set_id', studySetId);
  
  if (!flashcards || flashcards.length === 0) {
    return { success: true };
  }
  
  const flashcardIds = flashcards.map(fc => fc.id);
  
  // Delete user's progress for these flashcards
  const { error } = await supabase
    .from('user_flashcard_progress')
    .delete()
    .eq('user_id', user.id)
    .in('flashcard_id', flashcardIds);
  
  if (error) {
    console.error('Error resetting progress:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath(`/sets/${studySetId}`);
  revalidatePath('/progress');
  
  return { success: true };
}

// ============================================================================
// Flashcard Classification Actions (for swipe-based learning)
// ============================================================================

/**
 * Directly mark a flashcard's status (learning or mastered)
 * Used when user classifies a card via swipe buttons
 */
export async function markFlashcardStatus(
  flashcardId: string,
  status: 'learning' | 'mastered'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  // Upsert: create if not exists, update if exists
  const { error } = await supabase
    .from('user_flashcard_progress')
    .upsert(
      {
        user_id: user.id,
        flashcard_id: flashcardId,
        status,
        last_studied_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,flashcard_id' }
    );
  
  if (error) {
    console.error('Error marking flashcard status:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Initialize progress for all flashcards in a set
 * Creates 'learning' status for cards that don't have progress yet
 */
export async function initializeProgressForSet(
  studySetId: string
): Promise<{ success: boolean; initialized: number; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, initialized: 0, error: 'Unauthorized' };
  
  // Get all flashcards in the set
  const { data: flashcards } = await supabase
    .from('flashcards')
    .select('id')
    .eq('study_set_id', studySetId);
  
  if (!flashcards || flashcards.length === 0) {
    return { success: true, initialized: 0 };
  }
  
  // Get existing progress for this user
  const flashcardIds = flashcards.map(fc => fc.id);
  const { data: existingProgress } = await supabase
    .from('user_flashcard_progress')
    .select('flashcard_id')
    .eq('user_id', user.id)
    .in('flashcard_id', flashcardIds);
  
  const existingIds = new Set(existingProgress?.map(p => p.flashcard_id) || []);
  
  // Filter to only cards without progress
  const newCards = flashcards.filter(fc => !existingIds.has(fc.id));
  
  if (newCards.length === 0) {
    return { success: true, initialized: 0 };
  }
  
  // Create progress records with 'learning' status
  const progressRecords = newCards.map(fc => ({
    user_id: user.id,
    flashcard_id: fc.id,
    status: 'learning' as const,
    correct_count: 0,
    incorrect_count: 0,
  }));
  
  const { error } = await supabase
    .from('user_flashcard_progress')
    .insert(progressRecords);
  
  if (error) {
    console.error('Error initializing progress:', error);
    return { success: false, initialized: 0, error: error.message };
  }
  
  return { success: true, initialized: newCards.length };
}
