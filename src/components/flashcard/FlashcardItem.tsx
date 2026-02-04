'use client';

interface FlashcardItemProps {
  term: string;
  definition: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardItem({ term, definition, isFlipped, onFlip }: FlashcardItemProps) {
  return (
    <div
      className="perspective-1000 w-full max-w-2xl cursor-pointer"
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
      <div
        className={`
          relative w-full aspect-[3/2] preserve-3d flashcard-flip
          ${isFlipped ? 'rotate-y-180' : ''}
        `}
      >
        {/* Front (Term) */}
        <div className="absolute inset-0 backface-hidden">
          <div className="h-full w-full rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 p-8 flex flex-col items-center justify-center">
            <span className="absolute top-4 left-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
              Term
            </span>
            <p className="text-xl sm:text-2xl font-medium text-slate-900 text-center leading-relaxed">
              {term}
            </p>
            <span className="absolute bottom-4 text-xs text-slate-400">
              Click to reveal definition
            </span>
          </div>
        </div>
        
        {/* Back (Definition) */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="h-full w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-xl shadow-indigo-200/50 p-8 flex flex-col items-center justify-center">
            <span className="absolute top-4 left-4 text-xs font-medium text-white/70 uppercase tracking-wider">
              Definition
            </span>
            <p className="text-lg sm:text-xl text-white text-center leading-relaxed">
              {definition}
            </p>
            <span className="absolute bottom-4 text-xs text-white/70">
              Click to see term
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
