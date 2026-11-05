import React, { useState } from 'react';
import { cn } from '@/lib/cn';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function RippleButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  const variantClasses = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 shadow-lg shadow-brand-500/30',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700',
    ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-md)] font-medium transition-all duration-200 ease-out-expo hover:scale-[1.02] active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute animate-ripple block rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '10px',
            height: '10px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
