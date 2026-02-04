'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { CSVImporter } from './CSVImporter';
import { createStudySet, updateStudySet } from '@/lib/actions/study-sets';
import { StudySet, FlashcardInput } from '@/types';

interface StudySetFormProps {
  mode: 'create' | 'edit';
  initialData?: StudySet;
}

export function StudySetForm({ mode, initialData }: StudySetFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [flashcards, setFlashcards] = useState<FlashcardInput[]>(
    initialData?.flashcards?.map(fc => ({ term: fc.term, definition: fc.definition })) || 
    [{ term: '', definition: '' }, { term: '', definition: '' }]
  );
  
  const addFlashcard = () => {
    setFlashcards([...flashcards, { term: '', definition: '' }]);
  };
  
  const removeFlashcard = (index: number) => {
    if (flashcards.length <= 2) return;
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };
  
  const updateFlashcard = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...flashcards];
    updated[index][field] = value;
    setFlashcards(updated);
  };
  
  const handleCSVImport = (imported: FlashcardInput[]) => {
    setFlashcards([...flashcards.filter(fc => fc.term || fc.definition), ...imported]);
    setShowCSVImporter(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const validFlashcards = flashcards.filter(fc => fc.term.trim() && fc.definition.trim());
    
    if (!title.trim()) {
      setError('Please enter a title for your study set');
      setIsSubmitting(false);
      return;
    }
    
    if (validFlashcards.length < 2) {
      setError('Please add at least 2 flashcards with both term and definition');
      setIsSubmitting(false);
      return;
    }
    
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      flashcards: validFlashcards,
    };
    
    try {
      if (mode === 'create') {
        const password = prompt('Please enter password to save this set:');
        if (!password) {
          setIsSubmitting(false);
          return;
        }
        const result = await createStudySet(input, password);
        if (result.success && result.id) {
          router.push(`/sets/${result.id}`);
        } else {
          setError(result.error || 'Failed to create study set');
        }
      } else if (initialData) {
        const password = prompt('Please enter password to save this set:');
        if (!password) {
          setIsSubmitting(false);
          return;
        }
        const result = await updateStudySet(initialData.id, input, password);
        if (result.success) {
          router.push(`/sets/${initialData.id}`);
        } else {
          setError(result.error || 'Failed to update study set');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {/* Set Details */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <Input
            label="Title"
            placeholder="Enter a title, like 'Biology Chapter 5'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description (optional)"
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
      
      {/* Flashcards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Flashcards ({flashcards.length})
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowCSVImporter(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        </div>
        
        {showCSVImporter && (
          <CSVImporter
            onImport={handleCSVImport}
            onClose={() => setShowCSVImporter(false)}
          />
        )}
        
        <div className="space-y-4">
          {flashcards.map((fc, index) => (
            <Card key={index} className="relative group">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 pt-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1 grid gap-4 sm:grid-cols-2">
                    <Input
                      placeholder="Enter term"
                      value={fc.term}
                      onChange={(e) => updateFlashcard(index, 'term', e.target.value)}
                    />
                    <Input
                      placeholder="Enter definition"
                      value={fc.definition}
                      onChange={(e) => updateFlashcard(index, 'definition', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFlashcard(index)}
                    disabled={flashcards.length <= 2}
                    className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Remove flashcard"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                  {index + 1}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Button
          type="button"
          variant="secondary"
          onClick={addFlashcard}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Flashcard
        </Button>
      </div>
      
      {/* Submit */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Set' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
