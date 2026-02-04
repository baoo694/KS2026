import { notFound } from 'next/navigation';
import { getStudySetById } from '@/lib/actions/study-sets';
import { FlashcardDeck } from '@/components/flashcard/FlashcardDeck';
import { ImmersiveLayout } from '@/components/layout/ImmersiveLayout';

interface FlashcardsPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet || !studySet.flashcards || studySet.flashcards.length === 0) {
    notFound();
  }
  
  return (
    <ImmersiveLayout setId={id} exitLabel="Back to set">
      <FlashcardDeck 
        flashcards={studySet.flashcards} 
        setTitle={studySet.title}
      />
    </ImmersiveLayout>
  );
}
