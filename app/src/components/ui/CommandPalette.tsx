import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { setTheme } from '@/lib/theme';

export interface Command { id: string; label: string; hint?: string; run: () => void; }

/** Ctrl/Cmd+K palette mounted via portal at root body for unconstrained 100vw backdrop and exact viewport centering. */
export function CommandPalette({ routes, extra = [] }: { routes: { to: string; label: string }[]; extra?: Command[] }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const themeCommands: Command[] = useMemo(() => [
    { id: 'theme-dark', label: 'Theme: Switch to Dark Mode', hint: 'Dark', run: () => setTheme('dark') },
    { id: 'theme-light', label: 'Theme: Switch to Light Mode', hint: 'Light', run: () => setTheme('light') },
    { id: 'theme-system', label: 'Theme: Follow System Preference', hint: 'Auto', run: () => setTheme('system') },
  ], []);

  const all: Command[] = useMemo(() => [
    ...routes.map((r) => ({ id: r.to, label: `Go to ${r.label}`, run: () => nav(r.to) })),
    ...themeCommands,
    ...extra
  ], [routes, extra, nav, themeCommands]);
  const list = all.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQ('');
        setIdx(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;
  const choose = (c?: Command) => { if (c) { c.run(); setOpen(false); } };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-[15vh] transition-opacity duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div role="document" aria-label="Command palette" className="animate-modal-pop w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 border-b border-neutral-200 dark:border-neutral-800 px-4">
          <Search className="h-4 w-4 text-neutral-400 shrink-0" aria-hidden="true" />
          <input
            autoFocus
            aria-label="Type a command"
            placeholder="Type a command or navigate..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === 'Enter') choose(list[idx]);
            }}
            className="min-h-12 w-full bg-transparent text-sm outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
        </div>
        <ul role="listbox" className="max-h-72 overflow-y-auto p-2">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-neutral-500">No matching commands</li>}
          {list.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={i === idx}
              onMouseEnter={() => setIdx(i)}
              onClick={() => choose(c)}
              className={`flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-3 text-sm transition-colors ${
                i === idx
                  ? 'bg-brand-50 text-brand-900 dark:bg-brand-950/60 dark:text-brand-300 font-medium'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{c.label}</span>
              {c.hint && <span className="text-xs text-neutral-400">{c.hint}</span>}
            </li>
          ))}
        </ul>
        <p className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 text-[11px] text-neutral-500">
          Arrows to navigate, Enter to select, Esc to close
        </p>
      </div>
    </div>,
    document.body
  );
}
