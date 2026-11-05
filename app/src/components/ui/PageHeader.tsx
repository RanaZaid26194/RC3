import { cn } from '@/lib/cn';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 animate-fade-up', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

interface PageContentProps {
  children: ReactNode;
  className?: string;
}

export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn('animate-fade-up', className)}>{children}</div>;
}

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn('animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700', className)} />;
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}
