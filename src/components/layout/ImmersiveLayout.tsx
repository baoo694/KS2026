'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface ImmersiveLayoutProps {
  children: React.ReactNode;
  setId: string;
  exitLabel?: string;
}

export function ImmersiveLayout({ children, setId, exitLabel = 'Exit' }: ImmersiveLayoutProps) {
  const router = useRouter();
  
  const handleExit = useCallback(() => {
    router.push(`/sets/${setId}`);
  }, [router, setId]);
  
  // Escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExit]);
  
  return (
    <div className="immersive-container">
      {/* Exit Button */}
      <button
        onClick={handleExit}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white shadow-lg transition-all"
        aria-label="Exit study mode"
      >
        <span className="text-sm font-medium hidden sm:inline">{exitLabel}</span>
        <X className="h-4 w-4" />
      </button>
      
      {/* Content */}
      <div className="immersive-content">
        {children}
      </div>
    </div>
  );
}
