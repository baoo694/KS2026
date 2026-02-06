'use server';

import { createClient } from '@/lib/supabase/server';
import { SavedTestResult, SaveTestResultInput, TestAnswerDetail } from '@/types';
import { revalidatePath } from 'next/cache';

// ============================================================================
// Test Results Actions
// ============================================================================

/**
 * Save a completed test result with full answer details
 */
export async function saveTestResult(
  input: SaveTestResultInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  const { data, error } = await supabase
    .from('test_results')
    .insert({
      user_id: user.id,
      study_set_id: input.study_set_id,
      score: input.score,
      total_questions: input.total_questions,
      percentage: input.percentage,
      question_types: input.question_types,
      answers: input.answers,
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error saving test result:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/progress');
  revalidatePath(`/sets/${input.study_set_id}`);
  
  return { success: true, id: data.id };
}

/**
 * Get test history, optionally filtered by study set
 */
export async function getTestHistory(
  studySetId?: string,
  limit: number = 20
): Promise<SavedTestResult[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  let query = supabase
    .from('test_results')
    .select(`
      *,
      study_set:study_sets(title)
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(limit);
  
  if (studySetId) {
    query = query.eq('study_set_id', studySetId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching test history:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get a single test result by ID for detailed review
 */
export async function getTestResultById(
  id: string
): Promise<SavedTestResult | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('test_results')
    .select(`
      *,
      study_set:study_sets(title)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching test result:', error);
    return null;
  }
  
  return data;
}

/**
 * Delete a test result
 */
export async function deleteTestResult(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  const { error } = await supabase
    .from('test_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error deleting test result:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/progress');
  
  return { success: true };
}

/**
 * Get test statistics for a user
 */
export async function getTestStats(): Promise<{
  totalTests: number;
  averageScore: number;
  bestScore: number;
  recentTests: SavedTestResult[];
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { totalTests: 0, averageScore: 0, bestScore: 0, recentTests: [] };
  }
  
  const { data, error } = await supabase
    .from('test_results')
    .select(`
      *,
      study_set:study_sets(title)
    `)
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });
  
  if (error || !data || data.length === 0) {
    return { totalTests: 0, averageScore: 0, bestScore: 0, recentTests: [] };
  }
  
  const totalTests = data.length;
  const averageScore = Math.round(
    data.reduce((sum, t) => sum + t.percentage, 0) / totalTests
  );
  const bestScore = Math.max(...data.map(t => t.percentage));
  const recentTests = data.slice(0, 5);
  
  return { totalTests, averageScore, bestScore, recentTests };
}
