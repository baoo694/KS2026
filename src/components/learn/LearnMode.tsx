'use client';

import { useState, useCallback, useEffect } from 'react';
import { Flashcard, LearnProgress } from '@/types';
import { shuffle, getRandomItemsExcluding } from '@/lib/utils/shuffle';
import { ProgressCircle, ProgressLegend } from '@/components/ui/ProgressCircle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { updateFlashcardStatus } from '@/lib/actions/study-sets';

interface LearnModeProps {
  flashcards: Flashcard[];
  setTitle: string;
}

interface QuestionState {
  card: Flashcard;
  options: string[];
  correctIndex: number;
}

export function LearnMode({ flashcards: initialCards, setTitle }: LearnModeProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Calculate progress
  const progress: LearnProgress = {
    new: cards.filter(c => c.status === 'new').length,
    learning: cards.filter(c => c.status === 'learning').length,
    mastered: cards.filter(c => c.status === 'mastered').length,
    total: cards.length,
  };
  
  // Initialize
  useEffect(() => {
    const initialQueue = shuffle(initialCards.filter(c => c.status !== 'mastered'));
    setCards(initialCards);
    setQueue(initialQueue);
    if (initialQueue.length > 0) {
      generateQuestion(initialQueue[0], initialCards);
    } else {
      setIsComplete(true);
    }
  }, [initialCards]);
  
  const generateQuestion = useCallback((card: Flashcard, allCards: Flashcard[]) => {
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
  
  const handleAnswer = async (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion?.correctIndex;
    const card = currentQuestion?.card;
    
    if (!card) return;
    
    // Update card status
    const newStatus = isCorrect ? 'mastered' : 'learning';
    await updateFlashcardStatus(card.id, newStatus);
    
    // Update local state
    setCards(prev => prev.map(c => 
      c.id === card.id ? { ...c, status: newStatus } : c
    ));
    
    // Wait for animation, then move to next
    setTimeout(() => {
      const newQueue = queue.slice(1);
      
      if (!isCorrect) {
        // Add card back to queue for later
        newQueue.push({ ...card, status: 'learning' });
      }
      
      setQueue(newQueue);
      
      if (newQueue.length > 0) {
        generateQuestion(newQueue[0], cards);
      } else {
        setIsComplete(true);
      }
    }, 1200);
  };
  
  const handleRestart = () => {
    const resetQueue = shuffle(initialCards);
    setCards(initialCards);
    setQueue(resetQueue);
    setIsComplete(false);
    generateQuestion(resetQueue[0], initialCards);
  };
  
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
          Study Again
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
