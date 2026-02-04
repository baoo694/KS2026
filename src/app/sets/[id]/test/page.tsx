import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStudySetById } from '@/lib/actions/study-sets';
import { TestMode } from '@/components/test/TestMode';
import { StudyModeNav } from '@/components/layout/Navigation';

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/sets/${id}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to set
        </Link>
        
        <StudyModeNav setId={id} />
      </div>
      
      {/* Test Mode */}
      <TestMode 
        flashcards={studySet.flashcards} 
        setTitle={studySet.title}
      />
    </div>
  );
}
