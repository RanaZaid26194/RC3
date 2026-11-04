// DEV-ONLY component gallery (route /kit exists only in `npm run dev`; it is never in the production build).
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Card, Badge } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Tabs } from '@/components/ui/Tabs';
import { BarChart, LineChart, StatCard } from '@/components/ui/Charts';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';

const rows = Array.from({ length: 23 }, (_, i) => ({ id: String(i), name: `Item ${i + 1}`, qty: (i * 7) % 11, status: i % 3 ? 'Active' : 'Paused' }));
export default function KitGallery() {
  const toast = useToast();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Component gallery (dev only)</h1>
      <Card className="flex flex-wrap gap-3 p-4">
        <Button onClick={() => toast.success('Saved')}>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button><Button loading>Loading</Button>
        <Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge><Badge tone="info">Info</Badge>
      </Card>
      <Card className="grid gap-4 p-4 sm:grid-cols-2">
        <Input label="Name" hint="Helper text" placeholder="Jane Doe" /><Input label="Email" error="Enter a valid email address" defaultValue="oops" />
        <Select label="Category"><option>One</option><option>Two</option></Select><Textarea label="Notes" />
      </Card>
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Revenue" value="$12,480" hint="+8% this week" /><StatCard label="Orders" value="214" /><StatCard label="Rating" value="4.8" /></div>
      <div className="grid gap-6 sm:grid-cols-2"><Card className="p-4"><BarChart title="Weekly orders" data={[{ label: 'Mon', value: 12 }, { label: 'Tue', value: 19 }, { label: 'Wed', value: 7 }, { label: 'Thu', value: 24 }]} /></Card>
        <Card className="p-4"><LineChart title="Trend" data={[{ label: 'W1', value: 3 }, { label: 'W2', value: 8 }, { label: 'W3', value: 6 }, { label: 'W4', value: 14 }]} /></Card></div>
      <Tabs label="Demo tabs" tabs={[{ id: 'a', label: 'Table', content: <DataTable caption="items" rows={rows} rowKey={(r) => r.id} pageSize={8} searchText={(r) => `${r.name} ${r.status}`}
        columns={[{ key: 'name', header: 'Name', sortValue: (r) => r.name }, { key: 'qty', header: 'Qty', sortValue: (r) => r.qty }, { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'Active' ? 'success' : 'warning'}>{r.status}</Badge> }]} /> },
        { id: 'b', label: 'States', content: <div className="grid gap-4 sm:grid-cols-2"><EmptyState title="Empty" message="Nothing here yet." /><ErrorState onRetry={() => {}} /><Skeleton className="h-24" /></div> }]} />
    </div>
  );
}
