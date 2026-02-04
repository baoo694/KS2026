'use client';

import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  isShuffled: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

export function FlashcardControls({
  currentIndex,
  totalCards,
  isShuffled,
  onPrevious,
  onNext,
  onShuffle,
}: FlashcardControlsProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCards - 1;
  
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous Button */}
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={isFirst}
        aria-label="Previous card"
        className="w-12 h-12 p-0 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      {/* Card Counter */}
      <div className="flex items-center gap-3 min-w-[140px] justify-center">
        <span className="text-lg font-semibold text-slate-900">
          {currentIndex + 1}
        </span>
        <span className="text-slate-400">/</span>
        <span className="text-lg text-slate-500">
          {totalCards}
        </span>
      </div>
      
      {/* Next Button */}
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={isLast}
        aria-label="Next card"
        className="w-12 h-12 p-0 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Shuffle Toggle */}
      <Button
        variant={isShuffled ? 'primary' : 'ghost'}
        onClick={onShuffle}
        aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
        className="ml-4"
      >
        <Shuffle className="h-4 w-4 mr-2" />
        {isShuffled ? 'Shuffled' : 'Shuffle'}
      </Button>
    </div>
  );
}
