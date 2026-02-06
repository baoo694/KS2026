'use client';

import { useState } from 'react';
import { Flashcard, TestConfig, TestQuestion, TestResult, QuestionType, TestAnswerDetail, SaveTestResultInput } from '@/types';
import { TestSetup } from './TestSetup';
import { TestRunner } from './TestRunner';
import { TestResults } from './TestResults';
import { shuffle, getRandomItems, getRandomItemsExcluding } from '@/lib/utils/shuffle';
import { saveTestResult } from '@/lib/actions/test-results';

interface TestModeProps {
  flashcards: Flashcard[];
  setTitle: string;
  studySetId: string;
}

type TestPhase = 'setup' | 'running' | 'results';

export function TestMode({ flashcards, setTitle, studySetId }: TestModeProps) {
  const [phase, setPhase] = useState<TestPhase>('setup');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  
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
    setSaveStatus('idle');
  };
  
  const handleSubmitTest = async (testResult: TestResult) => {
    setResult(testResult);
    setPhase('results');
    
    // Auto-save test result
    setIsSaving(true);
    try {
      // Build detailed answers for storage
      const detailedAnswers: TestAnswerDetail[] = questions.map(q => {
        const answer = testResult.answers.find(a => a.questionId === q.id);
        return {
          questionId: q.id,
          questionType: q.type,
          term: q.flashcard.term,
          correctAnswer: q.type === 'true-false' 
            ? (q.isPairCorrect ? 'True' : 'False')
            : q.flashcard.definition,
          userAnswer: answer?.userAnswer || '',
          isCorrect: answer?.isCorrect ?? false,
        };
      });
      
      // Count question types
      const questionTypes: Record<string, number> = {};
      questions.forEach(q => {
        questionTypes[q.type] = (questionTypes[q.type] || 0) + 1;
      });
      
      const input: SaveTestResultInput = {
        study_set_id: studySetId,
        score: testResult.correctAnswers,
        total_questions: testResult.totalQuestions,
        percentage: testResult.score,
        question_types: questionTypes,
        answers: detailedAnswers,
      };
      
      const saveResult = await saveTestResult(input);
      
      if (saveResult.success) {
        setSaveStatus('saved');
      } else {
        console.error('Failed to save test result:', saveResult.error);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving test result:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRetry = () => {
    setPhase('setup');
    setQuestions([]);
    setResult(null);
    setSaveStatus('idle');
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
          isSaving={isSaving}
          saveStatus={saveStatus}
        />
      )}
    </div>
  );
}
