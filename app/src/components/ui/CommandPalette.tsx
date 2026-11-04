import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export interface Command { id: string; label: string; hint?: string; run: () => void; }
/** Ctrl/Cmd+K palette. Add app actions via the `extra` prop (e.g. "New booking", "Export CSV"). Great low-cost wow + accessibility feature. */
export function CommandPalette({ routes, extra = [] }: { routes: { to: string; label: string }[]; extra?: Command[] }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const all: Command[] = useMemo(() => [...routes.map((r) => ({ id: r.to, label: `Go to ${r.label}`, run: () => nav(r.to) })), ...extra], [routes, extra, nav]);
  const list = all.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); setQ(''); setIdx(0); } if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open) return null;
  const choose = (c?: Command) => { if (c) { c.run(); setOpen(false); } };
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-ink/40 p-4 pt-[15vh]" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="animate-fade-up w-full max-w-lg overflow-hidden rounded-[var(--radius-md)] bg-surface shadow-[var(--shadow-pop)]">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          <input autoFocus aria-label="Type a command" placeholder="Type a command or search..." value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, list.length - 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); } if (e.key === 'Enter') choose(list[idx]); }}
            className="min-h-12 w-full bg-transparent text-sm outline-none" />
        </div>
        <ul role="listbox" className="max-h-72 overflow-y-auto p-2">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-ink-muted">No matching commands</li>}
          {list.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === idx} onMouseEnter={() => setIdx(i)} onClick={() => choose(c)}
              className={`flex min-h-11 cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-3 text-sm ${i === idx ? 'bg-brand-100 text-brand-900' : ''}`}>
              <span>{c.label}</span>{c.hint && <span className="text-xs text-ink-muted">{c.hint}</span>}
            </li>))}
        </ul>
        <p className="border-t border-line px-4 py-2 text-xs text-ink-muted">Arrows to move, Enter to run, Esc to close</p>
      </div>
    </div>
  );
}
