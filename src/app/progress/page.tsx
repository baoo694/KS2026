import { getOverallProgress } from '@/lib/actions/progress';
import { getTestStats } from '@/lib/actions/test-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookOpen, Trophy, TrendingUp, Clock, CheckCircle2, AlertCircle, BookMarked } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const [progressData, testStats] = await Promise.all([
    getOverallProgress(),
    getTestStats(),
  ]);
  
  const { stats, setProgress } = progressData;
  const totalFlashcards = stats.total || 0;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-600 mt-1">Track your learning journey across all study sets</p>
        </div>
        
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.mastered}</div>
              <div className="text-sm text-slate-500">Mastered</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-2">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.learning}</div>
              <div className="text-sm text-slate-500">Learning</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-2">
                <BookOpen className="h-6 w-6 text-slate-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stats.new}</div>
              <div className="text-sm text-slate-500">New</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 mb-2">
                <Trophy className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{testStats.totalTests}</div>
              <div className="text-sm text-slate-500">Tests Taken</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Test Stats Summary */}
        {testStats.totalTests > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-indigo-600" />
                Test Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Average Score</div>
                  <div className="text-3xl font-bold text-indigo-600">{testStats.averageScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Best Score</div>
                  <div className="text-3xl font-bold text-emerald-600">{testStats.bestScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Total Tests</div>
                  <div className="text-3xl font-bold text-slate-900">{testStats.totalTests}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Per-Set Progress */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-indigo-600" />
              Progress by Study Set
            </h2>
            
            {setProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>No progress yet</p>
                  <p className="text-sm mt-1">Start learning some flashcards to see your progress here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {setProgress.map((set) => {
                  const masteredPercent = set.total > 0 ? Math.round((set.mastered / set.total) * 100) : 0;
                  
                  return (
                    <Link 
                      key={set.study_set_id} 
                      href={`/sets/${set.study_set_id}`}
                      className="block"
                    >
                      <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                        <CardContent className="py-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-slate-900 truncate">{set.title}</h3>
                            <span className="text-sm text-slate-500 flex-shrink-0 ml-2">
                              {masteredPercent}% mastered
                            </span>
                          </div>
                          <ProgressBar 
                            current={set.mastered} 
                            total={set.total} 
                            variant="success"
                          />
                          <div className="flex gap-4 mt-2 text-xs text-slate-500">
                            <span className="text-emerald-600">✓ {set.mastered} mastered</span>
                            <span className="text-amber-600">↻ {set.learning} learning</span>
                            <span>○ {set.new} new</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Recent Tests */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Recent Tests
            </h2>
            
            {testStats.recentTests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-slate-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>No tests taken yet</p>
                  <p className="text-sm mt-1">Take a test to track your scores here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {testStats.recentTests.map((test) => {
                  const scoreColor = test.percentage >= 90 
                    ? 'text-emerald-600' 
                    : test.percentage >= 70 
                      ? 'text-amber-600' 
                      : 'text-red-600';
                  
                  return (
                    <Card key={test.id}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-slate-900 truncate">
                              {test.study_set?.title || 'Unknown Set'}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {new Date(test.completed_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className={`text-2xl font-bold ${scoreColor}`}>
                              {test.percentage}%
                            </div>
                            <div className="text-xs text-slate-500">
                              {test.score}/{test.total_questions}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Empty State for Everything */}
        {totalFlashcards === 0 && testStats.totalTests === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Start Your Learning Journey</h2>
              <p className="text-slate-600 mb-4">
                You haven&apos;t studied any flashcards yet. Head to a study set and start learning!
              </p>
              <Link 
                href="/sets" 
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Study Sets
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
