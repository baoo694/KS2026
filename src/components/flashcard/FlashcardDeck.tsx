'use client';

import { useState, useCallback, useEffect } from 'react';
import { Flashcard } from '@/types';
import { FlashcardItem } from './FlashcardItem';
import { FlashcardControls } from './FlashcardControls';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useFlashcardKeyboard } from '@/lib/hooks/useKeyboard';
import { shuffle } from '@/lib/utils/shuffle';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  setTitle: string;
}

export function FlashcardDeck({ flashcards: initialCards, setTitle }: FlashcardDeckProps) {
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  
  const currentCard = cards[currentIndex];
  
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
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, cards.length]);
  
  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => {
      if (!prev) {
        // Shuffle the cards
        setCards(shuffle(initialCards));
      } else {
        // Restore original order
        setCards(initialCards);
      }
      setCurrentIndex(0);
      setIsFlipped(false);
      return !prev;
    });
  }, [initialCards]);
  
  // Reset when initialCards change
  useEffect(() => {
    setCards(isShuffled ? shuffle(initialCards) : initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [initialCards, isShuffled]);
  
  // Keyboard shortcuts
  useFlashcardKeyboard(flipCard, goToPrevious, goToNext);
  
  // Check if on touch device
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
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
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900">{setTitle}</h1>
        <div className="mt-2 sm:mt-4">
          <ProgressBar current={currentIndex + 1} total={cards.length} />
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
      
      {/* Controls */}
      <FlashcardControls
        currentIndex={currentIndex}
        totalCards={cards.length}
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
