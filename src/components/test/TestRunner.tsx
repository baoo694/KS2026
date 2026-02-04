'use client';

import { useState } from 'react';
import { TestQuestion, TestAnswer, TestResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { compareAnswers } from '@/lib/utils/normalize';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

interface TestRunnerProps {
  questions: TestQuestion[];
  onSubmit: (result: TestResult) => void;
}

export function TestRunner({ questions, onSubmit }: TestRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const currentQuestion = questions[currentIndex];
  
  const setAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handleSubmit = () => {
    const testAnswers: TestAnswer[] = questions.map(q => {
      const userAnswer = answers[q.id] || '';
      let isCorrect = false;
      
      if (q.type === 'written') {
        isCorrect = compareAnswers(userAnswer, q.correctAnswer);
      } else {
        isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
      }
      
      return {
        questionId: q.id,
        userAnswer,
        isCorrect,
      };
    });
    
    const correctCount = testAnswers.filter(a => a.isCorrect).length;
    
    onSubmit({
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score: Math.round((correctCount / questions.length) * 100),
      answers: testAnswers,
    });
  };
  
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressBar current={currentIndex + 1} total={questions.length} />
      
      {/* Question Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-4">
            <span>Question {currentIndex + 1}</span>
            <span>•</span>
            <span className="capitalize">{currentQuestion.type.replace('-', ' ')}</span>
          </div>
          
          {/* Term */}
          <p className="text-xl font-medium text-slate-900 mb-6">
            {currentQuestion.flashcard.term}
          </p>
          
          {/* Question Type Specific UI */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
            <div className="grid gap-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswer(currentQuestion.id, option)}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <span className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}
                    `}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-slate-900">{option}</span>
                  </button>
                );
              })}
            </div>
          )}
          
          {currentQuestion.type === 'true-false' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-100">
                <span className="text-xs text-slate-500">Displayed definition:</span>
                <p className="mt-1 text-slate-700">{currentQuestion.displayedDefinition}</p>
              </div>
              <p className="text-sm text-slate-600">
                Is this the correct definition for the term above?
              </p>
              <div className="flex gap-4">
                {['true', 'false'].map(value => {
                  const isSelected = answers[currentQuestion.id] === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setAnswer(currentQuestion.id, value)}
                      className={`
                        flex-1 py-4 px-6 rounded-xl border-2 font-medium capitalize transition-all
                        ${isSelected 
                          ? value === 'true' 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }
                      `}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {currentQuestion.type === 'written' && (
            <div>
              <Input
                placeholder="Type your answer..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">
                Text will be compared case-insensitively with some tolerance for typos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm text-slate-500">
          {answeredCount} of {questions.length} answered
        </span>
        
        {currentIndex < questions.length - 1 ? (
          <Button variant="secondary" onClick={goToNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Submit Test
          </Button>
        )}
      </div>
      
      {/* Question Navigation Dots */}
      <div className="flex flex-wrap justify-center gap-2 pt-4">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentIndex;
          
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`
                w-8 h-8 rounded-full text-xs font-medium transition-all
                ${isCurrent 
                  ? 'bg-indigo-500 text-white' 
                  : isAnswered 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
