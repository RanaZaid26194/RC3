import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-[var(--radius-md)] border border-line bg-surface shadow-[var(--shadow-card)]', className)} {...rest} />;
}
type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted border-line', success: 'bg-green-50 text-success border-green-200',
  warning: 'bg-amber-50 text-warning border-amber-200', danger: 'bg-red-50 text-danger border-red-200', info: 'bg-blue-50 text-info border-blue-200',
};
export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone], className)} {...rest} />;
}
