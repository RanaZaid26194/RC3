import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';
import { EmptyState } from './States';

export interface Column<T> { key: string; header: string; render?: (row: T) => ReactNode; sortValue?: (row: T) => string | number; className?: string; }
interface Props<T> {
  rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; searchText?: (r: T) => string; pageSize?: number;
  emptyTitle?: string; emptyMessage?: string; toolbar?: ReactNode; caption: string;
}

/** Sortable, searchable, paginated table. On narrow screens it scrolls inside its own container (no page overflow). */
export function DataTable<T>({ rows, columns, rowKey, searchText, pageSize = 10, emptyTitle = 'No results', emptyMessage = 'Try a different search or filter.', toolbar, caption }: Props<T>) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = s && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(s)) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        const f = col.sortValue;
        out = [...out].sort((a, b) => { const x = f(a), y = f(b); const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)); return sort.dir === 'asc' ? c : -c; });
      }
    }
    return out;
  }, [rows, q, sort, columns, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * pageSize, cur * pageSize + pageSize);
  const toggle = (key: string) => { setPage(0); setSort((p) => (p?.key === key ? (p.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' })); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {searchText && (
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input type="search" aria-label={`Search ${caption}`} placeholder="Search..." value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
              className="min-h-11 w-full rounded-[var(--radius-sm)] border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-brand-500" />
          </div>)}
        {toolbar}
      </div>
      {filtered.length === 0 ? <EmptyState title={emptyTitle} message={emptyMessage} /> : (
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line bg-surface text-ink">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead className="border-b border-line bg-canvas text-xs uppercase tracking-wide text-ink-muted">
              <tr>{columns.map((c) => (
                <th key={c.key} scope="col" className={cn('px-4 py-3 font-semibold', c.className)} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortValue ? (
                    <button type="button" onClick={() => toggle(c.key)} className="inline-flex min-h-8 items-center gap-1 uppercase tracking-wide hover:text-ink">
                      {c.header}{sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />)}
                    </button>) : c.header}
                </th>))}</tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={rowKey(r)} className="border-b border-line last:border-0 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors">
                  {columns.map((c) => <td key={c.key} className={cn('px-4 py-3 text-ink', c.className)}>{c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? '')}</td>)}
                </tr>))}
            </tbody>
          </table>
        </div>)}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>{filtered.length} results, page {cur + 1} of {pages}</span>
          <div className="flex gap-2">
            <Button variant="secondary" aria-label="Previous page" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></Button>
            <Button variant="secondary" aria-label="Next page" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
        </div>)}
    </div>
  );
}
