import { notFound } from 'next/navigation';
import { getStudySetById } from '@/lib/actions/study-sets';
import { StudySetForm } from '@/components/sets/StudySetForm';

interface EditSetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSetPage({ params }: EditSetPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet) {
    notFound();
  }
  
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Edit Study Set</h1>
      <StudySetForm mode="edit" initialData={studySet} />
    </div>
  );
}
