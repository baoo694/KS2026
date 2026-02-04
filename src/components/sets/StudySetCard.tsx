'use client';

import Link from 'next/link';
import { Layers, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudySet } from '@/types';
import { Card } from '@/components/ui/Card';
import { deleteStudySet } from '@/lib/actions/study-sets';

interface StudySetCardProps {
  studySet: StudySet & { flashcards?: { count: number }[] | unknown[] };
}

export function StudySetCard({ studySet }: StudySetCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  // Handle different flashcard count formats from Supabase
  const cardCount = Array.isArray(studySet.flashcards) 
    ? studySet.flashcards.length 
    : 0;
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this study set?')) return;
    
    setIsDeleting(true);
    const result = await deleteStudySet(studySet.id);
    
    if (!result.success) {
      alert('Failed to delete study set: ' + result.error);
      setIsDeleting(false);
    }
    
    router.refresh();
  };
  
  return (
    <Card variant="interactive" className="relative group">
      <Link href={`/sets/${studySet.id}`} className="block p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="font-semibold text-slate-900 truncate">
              {studySet.title}
            </h3>
            {studySet.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {studySet.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
          <span className="text-xs text-slate-400">
            {new Date(studySet.updated_at).toLocaleDateString()}
          </span>
        </div>
      </Link>
      
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>
        
        {isMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsMenuOpen(false)} 
            />
            <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg bg-white shadow-lg border border-slate-200 py-1">
              <Link
                href={`/sets/${studySet.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
