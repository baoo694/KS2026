import { notFound } from 'next/navigation';
import { getStudySetById } from '@/lib/actions/study-sets';
import { TestMode } from '@/components/test/TestMode';
import { ImmersiveLayout } from '@/components/layout/ImmersiveLayout';

interface TestPageProps {
  params: Promise<{ id: string }>;
}

export default async function TestPage({ params }: TestPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet || !studySet.flashcards || studySet.flashcards.length < 4) {
    notFound();
  }
  
  return (
    <ImmersiveLayout setId={id} exitLabel="Back to set">
      <TestMode 
        flashcards={studySet.flashcards} 
        setTitle={studySet.title}
        studySetId={id}
      />
    </ImmersiveLayout>
  );
}
