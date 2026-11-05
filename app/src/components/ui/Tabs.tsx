import { useState, type ReactNode, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export function Tabs({ tabs, label }: { tabs: { id: string; label: string; content: ReactNode }[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setActive(tabs[n].id); (document.getElementById(`tab-${tabs[n].id}`) as HTMLElement | null)?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t, i) => (
          <button key={t.id} id={`tab-${t.id}`} role="tab" type="button" aria-selected={active === t.id} aria-controls={`panel-${t.id}`} tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={cn('min-h-11 whitespace-nowrap border-b-2 px-4 text-sm font-medium transition', active === t.id ? 'border-brand-600 text-brand-900' : 'border-transparent text-ink-muted hover:text-ink')}>{t.label}</button>))}
      </div>
      {tabs.map((t) => <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-4">{active === t.id && t.content}</div>)}
    </div>
  );
}
