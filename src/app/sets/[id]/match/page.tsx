import { notFound } from 'next/navigation';
import { getStudySetById } from '@/lib/actions/study-sets';
import { MatchGame } from '@/components/match/MatchGame';
import { ImmersiveLayout } from '@/components/layout/ImmersiveLayout';

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet || !studySet.flashcards || studySet.flashcards.length < 4) {
    notFound();
  }
  
  return (
    <ImmersiveLayout setId={id} exitLabel="Back to set">
      <MatchGame 
        flashcards={studySet.flashcards} 
        setTitle={studySet.title}
      />
    </ImmersiveLayout>
  );
}
