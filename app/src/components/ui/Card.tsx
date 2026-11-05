import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient' | 'glass';
}

export function Card({ className, variant = 'default', ...rest }: CardProps) {
  const variants = {
    default: '',
    elevated: 'hover:shadow-xl transition-shadow duration-300',
    gradient: 'relative overflow-hidden',
    glass: 'backdrop-blur-md bg-white/70 dark:bg-neutral-900/70',
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border border-line-heavy bg-surface shadow-md hover:shadow-lg transition-all duration-300 ease-out',
        variants[variant],
        className
      )}
      {...rest}
    />
  );
}

// Animated card wrapper with entrance animation
export function AnimatedCard({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={cn('animate-fade-up', className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {children}
    </div>
  );
}

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted border-line', 
  success: 'bg-green-50 text-success border-green-200',
  warning: 'bg-amber-50 text-warning border-amber-200', 
  danger: 'bg-red-50 text-danger border-red-200', 
  info: 'bg-blue-50 text-info border-blue-200',
};

export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all',
        tones[tone], 
        className
      )} 
      {...rest} 
    />
  );
}

// Status indicator badge
export function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, Tone> = {
    'open': 'success',
    'active': 'success',
    'completed': 'success',
    'pending': 'warning',
    'closed': 'danger',
    'rejected': 'danger',
    'default': 'neutral',
  };
  
  const tone = statusColors[status.toLowerCase()] || 'neutral';
  
  return <Badge tone={tone}>{status}</Badge>;
}
