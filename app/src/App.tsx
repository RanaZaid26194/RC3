import { AppShell } from './components/layout/AppShell';
import { seedIfEmpty } from './lib/storage';
import { CommandPalette } from './components/ui/CommandPalette';
import { PageTransition } from './components/ui/Motion';
import { NAV_ITEMS } from './app/nav';
import { AppRoutes } from './app/routes';

// Import seed modules so they register with storage before seedIfEmpty()
import './data/seed.a';
import './data/seed.b';

seedIfEmpty();

export default function App() {
  return (
    <AppShell>
      <CommandPalette routes={NAV_ITEMS.map((n) => ({ to: n.to, label: n.label }))} />
      <PageTransition>
        <AppRoutes />
      </PageTransition>
    </AppShell>
  );
}
