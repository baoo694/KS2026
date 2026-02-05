'use client';

import { useState } from 'react';
import { Flashcard, TestConfig, TestQuestion, TestResult, QuestionType } from '@/types';
import { TestSetup } from './TestSetup';
import { TestRunner } from './TestRunner';
import { TestResults } from './TestResults';
import { shuffle, getRandomItems, getRandomItemsExcluding } from '@/lib/utils/shuffle';

interface TestModeProps {
  flashcards: Flashcard[];
  setTitle: string;
}

type TestPhase = 'setup' | 'running' | 'results';

export function TestMode({ flashcards, setTitle }: TestModeProps) {
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  
  const generateQuestions = (config: TestConfig): TestQuestion[] => {
    const selectedCards = getRandomItems(flashcards, config.questionCount);
    const generatedQuestions: TestQuestion[] = [];
    
    selectedCards.forEach((card, index) => {
      // Cycle through selected question types
      const type = config.questionTypes[index % config.questionTypes.length];
      
      const question: TestQuestion = {
        id: `q-${index}`,
        type,
        flashcard: card,
        correctAnswer: card.definition,
      };
      
      if (type === 'multiple-choice') {
        // Generate 4 options (1 correct + 3 distractors)
        const distractors = getRandomItemsExcluding(
          flashcards.map(f => f.definition),
          3,
          [card.definition],
          (a, b) => a === b
        );
        question.options = shuffle([card.definition, ...distractors]);
      } else if (type === 'true-false') {
        // 50% chance correct pair, 50% wrong pair
        const isCorrectPair = Math.random() > 0.5;
        
        if (isCorrectPair) {
          question.displayedDefinition = card.definition;
          question.isPairCorrect = true;
          question.correctAnswer = 'true';
        } else {
          // Pick a random wrong definition
          const wrongDef = getRandomItemsExcluding(
            flashcards.map(f => f.definition),
            1,
            [card.definition],
            (a, b) => a === b
          )[0] || card.definition;
          question.displayedDefinition = wrongDef;
          question.isPairCorrect = false;
          question.correctAnswer = 'false';
        }
      }
      // For 'written', correctAnswer is already set to definition
      
      generatedQuestions.push(question);
    });
    
    return generatedQuestions;
  };
  
  const handleStartTest = (config: TestConfig) => {
    const generatedQuestions = generateQuestions(config);
    setQuestions(generatedQuestions);
    setPhase('running');
  };
  
  const handleSubmitTest = (testResult: TestResult) => {
    setResult(testResult);
    setPhase('results');
  };
  
  const handleRetry = () => {
    setPhase('setup');
    setQuestions([]);
    setResult(null);
  };
  
  return (
    <div className="max-w-3xl mx-auto pt-2 pb-2 sm:pt-3 sm:pb-3">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold text-slate-900">{setTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">Test Mode</p>
      </div>
      
      {phase === 'setup' && (
        <TestSetup 
          maxQuestions={flashcards.length} 
          onStart={handleStartTest} 
        />
      )}
      
      {phase === 'running' && (
        <TestRunner 
          questions={questions} 
          onSubmit={handleSubmitTest} 
        />
      )}
      
      {phase === 'results' && result && (
        <TestResults 
          result={result} 
          questions={questions}
          onRetry={handleRetry} 
        />
      )}
    </div>
  );
}
