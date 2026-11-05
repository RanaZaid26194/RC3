import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'brand' | 'neutral' | 'gradient';
}

export function Spinner({ size = 'md', className, color = 'brand' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  if (color === 'gradient') {
    return (
      <div className={cn('relative', sizeClasses[size], className)}>
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600 border-r-accent-500" />
        <div className="absolute inset-1 animate-pulse rounded-full bg-gradient-to-br from-brand-500/20 to-accent-500/20" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-4 border-neutral-200 dark:border-neutral-700',
        sizeClasses[size],
        color === 'brand' ? 'border-t-brand-600' : 'border-t-neutral-800 dark:border-t-white',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800', className)} />;
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeletonItem key={i} />
      ))}
    </div>
  );
}

export function CardSkeletonItem() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <LoadingSkeleton className="h-5 w-1/3" />
        <LoadingSkeleton className="h-8 w-8 rounded-full" />
      </div>
      <LoadingSkeleton className="h-4 w-3/4 mb-2" />
      <LoadingSkeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-5 w-16 rounded-full" />
        <LoadingSkeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}
