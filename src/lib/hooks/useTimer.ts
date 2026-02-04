'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  elapsedTime: number;
  penaltyTime: number;
  totalTime: number;
  isRunning: boolean;
}

export function useTimer(autoStart: boolean = true) {
  const [state, setState] = useState<TimerState>({
    elapsedTime: 0,
    penaltyTime: 0,
    totalTime: 0,
    isRunning: autoStart,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  const start = useCallback(() => {
    if (!state.isRunning) {
      startTimeRef.current = Date.now() - state.elapsedTime;
      setState(prev => ({ ...prev, isRunning: true }));
    }
  }, [state.isRunning, state.elapsedTime]);
  
  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);
  
  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    setState({
      elapsedTime: 0,
      penaltyTime: 0,
      totalTime: 0,
      isRunning: false,
    });
  }, []);
  
  const addPenalty = useCallback((seconds: number = 1) => {
    setState(prev => ({
      ...prev,
      penaltyTime: prev.penaltyTime + seconds * 1000,
      totalTime: prev.elapsedTime + prev.penaltyTime + seconds * 1000,
    }));
  }, []);
  
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        setState(prev => ({
          ...prev,
          elapsedTime: elapsed,
          totalTime: elapsed + prev.penaltyTime,
        }));
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);
  
  return {
    ...state,
    start,
    stop,
    reset,
    addPenalty,
    formattedTime: formatTime(state.totalTime),
  };
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  }
  return `${seconds}.${tenths}s`;
}
