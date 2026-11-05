import { useState } from 'react';
import { RotateCcw, Sparkles, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { resetDemoData } from '@/lib/storage';
import { getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey } from '@/lib/ai/gemini';

export default function Settings() {
  const [confirm, setConfirm] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const toast = useToast();

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKey);
    toast.success('Gemini API key saved');
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing live connection to Google Gemini API...');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the word OK.' }] }],
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setTestStatus('success');
      setTestMessage(`Connection verified! Live Gemini model response: "${text?.trim()}"`);
      setGeminiApiKey(apiKey.trim());
      toast.success('Gemini AI connected successfully');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Connection test failed: ${err.message}. Local AI rule fallback will be used.`);
      toast.error('Connection test failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          System & AI Engine Settings
        </h1>
        <p className="text-sm text-neutral-500">
          Configure Google Gemini API keys, monitor AI status, and manage local application persistence.
        </p>
      </div>

      {/* Gemini AI Configuration Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Google Gemini API Integration
              </h2>
              <p className="text-xs text-neutral-500">
                Powers real-time semantic extraction, intelligent question generation, and candidate reasoning.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              hasGeminiApiKey()
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
            }`}
          >
            {hasGeminiApiKey() ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Live Gemini Active
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5" /> Local Rule Fallback Active
              </>
            )}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              label="Gemini API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 font-mono text-xs"
            />
            <div className="flex items-end gap-2">
              <Button size="sm" onClick={handleSaveApiKey} className="text-xs">
                Save Key
              </Button>
              <Button
                size="sm"
                variant="outline"
                loading={testStatus === 'testing'}
                onClick={handleTestConnection}
                className="text-xs"
              >
                Test Connection
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400">
            Stored locally in your browser. If not provided or offline, RecruLens automatically uses its embedded NLP and semantic scoring algorithms.
          </p>

          {testStatus !== 'idle' && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              ) : (
                <Sparkles className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
              )}
              <span>{testMessage}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Demo Data Management */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Demo Data Reset</h2>
          <p className="text-xs text-neutral-500">
            Restore original seed vacancies, candidate resumes, and interview schedules.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setConfirm(true)}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset Demo Data
        </Button>
      </Card>

      <ConfirmDialog
        open={confirm}
        title="Reset demo data?"
        message="This restores the sample vacancies and candidates, removing any newly created jobs or applications."
        confirmLabel="Reset"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          resetDemoData();
          setConfirm(false);
          toast.success('Demo data restored');
          setTimeout(() => location.reload(), 600);
        }}
      />
    </div>
  );
}
