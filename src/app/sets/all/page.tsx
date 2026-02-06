import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { getAllStudySets } from '@/lib/actions/study-sets';
import { Button } from '@/components/ui/Button';
import { StudySetCard } from '@/components/sets/StudySetCard';

export const dynamic = 'force-dynamic';

export default async function AllSetsPage() {
  const studySets = await getAllStudySets();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">All Study Sets</h1>
          <p className="mt-1 text-slate-600">
            {studySets.length} {studySets.length === 1 ? 'set' : 'sets'} available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sets">
            <Button variant="secondary" size="md">
              My Sets
            </Button>
          </Link>
        </div>
      </div>

      {/* Sets Grid */}
      {studySets.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studySets.map((set) => (
            <StudySetCard key={set.id} studySet={set} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No study sets available</h3>
          <p className="mt-2 text-slate-600 max-w-sm mx-auto">
            Be the first to create a study set and start sharing knowledge with others.
          </p>
          <Link href="/sets/new" className="mt-6 inline-block">
            <Button>
              Create a Study Set
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

