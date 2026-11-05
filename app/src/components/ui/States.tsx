import type { ReactNode } from 'react';
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/cn';

/**
 * Premium animated loading spinner (Linear-style)
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-label="Loading" />
    </div>
  );
}

/**
 * Large full-screen loading state with custom animation
 */
export function FullScreenLoading() {
  return (
    <div className="flex h-screen min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 animate-pulse-soft rounded-full bg-brand-100 opacity-50 blur-xl" />
        {/* Main spinner */}
        <Loader2 className="relative h-12 w-12 animate-bounce-subtle text-brand-600" style={{ animationDuration: '3s' }} aria-label="Loading" />
      </div>
      <p className="animate-fade-in text-sm font-medium text-neutral-500">Loading...</p>
    </div>
  );
}

export function EmptyState({ 
  title, 
  message, 
  action, 
  icon,
  className 
}: { 
  title: string; 
  message: string; 
  action?: ReactNode; 
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-neutral-200 bg-white px-6 py-12 text-center shadow-sm",
      className
    )}>
      <div className="mb-4 scale-110 text-brand-600 animate-bounce-subtle" style={{ animationDuration: '2s' }} aria-hidden="true">
        {icon ?? <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ 
  message = 'Something went wrong.', 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="mb-4 h-10 w-10 text-red-600" aria-hidden="true" />
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function SuccessState({
  title,
  message,
  className
}: {
  title: string;
  message: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center rounded-[var(--radius-lg)] border border-green-200 bg-green-50 px-6 py-10 text-center",
      className
    )}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 animate-scale-in">
        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-green-900">{title}</h3>
      <p className="mt-2 text-sm text-green-700">{message}</p>
    </div>
  );
}

/**
 * Skeleton loader components
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div 
      aria-hidden="true" 
      className={cn('relative overflow-hidden rounded-[var(--radius-sm)] bg-neutral-200 animate-shimmer', className)}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`mb-2 rounded-[var(--radius-sm)] bg-neutral-200 ${i === lines - 1 ? 'w-2/3' : ''}`} style={{ height: i === 0 ? '20px' : '14px' }}>
          <div 
            aria-hidden="true" 
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-neutral-300/60 to-transparent"
            style={{ animation: 'shimmer 1.4s infinite' }} 
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <SkeletonText lines={lines} />
    </div>
  );
}
