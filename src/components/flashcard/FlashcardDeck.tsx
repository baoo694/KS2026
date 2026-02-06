'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { FlashcardWithProgress } from '@/types';
import { FlashcardItem } from './FlashcardItem';
import { FlashcardControls } from './FlashcardControls';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useFlashcardKeyboard } from '@/lib/hooks/useKeyboard';
import { shuffle } from '@/lib/utils/shuffle';
import { markFlashcardStatus, resetUserProgressForSet } from '@/lib/actions/progress';
import { X, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FlashcardDeckProps {
  flashcards: FlashcardWithProgress[];
  setTitle: string;
  studySetId: string;
}

export function FlashcardDeck({ 
  flashcards: initialCards, 
  setTitle, 
  studySetId 
}: FlashcardDeckProps) {
  // All cards (for reference, stats, and reset)
  const [allCards, setAllCards] = useState(initialCards);
  
  // Active deck: cards that are not mastered (includes "new" and "learning")
  const [activeDeck, setActiveDeck] = useState<FlashcardWithProgress[]>(() =>
    initialCards.filter(card => 
      !card.user_progress || card.user_progress.status !== 'mastered'
    )
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Progress stats: New, Learning, Mastered
  const masteredCount = allCards.filter(c => c.user_progress?.status === 'mastered').length;
  const learningCount = allCards.filter(c => c.user_progress?.status === 'learning').length;
  const newCount = allCards.filter(c => !c.user_progress || c.user_progress.status === 'new').length;
  
  const currentCard = activeDeck[currentIndex];
  
  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);
  
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  const goToNext = useCallback(() => {
    if (currentIndex < activeDeck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, activeDeck.length]);
  
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      if (!prev) {
        setActiveDeck(shuffle([...activeDeck]));
      } else {
        // Restore order based on original
        const learningIds = new Set(activeDeck.map(c => c.id));
        setActiveDeck(allCards.filter(c => learningIds.has(c.id)));
      }
      setCurrentIndex(0);
      setIsFlipped(false);
      return !prev;
    });
  }, [activeDeck, allCards]);
  
  // Handle marking card as "Đang học" (Still Learning)
  const handleMarkLearning = useCallback(() => {
    if (!currentCard) return;
    
    startTransition(async () => {
      await markFlashcardStatus(currentCard.id, 'learning');
      
      // Update allCards state to reflect the new status
      setAllCards(prev => prev.map(c => 
        c.id === currentCard.id 
          ? { 
              ...c, 
              user_progress: {
                ...c.user_progress,
                id: c.user_progress?.id || '',
                user_id: c.user_progress?.user_id || '',
                flashcard_id: c.id,
                status: 'learning' as const,
                correct_count: c.user_progress?.correct_count || 0,
                incorrect_count: c.user_progress?.incorrect_count || 0,
                last_studied_at: new Date().toISOString(),
                created_at: c.user_progress?.created_at || new Date().toISOString(),
              }
            } 
          : c
      ));
      
      // Also update activeDeck with the new progress
      setActiveDeck(prev => prev.map(c => 
        c.id === currentCard.id 
          ? { 
              ...c, 
              user_progress: {
                ...c.user_progress,
                id: c.user_progress?.id || '',
                user_id: c.user_progress?.user_id || '',
                flashcard_id: c.id,
                status: 'learning' as const,
                correct_count: c.user_progress?.correct_count || 0,
                incorrect_count: c.user_progress?.incorrect_count || 0,
                last_studied_at: new Date().toISOString(),
                created_at: c.user_progress?.created_at || new Date().toISOString(),
              }
            } 
          : c
      ));
      
      // Move to next card
      setIsFlipped(false);
      if (currentIndex < activeDeck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    });
  }, [currentCard, currentIndex, activeDeck.length]);
  
  // Handle marking card as "Đã biết" (Mastered)
  const handleMarkMastered = useCallback(() => {
    if (!currentCard) return;
    
    startTransition(async () => {
      await markFlashcardStatus(currentCard.id, 'mastered');
      
      // Update allCards state to reflect the new status
      setAllCards(prev => prev.map(c => 
        c.id === currentCard.id 
          ? { 
              ...c, 
              user_progress: {
                ...c.user_progress,
                id: c.user_progress?.id || '',
                user_id: c.user_progress?.user_id || '',
                flashcard_id: c.id,
                status: 'mastered' as const,
                correct_count: c.user_progress?.correct_count || 0,
                incorrect_count: c.user_progress?.incorrect_count || 0,
                last_studied_at: new Date().toISOString(),
                created_at: c.user_progress?.created_at || new Date().toISOString(),
              }
            } 
          : c
      ));
      
      // Remove card from active deck
      setActiveDeck(prev => prev.filter(c => c.id !== currentCard.id));
      setIsFlipped(false);
      
      // Adjust index if needed
      if (currentIndex >= activeDeck.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    });
  }, [currentCard, currentIndex, activeDeck.length]);
  
  // Handle reset progress
  const handleReset = useCallback(() => {
    startTransition(async () => {
      await resetUserProgressForSet(studySetId);
      
      // Reset all cards back to "new" (no progress)
      const resetCards = allCards.map(c => ({ ...c, user_progress: null }));
      setAllCards(resetCards);
      setActiveDeck(resetCards);
      setCurrentIndex(0);
      setIsFlipped(false);
    });
  }, [studySetId, allCards]);
  
  // Keyboard shortcuts
  useFlashcardKeyboard(flipCard, goToPrevious, goToNext);
  
  // Check if on touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
  // Completion state: all cards mastered
  if (activeDeck.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Hoàn thành!</h2>
          <p className="text-slate-600">
            Bạn đã thuộc tất cả {allCards.length} thẻ
          </p>
        </div>
        <Button onClick={handleReset} disabled={isPending} variant="primary">
          <RotateCcw className="h-4 w-4 mr-2" />
          Học lại từ đầu
        </Button>
      </div>
    );
  }
  
  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No flashcards in this set</p>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4 sm:gap-6">
      {/* Title & Progress */}
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{setTitle}</h1>
          <Button 
            variant="ghost" 
            onClick={handleReset} 
            disabled={isPending || masteredCount === 0}
            className="text-xs px-2 py-1"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Học lại
          </Button>
        </div>
        
        {/* Progress Stats */}
        <div className="flex justify-center gap-4 text-sm mb-2">
          <span className="text-blue-600 font-medium">
            🆕 {newCount} mới
          </span>
          <span className="text-amber-600 font-medium">
            📚 {learningCount} đang học
          </span>
          <span className="text-emerald-600 font-medium">
            ✅ {masteredCount} đã biết
          </span>
        </div>
        
        <div className="mt-2 sm:mt-4">
          <ProgressBar current={masteredCount} total={allCards.length} />
        </div>
      </div>
      
      {/* Card */}
      <div className="flex justify-center w-full flex-1 min-h-0">
        <FlashcardItem
          term={currentCard.term}
          definition={currentCard.definition}
          isFlipped={isFlipped}
          onFlip={flipCard}
        />
      </div>
      
      {/* Classification Buttons - Only show when flipped */}
      {isFlipped && (
        <div className="flex justify-center gap-4 w-full">
          <Button
            variant="secondary"
            onClick={handleMarkLearning}
            disabled={isPending}
            className="flex-1 max-w-[160px] bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
          >
            <X className="h-5 w-5 mr-2" />
            Đang học
          </Button>
          <Button
            variant="secondary"
            onClick={handleMarkMastered}
            disabled={isPending}
            className="flex-1 max-w-[160px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
          >
            <Check className="h-5 w-5 mr-2" />
            Đã biết
          </Button>
        </div>
      )}
      
      {/* Controls */}
      <FlashcardControls
        currentIndex={currentIndex}
        totalCards={activeDeck.length}
        isShuffled={isShuffled}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onShuffle={toggleShuffle}
      />
      
      {/* Keyboard Hints (hidden on touch devices) */}
      {!isTouchDevice && (
        <div className="flex justify-center gap-4 sm:gap-6 text-xs text-slate-400">
          <span>
            <kbd className="px-2 py-1 rounded bg-slate-100 font-mono">Space</kbd> flip
          </span>
          <span>
            <kbd className="px-2 py-1 rounded bg-slate-100 font-mono">←</kbd>{' '}
            <kbd className="px-2 py-1 rounded bg-slate-100 font-mono">→</kbd> navigate
          </span>
        </div>
      )}
    </div>
  );
}
