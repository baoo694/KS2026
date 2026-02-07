'use client';

import { useState, useEffect, useRef } from 'react';

interface FlashcardItemProps {
  term: string;
  definition: string;
  isFlipped: boolean;
  onFlip: () => void;
  slideDirection?: 'left' | 'right' | null;
  animationTrigger?: number; // Changes each navigation to trigger animation
}

export function FlashcardItem({ 
  term, 
  definition, 
  isFlipped, 
  onFlip,
  slideDirection,
  animationTrigger = 0
}: FlashcardItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayTerm, setDisplayTerm] = useState(term);
  const [displayDefinition, setDisplayDefinition] = useState(definition);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [currentDirection, setCurrentDirection] = useState<'left' | 'right' | null>(null);
  const isFirstRender = useRef(true);

  // Handle card change animation
  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayTerm(term);
      setDisplayDefinition(definition);
      return;
    }

    if (slideDirection && animationTrigger > 0) {
      setIsAnimating(true);
      setCurrentDirection(slideDirection);
      
      // Phase 1: Exit animation (slide out current card)
      setAnimationPhase('exit');
      
      // Phase 2: After exit, update content and slide in
      const exitTimer = setTimeout(() => {
        setDisplayTerm(term);
        setDisplayDefinition(definition);
        setAnimationPhase('enter');
        
        // Phase 3: Complete animation
        const enterTimer = setTimeout(() => {
          setAnimationPhase('idle');
          setIsAnimating(false);
          setCurrentDirection(null);
        }, 100);
        
        return () => clearTimeout(enterTimer);
      }, 200);
      
      return () => clearTimeout(exitTimer);
    } else {
      // No animation, just update content
      setDisplayTerm(term);
      setDisplayDefinition(definition);
    }
  }, [animationTrigger, slideDirection, term, definition]);

  // Determine animation classes
  const getAnimationClass = () => {
    if (!isAnimating || !currentDirection) return '';
    
    if (animationPhase === 'exit') {
      return currentDirection === 'left' ? 'flashcard-exit-left' : 'flashcard-exit-right';
    }
    if (animationPhase === 'enter') {
      return currentDirection === 'left' ? 'flashcard-enter-left' : 'flashcard-enter-right';
    }
    return '';
  };

  return (
    <div
      className={`w-full max-w-2xl cursor-pointer ${getAnimationClass()}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      aria-label={isFlipped ? 'Showing definition, click to show term' : 'Showing term, click to show definition'}
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] max-h-[50vh]">
        {/* Card Container */}
        <div className="h-full w-full rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {/* Term Section */}
          <div className={`
            flex flex-col items-center justify-center p-6 sm:p-8
            ${isFlipped ? 'h-1/2 border-b border-slate-100' : 'h-full'}
            transition-all duration-300 ease-in-out
          `}>
            <span className="absolute top-4 left-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Term
            </span>
            <p className={`
              font-medium text-slate-900 text-center leading-relaxed
              ${isFlipped ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}
              transition-all duration-300
            `}>
              {displayTerm}
            </p>
            {!isFlipped && (
              <span className="absolute bottom-4 text-xs text-slate-400">
                Click to reveal definition
              </span>
            )}
          </div>
          
          {/* Definition Section - Expands when revealed */}
          <div className={`
            flex flex-col items-center justify-center p-6 sm:p-8
            bg-gradient-to-br from-indigo-500 to-cyan-500
            transition-all duration-300 ease-in-out
            ${isFlipped ? 'h-1/2 opacity-100' : 'h-0 opacity-0 p-0'}
          `}>
            {isFlipped && (
              <>
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider mb-2">
                  Definition
                </span>
                <p className="text-base sm:text-lg text-white text-center leading-relaxed whitespace-pre-wrap">
                  {displayDefinition}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
