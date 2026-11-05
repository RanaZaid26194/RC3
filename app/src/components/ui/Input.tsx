import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps { label: string; error?: string; hint?: string; }
const base = 'w-full min-h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-sm text-ink placeholder:text-ink-muted/70 transition';

function Field({ id, label, error, hint, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-ink-muted">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
const aria = (id: string, error?: string, hint?: string) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-err` : hint ? `${id}-hint` : undefined,
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, error, hint, className, ...rest }, ref) {
    const id = useId();
    return (
      <Field id={id} label={label} error={error} hint={hint}>
        <input ref={ref} id={id} {...aria(id, error, hint)} className={cn(base, error ? 'border-danger' : 'border-line', className)} {...rest} />
      </Field>
    );
  });

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  function Textarea({ label, error, hint, className, ...rest }, ref) {
    const id = useId();
    return (
      <Field id={id} label={label} error={error} hint={hint}>
        <textarea ref={ref} id={id} {...aria(id, error, hint)} className={cn(base, 'py-2 min-h-24', error ? 'border-danger' : 'border-line', className)} {...rest} />
      </Field>
    );
  });

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  function Select({ label, error, hint, className, children, ...rest }, ref) {
    const id = useId();
    return (
      <Field id={id} label={label} error={error} hint={hint}>
        <select ref={ref} id={id} {...aria(id, error, hint)} className={cn(base, error ? 'border-danger' : 'border-line', className)} {...rest}>{children}</select>
      </Field>
    );
  });
