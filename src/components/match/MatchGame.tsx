'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flashcard, MatchItem, MatchGameState } from '@/types';
import { shuffle, getRandomItems } from '@/lib/utils/shuffle';
import { useTimer } from '@/lib/hooks/useTimer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Timer, RotateCcw, Trophy, AlertCircle } from 'lucide-react';

interface MatchGameProps {
  flashcards: Flashcard[];
  setTitle: string;
}

export function MatchGame({ flashcards, setTitle }: MatchGameProps) {
  const [gameState, setGameState] = useState<MatchGameState | null>(null);
  const [selectedItem, setSelectedItem] = useState<MatchItem | null>(null);
  const [showError, setShowError] = useState<string[]>([]);
  const timer = useTimer(true);
  
  // Initialize game
  const initializeGame = useCallback(() => {
    // Select 6 random pairs (or fewer if not enough cards)
    const pairCount = Math.min(6, flashcards.length);
    const selectedCards = getRandomItems(flashcards, pairCount);
    
    // Create match items (terms + definitions)
    const items: MatchItem[] = [];
    
    selectedCards.forEach(card => {
      items.push({
        id: `term-${card.id}`,
        flashcardId: card.id,
        content: card.term,
        type: 'term',
        isMatched: false,
        isSelected: false,
      });
      items.push({
        id: `def-${card.id}`,
        flashcardId: card.id,
        content: card.definition,
        type: 'definition',
        isMatched: false,
        isSelected: false,
      });
    });
    
    // Shuffle all items together
    const shuffledItems = shuffle(items);
    
    setGameState({
      items: shuffledItems,
      selectedItem: null,
      matchedPairs: 0,
      mistakes: 0,
      startTime: Date.now(),
      elapsedTime: 0,
      penaltyTime: 0,
      isComplete: false,
    });
    setSelectedItem(null);
    timer.reset();
    timer.start();
  }, [flashcards, timer]);
  
  useEffect(() => {
    initializeGame();
  }, []);
  
  const handleItemClick = (item: MatchItem) => {
    if (!gameState || item.isMatched || gameState.isComplete) return;
    
    if (!selectedItem) {
      // First selection
      setSelectedItem(item);
      setGameState(prev => prev ? {
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id ? { ...i, isSelected: true } : i
        ),
      } : null);
    } else if (selectedItem.id === item.id) {
      // Clicked same item - deselect
      setSelectedItem(null);
      setGameState(prev => prev ? {
        ...prev,
        items: prev.items.map(i => 
          i.id === item.id ? { ...i, isSelected: false } : i
        ),
      } : null);
    } else {
      // Second selection - check for match
      const isMatch = selectedItem.flashcardId === item.flashcardId;
      
      if (isMatch) {
        // Match found!
        const newMatchedPairs = (gameState.matchedPairs || 0) + 1;
        const totalPairs = gameState.items.length / 2;
        const isComplete = newMatchedPairs === totalPairs;
        
        if (isComplete) {
          timer.stop();
        }
        
        setGameState(prev => prev ? {
          ...prev,
          items: prev.items.map(i => 
            i.flashcardId === item.flashcardId 
              ? { ...i, isMatched: true, isSelected: false } 
              : i
          ),
          matchedPairs: newMatchedPairs,
          isComplete,
        } : null);
        setSelectedItem(null);
      } else {
        // No match - show error animation + apply penalty
        timer.addPenalty(1);
        setShowError([selectedItem.id, item.id]);
        
        setGameState(prev => prev ? {
          ...prev,
          items: prev.items.map(i => 
            i.id === item.id ? { ...i, isSelected: true } : i
          ),
          mistakes: (prev.mistakes || 0) + 1,
          penaltyTime: (prev.penaltyTime || 0) + 1000,
        } : null);
        
        // Clear error state after animation
        setTimeout(() => {
          setShowError([]);
          setSelectedItem(null);
          setGameState(prev => prev ? {
            ...prev,
            items: prev.items.map(i => ({ ...i, isSelected: false })),
          } : null);
        }, 600);
      }
    }
  };
  
  if (!gameState) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }
  
  if (gameState.isComplete) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <Trophy className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Congratulations!</h2>
        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
          {timer.formattedTime}
        </div>
        <p className="text-slate-600">
          {gameState.mistakes === 0 
            ? 'Perfect game! No mistakes!' 
            : `${gameState.mistakes} mistake${gameState.mistakes > 1 ? 's' : ''} (+${gameState.mistakes}s penalty)`
          }
        </p>
        <Button onClick={initializeGame} className="mt-6">
          <RotateCcw className="mr-2 h-4 w-4" />
          Play Again
        </Button>
      </div>
    );
  }
  
  const columns = gameState.items.length <= 8 ? 4 : gameState.items.length <= 12 ? 4 : 4;
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">Match Mode</p>
      </div>
      
      {/* Stats */}
      <div className="flex justify-center gap-8">
        <div className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-slate-400" />
          <span className="font-mono font-semibold text-slate-900">
            {timer.formattedTime}
          </span>
        </div>
        <div className="text-slate-500">
          {gameState.matchedPairs} / {gameState.items.length / 2} pairs
        </div>
        {gameState.mistakes > 0 && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>+{gameState.mistakes}s</span>
          </div>
        )}
      </div>
      
      {/* Game Grid - Responsive */}
      <div 
        className={`grid gap-3`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {gameState.items.map(item => {
          const isError = showError.includes(item.id);
          const isSelected = selectedItem?.id === item.id || item.isSelected;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              disabled={item.isMatched}
              className={`
                min-h-[80px] p-3 rounded-xl border-2 text-sm font-medium transition-all
                ${item.isMatched 
                  ? 'opacity-0 scale-90 pointer-events-none' 
                  : isError
                    ? 'border-red-500 bg-red-50 animate-shake'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg scale-105'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md text-slate-700'
                }
              `}
            >
              <span className="block truncate">{item.content}</span>
              <span className={`
                text-[10px] uppercase tracking-wider mt-1 block
                ${isSelected ? 'text-indigo-400' : 'text-slate-400'}
              `}>
                {item.type}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Restart Button */}
      <div className="text-center">
        <Button variant="ghost" onClick={initializeGame}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart Game
        </Button>
      </div>
    </div>
  );
}
