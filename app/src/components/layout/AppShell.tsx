import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Home, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../ui/Button';

// TODO: replace with real product name + navigation items (keep it under ~6).
export const APP_NAME = 'App Name';
export const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const link = ({ isActive }: { isActive: boolean }) => cn(
    'flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 text-sm font-medium transition',
    isActive ? 'bg-brand-100 text-brand-900' : 'text-ink-muted hover:bg-brand-50 hover:text-ink');
  const nav = (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: I }) => (
        <NavLink key={to} to={to} end={to === '/'} className={link} onClick={() => setOpen(false)}>
          <I className="h-5 w-5" aria-hidden="true" />{label}
        </NavLink>))}
    </nav>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lg">Skip to main content</a>
      <aside className="hidden border-r border-line bg-surface p-4 lg:block">
        <div className="mb-6 flex items-center gap-2 px-2 pt-2 font-display text-xl font-semibold"><Sparkles className="h-6 w-6 text-brand-600" aria-hidden="true" />{APP_NAME}</div>
        {nav}
      </aside>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-surface px-4 py-2 lg:hidden">
        <span className="flex items-center gap-2 font-display text-lg font-semibold"><Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />{APP_NAME}</span>
        <Button variant="ghost" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </Button>
      </header>
      {open && <div className="animate-fade-up border-b border-line bg-surface p-3 lg:hidden">{nav}</div>}
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
