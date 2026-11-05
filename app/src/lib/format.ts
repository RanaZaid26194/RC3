export const money = (n: number, currency = 'USD', locale = undefined as string | undefined) =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
export const num = (n: number) => new Intl.NumberFormat().format(n);
export const date = (d: string | number | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => new Intl.DateTimeFormat(undefined, opts).format(new Date(d));
export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
