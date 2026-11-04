import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { seedIfEmpty } from './lib/storage';
import Home from './pages/Home';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { CommandPalette } from './components/ui/CommandPalette';
import { lazy, Suspense } from 'react';
import { NAV } from './components/layout/AppShell';

const KitGallery = import.meta.env.DEV ? lazy(() => import('./pages/_KitGallery')) : null;

// Register seeds BEFORE this runs: import your seed modules and call registerSeed('items', [...]) in them.
seedIfEmpty();

export default function App() {
  return (
    <AppShell>
      <CommandPalette routes={NAV.map((n) => ({ to: n.to, label: n.label }))} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        {KitGallery && <Route path="/kit" element={<Suspense fallback={null}><KitGallery /></Suspense>} />}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
