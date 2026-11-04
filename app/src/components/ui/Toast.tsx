import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface ToastItem { id: number; kind: Kind; message: string; }
const Ctx = createContext<(kind: Kind, message: string) => void>(() => {});
export const useToast = () => {
  const push = useContext(Ctx);
  return { success: (m: string) => push('success', m), error: (m: string) => push('error', m), info: (m: string) => push('info', m) };
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: Kind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, kind, message }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);
  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  const color = { success: 'text-success', error: 'text-danger', info: 'text-info' };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => {
          const I = Icon[t.kind];
          return (
            <div key={t.id} role="status" className="animate-fade-up pointer-events-auto flex max-w-md items-center gap-3 rounded-[var(--radius-sm)] border border-line bg-surface px-4 py-3 text-sm shadow-[var(--shadow-pop)]">
              <I className={`h-5 w-5 shrink-0 ${color[t.kind]}`} aria-hidden="true" /><span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}
