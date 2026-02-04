interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-gradient-to-r from-indigo-500 to-cyan-500',
  success: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  warning: 'bg-gradient-to-r from-amber-400 to-amber-600',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({ 
  current, 
  total, 
  showLabel = true,
  variant = 'default',
  size = 'md'
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700">
            {current} / {total}
          </span>
          <span className="text-slate-500">{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-200 overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
