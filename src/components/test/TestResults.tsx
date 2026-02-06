'use client';

import { TestResult, TestQuestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Save, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface TestResultsProps {
  result: TestResult;
  questions: TestQuestion[];
  onRetry: () => void;
  isSaving?: boolean;
  saveStatus?: 'idle' | 'saved' | 'error';
}

export function TestResults({ result, questions, onRetry, isSaving, saveStatus }: TestResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 70) return '👍';
    if (score >= 50) return '📚';
    return '💪';
  };
  
  return (
    <div className="space-y-8">
      {/* Score Card */}
      <Card className="text-center overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 py-8 px-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Test Complete!</h2>
          
          {/* Save Status */}
          <div className="mt-3 flex items-center justify-center gap-2 text-white/90 text-sm">
            {isSaving && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving result...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <Save className="h-4 w-4" />
                <span>Result saved to your progress</span>
              </>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-200">Failed to save result</span>
            )}
          </div>
        </div>
        <CardContent className="py-8">
          <div className="text-6xl font-bold mb-2" role="img" aria-label="Score emoji">
            {getScoreEmoji(result.score)}
          </div>
          <div className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <p className="mt-2 text-slate-600">
            {result.correctAnswers} of {result.totalQuestions} correct
          </p>
        </CardContent>
      </Card>
      
      {/* Detailed Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Review Answers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {questions.map((question, idx) => {
            const answer = result.answers.find(a => a.questionId === question.id);
            const isCorrect = answer?.isCorrect ?? false;
            
            return (
              <Card 
                key={question.id} 
                className={`border-l-4 ${isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'} h-full flex flex-col`}
              >
                <CardContent className="py-4 flex-1">
                  <div className="flex items-start gap-3 h-full">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <span>Question {idx + 1}</span>
                        <span>•</span>
                        <span className="capitalize">{question.type.replace('-', ' ')}</span>
                      </div>
                      <p className="font-medium text-slate-900 truncate-2-lines">{question.flashcard.term}</p>
                      
                      <div className="mt-3 space-y-2 text-sm">
                        {!isCorrect && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-red-600 font-semibold text-xs uppercase tracking-tight">Your answer:</span>
                            <span className="text-slate-600 line-clamp-2">
                              {answer?.userAnswer || '(no answer)'}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-emerald-600 font-semibold text-xs uppercase tracking-tight">Correct answer:</span>
                          <span className="text-slate-600 line-clamp-2">
                            {question.type === 'true-false' 
                              ? question.isPairCorrect ? 'True' : 'False'
                              : question.flashcard.definition
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Button onClick={onRetry} size="lg">
          <RotateCcw className="mr-2 h-5 w-5" />
          Take Another Test
        </Button>
        
        {saveStatus === 'saved' && (
          <Link 
            href="/progress"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            View Progress
          </Link>
        )}
      </div>
    </div>
  );
}
