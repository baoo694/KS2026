import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers, GraduationCap, ClipboardCheck, Puzzle, Pencil } from 'lucide-react';
import { getStudySetById } from '@/lib/actions/study-sets';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface SetPageProps {
  params: Promise<{ id: string }>;
}

export default async function SetPage({ params }: SetPageProps) {
  const { id } = await params;
  const studySet = await getStudySetById(id);
  
  if (!studySet) {
    notFound();
  }
  
  const cardCount = studySet.flashcards?.length || 0;
  
  const modes = [
    { 
      href: `/sets/${id}/flashcards`, 
      icon: Layers, 
      title: 'Flashcards', 
      description: 'Study with classic flip cards',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    { 
      href: `/sets/${id}/learn`, 
      icon: GraduationCap, 
      title: 'Learn', 
      description: 'Multiple choice with spaced repetition',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    { 
      href: `/sets/${id}/test`, 
      icon: ClipboardCheck, 
      title: 'Test', 
      description: 'Generate a practice exam',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
    },
    { 
      href: `/sets/${id}/match`, 
      icon: Puzzle, 
      title: 'Match', 
      description: 'Race to match terms and definitions',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];
  
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link 
        href="/sets" 
        className="inline-flex items-center text-sm text-slate-600 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sets
      </Link>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{studySet.title}</h1>
          {studySet.description && (
            <p className="mt-2 text-slate-600">{studySet.description}</p>
          )}
          <p className="mt-2 text-sm text-slate-500">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </p>
        </div>
        <Link href={`/sets/${id}/edit`}>
          <Button variant="secondary">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Set
          </Button>
        </Link>
      </div>
      
      {/* Study Modes Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <Card variant="interactive" className={`h-full ${mode.bgColor}`}>
              <CardContent className="flex items-center gap-4 py-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} shadow-lg`}>
                  <mode.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{mode.title}</h2>
                  <p className="text-sm text-slate-600">{mode.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Preview Cards */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Terms in this set ({cardCount})
        </h2>
        <div className="space-y-3">
          {studySet.flashcards?.slice(0, 6).map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="grid sm:grid-cols-2 gap-4 py-4">
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Term</span>
                  <p className="mt-1 text-slate-900">{card.term}</p>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Definition</span>
                  <p className="mt-1 text-slate-600">{card.definition}</p>
                </div>
              </CardContent>
            </Card>
          ))}
          {cardCount > 6 && (
            <p className="text-center text-sm text-slate-500 py-2">
              ...and {cardCount - 6} more cards
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
