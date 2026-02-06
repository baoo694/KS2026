import { notFound } from 'next/navigation';
import { FlashcardDeck } from '@/components/flashcard/FlashcardDeck';
import { ImmersiveLayout } from '@/components/layout/ImmersiveLayout';
import { getUserProgressForSet } from '@/lib/actions/progress';
import { getStudySetById } from '@/lib/actions/study-sets';

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet || !studySet.flashcards || studySet.flashcards.length === 0) {
    notFound();
  }
  
  // Cards without progress records are considered "new"
  // Progress is only created when user explicitly marks a card
  
  // Fetch flashcards with user's progress
  const flashcardsWithProgress = await getUserProgressForSet(id);
  
  // Fallback to base flashcards if no progress data (e.g., not logged in)
  const cards = flashcardsWithProgress.length > 0 
    ? flashcardsWithProgress 
    : studySet.flashcards.map(fc => ({ ...fc, user_progress: null }));
  
  return (
    <ImmersiveLayout setId={id} exitLabel="Back to set">
      <FlashcardDeck 
        flashcards={cards} 
        setTitle={studySet.title}
        studySetId={id}
      />
    </ImmersiveLayout>
  );
}
