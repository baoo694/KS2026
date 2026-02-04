'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  handler: () => void;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
}

export function useKeyboard(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // Ignore if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                       event.code.toLowerCase() === shortcut.key.toLowerCase();
      
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
        break;
      }
    }
  }, [shortcuts, enabled]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Convenience hook for common flashcard shortcuts
export function useFlashcardKeyboard(
  onFlip: () => void,
  onPrevious: () => void,
  onNext: () => void,
  enabled: boolean = true
) {
  useKeyboard([
    { key: 'Space', handler: onFlip },
    { key: 'ArrowLeft', handler: onPrevious },
    { key: 'ArrowRight', handler: onNext },
  ], enabled);
}
