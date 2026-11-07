import { useRef, useState } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, ShieldCheck, Zap, Download, Upload, Sun, Moon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ExtractionEvidence } from '@/components/ui/CustomIcons';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { resetDemoData } from '@/lib/storage';
import { exportAccounts, importAccounts, getStoredUsers } from '@/lib/auth';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  hasGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  DEFAULT_GEMINI_MODEL,
} from '@/lib/ai/gemini';
import {
  getGroqApiKey,
  setGroqApiKey,
  hasGroqApiKey,
  getGroqModel,
  setGroqModel,
  DEFAULT_GROQ_MODEL,
} from '@/lib/ai/groq';

export default function Settings() {
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const accountFileRef = useRef<HTMLInputElement>(null);
  const accountCount = getStoredUsers().length;

  const handleExportAccounts = () => {
    const blob = new Blob([exportAccounts()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recrulens-accounts.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Account backup downloaded');
  };

  const handleImportAccounts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const result = importAccounts(await file.text());
      toast.success(`Accounts restored: ${result.added} added, ${result.updated} updated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Account import failed');
    }
  };

  // Gemini state
  const [geminiKey, setLocalGeminiKey] = useState(getGeminiApiKey());
  const [geminiModel, setLocalGeminiModel] = useState(getGeminiModel() || DEFAULT_GEMINI_MODEL);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [geminiMessage, setGeminiMessage] = useState('');

  // Groq state
  const [groqKey, setLocalGroqKey] = useState(getGroqApiKey());
  const [groqModel, setLocalGroqModel] = useState(getGroqModel() || DEFAULT_GROQ_MODEL);
  const [groqStatus, setGroqStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [groqMessage, setGroqMessage] = useState('');

  // Save Gemini
  const handleSaveGemini = () => {
    setGeminiApiKey(geminiKey);
    setGeminiModel(geminiModel);
    toast.success('Gemini AI configuration saved');
  };

  // Test Gemini
  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus('error');
      setGeminiMessage('Please enter a Gemini API key first.');
      return;
    }

    setGeminiStatus('testing');
    setGeminiMessage(`Testing live connection to Google Gemini API using ${geminiModel}...`);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey.trim()}`;
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
      setGeminiStatus('success');
      setGeminiMessage(`Connection verified! Live ${geminiModel} response: "${text?.trim()}"`);
      setGeminiApiKey(geminiKey.trim());
      setGeminiModel(geminiModel);
      toast.success(`Connected to ${geminiModel} successfully`);
    } catch (err: any) {
      setGeminiStatus('error');
      setGeminiMessage(`Gemini connection test failed: ${err.message}. Local fallback will be used.`);
      toast.error('Gemini test failed');
    }
  };

  // Save Groq
  const handleSaveGroq = () => {
    setGroqApiKey(groqKey);
    setGroqModel(groqModel);
    toast.success('Groq LPU configuration saved');
  };

  // Test Groq
  const handleTestGroq = async () => {
    if (!groqKey.trim()) {
      setGroqStatus('error');
      setGroqMessage('Please enter a Groq API key first.');
      return;
    }

    setGroqStatus('testing');
    setGroqMessage(`Testing live inference with Groq ${groqModel}...`);

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey.trim()}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [{ role: 'user', content: 'Respond with OK.' }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        throw new Error(`Groq returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      setGroqStatus('success');
      setGroqMessage(`Groq verified! Fast response: "${text?.trim()}"`);
      setGroqApiKey(groqKey.trim());
      setGroqModel(groqModel);
      toast.success('Connected to Groq LPU successfully');
    } catch (err: any) {
      setGroqStatus('error');
      setGroqMessage(`Groq connection failed: ${err.message}`);
      toast.error('Groq test failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          System & AI Engine Settings
        </h1>
        <p className="text-sm text-neutral-500">
          Configure interface theme, Google Gemini and Groq API keys, model selections, and local persistence.
        </p>
      </div>

      {/* Appearance & Color Theme */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500 dark:hidden" />
            <Moon className="h-5 w-5 text-accent-400 hidden dark:block" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Interface Appearance & Theme</h2>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Select light mode, dark mode, or follow your operating system automatically with zero layout flickering.
          </p>
        </div>
        <ThemeToggle variant="segmented" className="p-1 shrink-0" />
      </Card>

      {/* Groq LPU Acceleration Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Groq LPU Acceleration (Sub-second Inference)
              </h2>
              <p className="text-xs text-neutral-500">
                Primary model: <strong className="text-amber-600 dark:text-amber-400">{groqModel}</strong> for instant text extraction and question generation.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              hasGroqApiKey()
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            {hasGroqApiKey() ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Groq Active
              </>
            ) : (
              'Not Configured'
            )}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              label="Groq API Key"
              type="password"
              value={groqKey}
              onChange={(e) => setLocalGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label htmlFor="groq-model" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Groq Model
            </label>
            <select
              id="groq-model"
              value={groqModel}
              onChange={(e) => setLocalGroqModel(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900 dark:text-white min-h-10"
            >
              <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
              <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
              <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Keys can also be configured in <code className="text-neutral-700 dark:text-neutral-300 font-mono">app/.env</code>.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSaveGroq} className="text-xs">
              Save Config
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={groqStatus === 'testing'}
              onClick={handleTestGroq}
              className="text-xs"
            >
              Test Groq
            </Button>
          </div>
        </div>

        {groqStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
              groqStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : groqStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            {groqStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : groqStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <Spinner size="sm" color="brand" className="shrink-0" />
            )}
            <span>{groqMessage}</span>
          </div>
        )}
      </Card>

      {/* Google Gemini AI Configuration Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <ExtractionEvidence className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Google Gemini API Integration
              </h2>
              <p className="text-xs text-neutral-500">
                Primary model: <strong className="text-blue-600 dark:text-blue-400">{geminiModel}</strong> with offline deterministic fallback.
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

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              label="Gemini API Key"
              type="password"
              value={geminiKey}
              onChange={(e) => setLocalGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="font-mono text-xs"
            />
          </div>
          <div>
            <label htmlFor="gemini-model" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Gemini Model
            </label>
            <select
              id="gemini-model"
              value={geminiModel}
              onChange={(e) => setLocalGeminiModel(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900 dark:text-white min-h-10"
            >
              <option value="gemini-3.6-flash">gemini-3.6-flash (Primary)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Stored locally in browser. If not provided or offline, RecruLens uses embedded semantic scoring heuristics.
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSaveGemini} className="text-xs">
              Save Config
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={geminiStatus === 'testing'}
              onClick={handleTestGemini}
              className="text-xs"
            >
              Test Gemini
            </Button>
          </div>
        </div>

        {geminiStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${
              geminiStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : geminiStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                : 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
            }`}
          >
            {geminiStatus === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : geminiStatus === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            ) : (
              <Spinner size="sm" color="brand" className="shrink-0" />
            )}
            <span>{geminiMessage}</span>
          </div>
        )}
      </Card>

      {/* Account portability: accounts are localStorage-only, so a backup is how they move devices */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Accounts &amp; Sign-in Backup</h2>
            <p className="text-xs text-neutral-500">
              {accountCount} account{accountCount === 1 ? '' : 's'} saved in this browser. Accounts are device-local, so
              download a backup to sign in on another machine or after clearing browser data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExportAccounts}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Accounts
            </Button>
            <Button size="sm" variant="secondary" onClick={() => accountFileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Restore Backup
            </Button>
            <input
              ref={accountFileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={handleImportAccounts}
              aria-label="Choose account backup file"
            />
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          The backup contains salted password hashes, not plain text. Keep it private. Restoring merges accounts by
          email, so an imported password replaces the local one.
        </p>
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
