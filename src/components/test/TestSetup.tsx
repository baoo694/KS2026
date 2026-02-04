'use client';

import { useState } from 'react';
import { TestConfig, QuestionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ListChecks, ToggleLeft, PenLine, Play } from 'lucide-react';

interface TestSetupProps {
  maxQuestions: number;
  onStart: (config: TestConfig) => void;
}

const questionTypeOptions = [
  { type: 'multiple-choice' as QuestionType, label: 'Multiple Choice', icon: ListChecks },
  { type: 'true-false' as QuestionType, label: 'True/False', icon: ToggleLeft },
  { type: 'written' as QuestionType, label: 'Written', icon: PenLine },
];

export function TestSetup({ maxQuestions, onStart }: TestSetupProps) {
  const [questionCount, setQuestionCount] = useState(Math.min(10, maxQuestions));
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['multiple-choice']);
  
  const toggleType = (type: QuestionType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // Don't allow deselecting all types
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };
  
  const handleStart = () => {
    onStart({
      questionCount,
      questionTypes: selectedTypes,
    });
  };
  
  return (
    <Card>
      <CardContent className="py-8 space-y-8">
        {/* Question Count */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Number of Questions
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={maxQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="w-12 text-center font-medium text-slate-900">
              {questionCount}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Max: {maxQuestions} questions
          </p>
        </div>
        
        {/* Question Types */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Question Types
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {questionTypeOptions.map(option => {
              const isSelected = selectedTypes.includes(option.type);
              const Icon = option.icon;
              
              return (
                <button
                  key={option.type}
                  onClick={() => toggleType(option.type)}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Start Button */}
        <div className="pt-4">
          <Button onClick={handleStart} size="lg" className="w-full">
            <Play className="mr-2 h-5 w-5" />
            Start Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
