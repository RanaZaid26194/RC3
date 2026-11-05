// Safe persistence layer (localStorage) with versioned keys, seeding and reset.
// Swap internals for IndexedDB/SQLite/API if the problem statement needs it; keep this interface so screens don't change.
const NS = 'app:v1:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota or privacy mode: callers should show an error toast
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Register seed data per collection. On first run (or after reset) seeds are written. */
type Seed = { key: string; data: unknown };
const seeds: Seed[] = [];
export function registerSeed(key: string, data: unknown) { seeds.push({ key, data }); }

export function seedIfEmpty() {
  if (load<boolean>('__seeded', false)) return;
  seeds.forEach((s) => save(s.key, s.data));
  save('__seeded', true);
}

export function resetDemoData() {
  Object.keys(localStorage).filter((k) => k.startsWith(NS)).forEach((k) => localStorage.removeItem(k));
  seeds.forEach((s) => save(s.key, s.data));
  save('__seeded', true);
}
