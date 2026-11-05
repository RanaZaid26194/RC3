import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glass';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconOnly?: boolean;
}

const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]';

const variants: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-lg hover:shadow-xl rounded-md',
  secondary: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md',
  outline: 'border-2 border-neutral-300 dark:border-neutral-600 bg-transparent text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-md',
  ghost: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg rounded-md',
  glass: 'backdrop-blur-sm bg-white/80 dark:bg-neutral-900/80 border border-white/20 dark:border-neutral-700/50 shadow-sm hover:shadow-md rounded-lg',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)] min-h-8',
  md: 'px-4 py-2 text-sm rounded-[var(--radius-md)] min-h-10',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-md)] min-h-12',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, iconOnly = false, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading ?? undefined}
      className={cn(baseStyles, sizes[size], variants[variant], iconOnly && 'p-2', className)}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </>
      ) : children}
    </button>
  );
});

/** Premium button with sparkle effect */
export function MagicButton({ children, className, ...props }: Props) {
  return (
    <Button 
      variant="primary" 
      className={cn('group relative overflow-hidden', className)} 
      {...props as any}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
    </Button>
  );
}

/** Button with arrow animation */
export function SubmitButton({ children, loading, className, ...props }: Props) {
  return (
    <Button variant="primary" loading={loading} className={className} {...props as any}>
      {children}
      {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
    </Button>
  );
}

/** Icon-only quick action button */
export function IconButton({ icon: Icon, className, loading, ...props }: Props & { icon: React.ElementType }) {
  return (
    <Button variant="ghost" iconOnly className={className} {...props as any}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );
}
