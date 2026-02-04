import { LearnProgress } from '@/types';

interface ProgressCircleProps {
  progress: LearnProgress;
  size?: number;
  strokeWidth?: number;
}

export function ProgressCircle({ 
  progress, 
  size = 120, 
  strokeWidth = 8 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const { new: newCount, learning, mastered, total } = progress;
  
  // Calculate percentages
  const masteredPercent = total > 0 ? mastered / total : 0;
  const learningPercent = total > 0 ? learning / total : 0;
  const newPercent = total > 0 ? newCount / total : 0;
  
  // Calculate stroke dash offsets
  const masteredOffset = circumference * (1 - masteredPercent);
  const learningOffset = circumference * (1 - learningPercent);
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        
        {/* New (slate) - base layer */}
        {newPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        )}
        
        {/* Learning (amber) - middle layer */}
        {learningPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={learningOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        )}
        
        {/* Mastered (emerald) - top layer */}
        {masteredPercent > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={masteredOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        )}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{mastered}</span>
        <span className="text-xs text-slate-500">mastered</span>
      </div>
    </div>
  );
}

interface ProgressLegendProps {
  progress: LearnProgress;
}

export function ProgressLegend({ progress }: ProgressLegendProps) {
  const items = [
    { label: 'New', count: progress.new, color: 'bg-slate-400' },
    { label: 'Learning', count: progress.learning, color: 'bg-amber-500' },
    { label: 'Mastered', count: progress.mastered, color: 'bg-emerald-500' },
  ];
  
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-sm text-slate-600">
            {item.label}: <span className="font-medium">{item.count}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
