import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getStudySetById } from '@/lib/actions/study-sets';
import { LearnMode } from '@/components/learn/LearnMode';
import { StudyModeNav } from '@/components/layout/Navigation';

interface LearnPageProps {
  params: Promise<{ id: string }>;
}

export default async function LearnPage({ params }: LearnPageProps) {
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
      
      {/* Learn Mode */}
      <LearnMode 
        flashcards={studySet.flashcards} 
        setTitle={studySet.title}
      />
    </div>
  );
}
