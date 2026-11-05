// Dependency-free SVG charts (offline-safe, responsive, accessible). Use for dashboards; add a text summary for screen readers.
import { num } from '@/lib/format';

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function BarChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 480, H = 220, pad = 28, bw = (W - pad * 2) / Math.max(1, data.length);
  return (
    <figure>
      <figcaption className="mb-2 text-sm font-semibold">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${num(d.value)}`).join(', ')}`} className="h-auto w-full">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--color-line)" />
        {data.map((d, i) => {
          const h = ((H - pad * 2) * d.value) / max;
          return (
            <g key={d.label}>
              <rect x={pad + i * bw + bw * 0.15} y={H - pad - h} width={bw * 0.7} height={h} rx="4" fill="var(--color-brand-600)" />
              <text x={pad + i * bw + bw / 2} y={H - pad - h - 6} textAnchor="middle" fontSize="11" fill="var(--color-ink)">{num(d.value)}</text>
              <text x={pad + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">{d.label}</text>
            </g>);
        })}
      </svg>
    </figure>
  );
}

export function LineChart({ data, title }: { data: { label: string; value: number }[]; title: string }) {
  const max = Math.max(1, ...data.map((d) => d.value)), min = Math.min(0, ...data.map((d) => d.value));
  const W = 480, H = 220, pad = 28;
  const x = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => H - pad - ((H - pad * 2) * (v - min)) / (max - min || 1);
  const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
  return (
    <figure>
      <figcaption className="mb-2 text-sm font-semibold">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${data.map((d) => `${d.label} ${num(d.value)}`).join(', ')}`} className="h-auto w-full">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--color-line)" />
        <polyline points={pts} fill="none" stroke="var(--color-brand-600)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (<g key={d.label}><circle cx={x(i)} cy={y(d.value)} r="4" fill="var(--color-brand-700)" /><text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">{d.label}</text></g>))}
      </svg>
    </figure>
  );
}
