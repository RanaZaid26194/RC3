import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; }

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-900 active:scale-[0.98]',
  secondary: 'bg-surface text-ink border border-line hover:bg-brand-50',
  ghost: 'text-ink-muted hover:bg-brand-50 hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-90',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, disabled, className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition duration-150',
        'min-h-11 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'lg' ? 'px-6 text-base' : 'px-4 text-sm',
        variants[variant], className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});
