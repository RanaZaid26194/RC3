import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';

// TODO: Replace with the real first screen. It must explain the product in 5 seconds and show real seeded content.
export default function Home() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold sm:text-4xl">Welcome</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">Replace this starter screen with the product's first screen.</p>
      </header>
      <Card className="p-6"><EmptyState title="Nothing here yet" message="Build the main workflow here and seed realistic demo data." /></Card>
    </div>
  );
}
