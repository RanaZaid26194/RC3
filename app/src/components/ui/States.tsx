import type { ReactNode } from 'react';
import { Inbox, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/cn';

export function EmptyState({ title, message, action, icon }: { title: string; message: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-line bg-surface px-6 py-12 text-center animate-fade-up text-ink">
      <div className="mb-3 text-brand-600 dark:text-brand-400 animate-float" aria-hidden="true">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-md)] border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40 px-6 py-10 text-center animate-fade-up">
      <AlertTriangle className="mb-3 h-9 w-9 text-danger dark:text-red-400 animate-pop" aria-hidden="true" />
      <p className="text-sm font-medium text-danger dark:text-red-300">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function SuccessState({ title, message, className }: { title: string; message?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex flex-col items-center rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 px-6 py-10 text-center animate-fade-up', className)}>
      <CheckCircle2 className="mb-3 h-9 w-9 text-emerald-600 dark:text-emerald-400 animate-pop" aria-hidden="true" />
      <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
    </div>
  );
}

/** RecruLens signature conic spinner — no generic icon, pure CSS */
export function LoadingSpinner({ size = 'md', label = 'Loading' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span
        className={cn(
          'spinner-premium',
          size === 'sm' && '!h-4 !w-4',
          size === 'lg' && 'spinner-premium-lg'
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-region loading state with breathing halo */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 rounded-full bg-brand-100 animate-breathe blur-xl" aria-hidden="true" />
        <span className="spinner-premium spinner-premium-lg relative" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-ink-muted">{label}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('relative overflow-hidden rounded-[var(--radius-sm)] bg-line', className)}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: 'shimmer 1.4s infinite' }} />
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function DotsLoader({ label = 'Working' }: { label?: string }) {
  return (
    <span role="status" aria-label={label} className="dots-loader">
      <span /><span /><span />
      <span className="sr-only">{label}</span>
    </span>
  );
}
