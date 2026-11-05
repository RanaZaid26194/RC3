import type { ReactNode } from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/cn';

export function EmptyState({ title, message, action, icon }: { title: string; message: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-md)] border border-dashed border-line bg-surface px-6 py-12 text-center">
      <div className="mb-3 text-brand-600" aria-hidden="true">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 h-9 w-9 text-danger" aria-hidden="true" />
      <p className="text-sm font-medium text-danger">{message}</p>
      {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}
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
