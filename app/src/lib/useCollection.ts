import { useCallback, useEffect, useState } from 'react';
import { load, save, uid } from './storage';

/** Generic persisted CRUD collection: const { items, add, update, remove } = useCollection<Item>('items'). */
export function useCollection<T extends { id: string }>(key: string) {
  const [items, setItems] = useState<T[]>(() => load<T[]>(key, []));

  useEffect(() => { save(key, items); }, [key, items]);
  // keep tabs in sync
  useEffect(() => {
    const onStorage = () => setItems(load<T[]>(key, []));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const add = useCallback((data: Omit<T, 'id'>) => {
    const item = { ...data, id: uid(key) } as T;
    setItems((prev) => [item, ...prev]);
    return item;
  }, [key]);
  const update = useCallback((id: string, patch: Partial<T>) => setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i))), []);
  const remove = useCallback((id: string) => setItems((p) => p.filter((i) => i.id !== id)), []);
  const reload = useCallback(() => setItems(load<T[]>(key, [])), [key]);

  return { items, add, update, remove, reload, setItems };
}
