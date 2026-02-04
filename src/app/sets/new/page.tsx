import { StudySetForm } from '@/components/sets/StudySetForm';

export default function NewSetPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Create a New Study Set</h1>
      <StudySetForm mode="create" />
    </div>
  );
}
