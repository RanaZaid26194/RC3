import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { resetDemoData } from '@/lib/storage';

export default function Settings() {
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Demo data</h2>
          <p className="text-sm text-ink-muted">Restore the original sample data. Your changes will be removed.</p>
        </div>
        <Button variant="secondary" onClick={() => setConfirm(true)}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset demo data</Button>
      </Card>
      <ConfirmDialog open={confirm} title="Reset demo data?" message="This restores the sample data and removes anything you added." confirmLabel="Reset"
        onCancel={() => setConfirm(false)}
        onConfirm={() => { resetDemoData(); setConfirm(false); toast.success('Demo data restored'); setTimeout(() => location.reload(), 600); }} />
    </div>
  );
}
