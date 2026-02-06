'use client';

import { useState, useCallback, useEffect } from 'react';
import { Flashcard, FlashcardWithProgress, LearnProgress } from '@/types';
import { shuffle, getRandomItemsExcluding } from '@/lib/utils/shuffle';
import { ProgressCircle, ProgressLegend } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { updateUserProgress, getUserProgressForSet, resetUserProgressForSet } from '@/lib/actions/progress';

interface LearnModeProps {
  flashcards: Flashcard[];
  setTitle: string;
  studySetId: string;
}

interface QuestionState {
  card: FlashcardWithProgress;
  options: string[];
  correctIndex: number;
}

export function LearnMode({ flashcards: initialCards, setTitle, studySetId }: LearnModeProps) {
  const [cards, setCards] = useState<FlashcardWithProgress[]>([]);
  const [queue, setQueue] = useState<FlashcardWithProgress[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate progress based on user's personal progress
  const progress: LearnProgress = {
    new: cards.filter(c => !c.user_progress || c.user_progress.status === 'new').length,
    learning: cards.filter(c => c.user_progress?.status === 'learning').length,
    mastered: cards.filter(c => c.user_progress?.status === 'mastered').length,
    total: cards.length,
  };
  
  // Load user's progress on mount
  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true);
      const cardsWithProgress = await getUserProgressForSet(studySetId);
      
      if (cardsWithProgress.length === 0) {
        // Fallback to initial cards if no progress data
        const cardsAsFWP: FlashcardWithProgress[] = initialCards.map(c => ({
          ...c,
          user_progress: null,
        }));
        setCards(cardsAsFWP);
        const initialQueue = shuffle(cardsAsFWP);
        setQueue(initialQueue);
        if (initialQueue.length > 0) {
          generateQuestion(initialQueue[0], cardsAsFWP);
        } else {
          setIsComplete(true);
        }
      } else {
        setCards(cardsWithProgress);
        // Only queue cards that are not mastered
        const notMastered = cardsWithProgress.filter(
          c => !c.user_progress || c.user_progress.status !== 'mastered'
        );
        const initialQueue = shuffle(notMastered);
        setQueue(initialQueue);
        if (initialQueue.length > 0) {
          generateQuestion(initialQueue[0], cardsWithProgress);
        } else {
          setIsComplete(true);
        }
      }
      setIsLoading(false);
    }
    
    loadProgress();
  }, [studySetId, initialCards]);
  
  const generateQuestion = useCallback((card: FlashcardWithProgress, allCards: FlashcardWithProgress[]) => {
    // Get 3 random distractors
    const distractors = getRandomItemsExcluding(
      allCards.map(c => c.definition),
      3,
      [card.definition],
      (a, b) => a === b
    );
    
    // Create options array with correct answer at random position
    const options = shuffle([card.definition, ...distractors]);
    const correctIndex = options.indexOf(card.definition);
    
    setCurrentQuestion({ card, options, correctIndex });
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);
  
  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion?.correctIndex;
    const card = currentQuestion?.card;
    
    if (!card) return;
    
    // Optimistic update: predict new status locally
    const currentCorrectCount = card.user_progress?.correct_count || 0;
    const currentIncorrectCount = card.user_progress?.incorrect_count || 0;
    const isFirstActualTry = !card.user_progress || (currentCorrectCount === 0 && currentIncorrectCount === 0);
    
    let predictedStatus: 'new' | 'learning' | 'mastered';
    if (isCorrect) {
      predictedStatus = (currentCorrectCount + 1 >= 2 || isFirstActualTry) ? 'mastered' : 'learning';
    } else {
      predictedStatus = 'learning';
    }
    
    // Update local state IMMEDIATELY (optimistic update)
    setCards(prev => prev.map(c => 
      c.id === card.id 
        ? { 
            ...c, 
            user_progress: {
              id: c.user_progress?.id || '',
              user_id: c.user_progress?.user_id || '',
              flashcard_id: c.id,
              status: predictedStatus,
              correct_count: currentCorrectCount + (isCorrect ? 1 : 0),
              incorrect_count: currentIncorrectCount + (isCorrect ? 0 : 1),
              last_studied_at: new Date().toISOString(),
              created_at: c.user_progress?.created_at || new Date().toISOString(),
            }
          } 
        : c
    ));
    
    // Fire-and-forget: API call runs in background, don't await
    updateUserProgress(card.id, isCorrect).catch(err => {
      console.error('Failed to sync progress:', err);
      // Could add retry logic or show toast notification here
    });
    
    // Animation delay runs IMMEDIATELY, not after API
    setTimeout(() => {
      const newQueue = queue.slice(1);
      
      if (!isCorrect) {
        // Add card back to queue for later
        const updatedCard = { 
          ...card, 
          user_progress: {
            ...card.user_progress,
            status: 'learning' as const,
          } as typeof card.user_progress
        };
        newQueue.push(updatedCard);
      }
      
      setQueue(newQueue);
      
      if (newQueue.length > 0) {
        generateQuestion(newQueue[0], cards);
      } else {
        setIsComplete(true);
      }
    }, 500);
  };
  
  const handleRestart = async () => {
    // Reset user progress for this set
    await resetUserProgressForSet(studySetId);
    
    // Reset local state
    const resetCards: FlashcardWithProgress[] = cards.map(c => ({
      ...c,
      user_progress: null,
    }));
    const resetQueue = shuffle(resetCards);
    setCards(resetCards);
    setQueue(resetQueue);
    setIsComplete(false);
    if (resetQueue.length > 0) {
      generateQuestion(resetQueue[0], resetCards);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-12 text-slate-500">Loading your progress...</div>;
  }
  
  if (isComplete) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Well done!</h2>
        <p className="text-slate-600">
          You&apos;ve mastered all the cards in this set.
        </p>
        <div className="py-4">
          <ProgressCircle progress={progress} size={140} />
        </div>
        <ProgressLegend progress={progress} />
        <Button onClick={handleRestart} className="mt-6">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset & Study Again
        </Button>
      </div>
    );
  }
  
  if (!currentQuestion) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-7 py-2 sm:py-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {queue.length} cards remaining
        </p>
      </div>
      
      {/* Progress */}
      <div className="flex justify-center gap-6 sm:gap-8 items-center">
        <ProgressCircle progress={progress} size={90} strokeWidth={6} />
        <ProgressLegend progress={progress} />
      </div>
      
      {/* Question Card */}
      <Card className="p-6 sm:p-8 text-center">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Term
        </span>
        <p className="mt-4 text-xl sm:text-2xl font-medium text-slate-900">
          {currentQuestion.card.term}
        </p>
      </Card>
      
      {/* Answer Options */}
      <div className="grid gap-2.5 sm:gap-3">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === currentQuestion.correctIndex;
          
          let className = 'w-full px-3 py-3 sm:px-4 sm:py-4 rounded-xl border-2 text-left transition-all ';
          
          if (showFeedback) {
            if (isCorrect) {
              className += 'border-emerald-500 bg-emerald-50 animate-correct';
            } else if (isSelected && !isCorrect) {
              className += 'border-red-500 bg-red-50 animate-wrong';
            } else {
              className += 'border-slate-200 bg-white opacity-50';
            }
          } else if (isSelected) {
            className += 'border-indigo-500 bg-indigo-50';
          } else {
            className += 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer';
          }
          
          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showFeedback}
              className={className}
            >
              <span className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-slate-900">{option}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
