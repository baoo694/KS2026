'use server';

import { createClient } from '@/lib/supabase/server';
import { StudySet, StudySetInput, Flashcard, FlashcardInput } from '@/types';
import { revalidatePath } from 'next/cache';

// ============================================================================
// Study Set Actions
// ============================================================================

export async function getStudySets(): Promise<StudySet[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('study_sets')
    .select(`
      *,
      flashcards:flashcards(count)
    `)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching study sets:', error);
    return [];
  }
  
  return data || [];
}

export async function getStudySetById(id: string): Promise<StudySet | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('study_sets')
    .select(`
      *,
      flashcards:flashcards(*)
    `)
    .eq('id', id)
    .single();
  
  // Sort flashcards by position after fetching
  if (data?.flashcards) {
    data.flashcards.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
  }
  
  if (error) {
    console.error('Error fetching study set:', error);
    return null;
  }
  
  return data;
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'KSPKA';

export async function createStudySet(
  input: StudySetInput,
  adminPassword: string,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (adminPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid admin password' };
  }

  const supabase = await createClient();
  
  // Create the study set
  const { data: studySet, error: setError } = await supabase
    .from('study_sets')
    .insert({
      title: input.title,
      description: input.description || null,
    })
    .select()
    .single();
  
  if (setError) {
    console.error('Error creating study set:', setError);
    return { success: false, error: setError.message };
  }
  
  // Create flashcards if any
  if (input.flashcards.length > 0) {
    const flashcardsToInsert = input.flashcards.map((fc, index) => ({
      study_set_id: studySet.id,
      term: fc.term,
      definition: fc.definition,
      position: index,
      status: 'new' as const,
    }));
    
    const { error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert);
    
    if (cardsError) {
      console.error('Error creating flashcards:', cardsError);
      // Clean up the study set
      await supabase.from('study_sets').delete().eq('id', studySet.id);
      return { success: false, error: cardsError.message };
    }
  }
  
  revalidatePath('/sets');
  revalidatePath(`/sets/${studySet.id}`);
  
  return { success: true, id: studySet.id };
}

export async function updateStudySet(
  id: string,
  input: StudySetInput,
  adminPassword: string,
): Promise<{ success: boolean; error?: string }> {
  if (adminPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid admin password' };
  }

  const supabase = await createClient();
  
  // Update study set metadata
  const { error: setError } = await supabase
    .from('study_sets')
    .update({
      title: input.title,
      description: input.description || null,
    })
    .eq('id', id);
  
  if (setError) {
    console.error('Error updating study set:', setError);
    return { success: false, error: setError.message };
  }
  
  // Delete existing flashcards and recreate
  const { error: deleteError } = await supabase
    .from('flashcards')
    .delete()
    .eq('study_set_id', id);
  
  if (deleteError) {
    console.error('Error deleting flashcards:', deleteError);
    return { success: false, error: deleteError.message };
  }
  
  // Insert new flashcards
  if (input.flashcards.length > 0) {
    const flashcardsToInsert = input.flashcards.map((fc, index) => ({
      study_set_id: id,
      term: fc.term,
      definition: fc.definition,
      position: index,
      status: 'new' as const,
    }));
    
    const { error: insertError } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert);
    
    if (insertError) {
      console.error('Error inserting flashcards:', insertError);
      return { success: false, error: insertError.message };
    }
  }
  
  revalidatePath('/sets');
  revalidatePath(`/sets/${id}`);
  
  return { success: true };
}

export async function deleteStudySet(
  id: string,
  adminPassword: string,
): Promise<{ success: boolean; error?: string }> {
  if (adminPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid admin password' };
  }

  const supabase = await createClient();
  
  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting study set:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/sets');
  
  return { success: true };
}

// ============================================================================
// Flashcard Actions
// ============================================================================

export async function updateFlashcardStatus(
  id: string, 
  status: 'new' | 'learning' | 'mastered'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('flashcards')
    .update({ status })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating flashcard status:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

export async function resetFlashcardStatuses(studySetId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('flashcards')
    .update({ status: 'new' })
    .eq('study_set_id', studySetId);
  
  if (error) {
    console.error('Error resetting flashcard statuses:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath(`/sets/${studySetId}`);
  
  return { success: true };
}

export async function importFlashcardsFromCSV(
  studySetId: string,
  flashcards: FlashcardInput[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = await createClient();
  
  // Get current max position
  const { data: existingCards } = await supabase
    .from('flashcards')
    .select('position')
    .eq('study_set_id', studySetId)
    .order('position', { ascending: false })
    .limit(1);
  
  const startPosition = existingCards?.[0]?.position ?? -1;
  
  const flashcardsToInsert = flashcards.map((fc, index) => ({
    study_set_id: studySetId,
    term: fc.term,
    definition: fc.definition,
    position: startPosition + 1 + index,
    status: 'new' as const,
  }));
  
  const { error } = await supabase
    .from('flashcards')
    .insert(flashcardsToInsert);
  
  if (error) {
    console.error('Error importing flashcards:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath(`/sets/${studySetId}`);
  
  return { success: true, count: flashcards.length };
}
