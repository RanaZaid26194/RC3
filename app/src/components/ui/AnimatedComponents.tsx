import { cn } from '@/lib/cn';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger';
}

export function AnimatedProgressBar({
  value,
  max = 100,
  showLabel = true,
  className,
  color = 'brand',
}: AnimatedProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    brand: 'bg-brand-600 shadow-lg shadow-brand-500/30',
    success: 'bg-success animate-pulse',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">Progress</span>
          <span className="font-bold text-neutral-900 dark:text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800 shadow-inner">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out-expo',
            'relative overflow-hidden',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

interface PulseBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'error';
  label?: string;
  className?: string;
}

export function PulseBadge({ status, label, className }: PulseBadgeProps) {
  const statusConfig = {
    active: { bg: 'bg-brand-500', pulse: true },
    pending: { bg: 'bg-accent-500', pulse: true },
    completed: { bg: 'bg-success', pulse: false },
    error: { bg: 'bg-danger', pulse: false },
  };

  const config = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', className)}>
      <span className={cn('h-2 w-2 rounded-full', config.bg)}></span>
      {config.pulse && <span className="animate-ping absolute h-2 w-2 rounded-full bg-current opacity-75" />}
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
