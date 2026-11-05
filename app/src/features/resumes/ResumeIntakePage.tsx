import { useMemo, useState } from 'react';
import { Upload, CheckCircle2, Users, Sparkles, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { load, save } from '@/lib/storage';
import { ResumeUploader } from './ResumeUploader';
import type { CandidateProfile } from '@/types';

export default function ResumeIntakePage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => load<CandidateProfile[]>('candidates', []));
  const [status, setStatus] = useState<string | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);

  const recent = useMemo(
    () => [...candidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
    [candidates]
  );

  const handleParsed = (profile: CandidateProfile) => {
    const updated = [profile, ...candidates];
    setCandidates(updated);
    save('candidates', updated);
    setStatus(`${profile.name} was parsed and saved to the candidate pool.`);
    setUploaderKey((key) => key + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Resume Intake &amp; Parsing
        </h1>
        <p className="text-sm text-neutral-500">
          Upload PDF, DOCX, or text resumes. Text is extracted in your browser, entities are normalized,
          and every field stays editable before it enters the candidate pool.
        </p>
      </div>

      {status && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{status}</span>
          <button
            type="button"
            onClick={() => setStatus(null)}
            className="ml-auto text-emerald-700 underline hover:no-underline dark:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <Upload className="h-5 w-5 text-brand-600" /> Parse a new resume
          </h2>
          <ResumeUploader
            key={uploaderKey}
            onParsed={handleParsed}
            submitLabel="Save to Candidate Pool"
          />
        </Card>

        <Card className="h-fit space-y-4 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-brand-600" /> What gets extracted
          </h2>
          <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
            {[
              'Name, email, and phone number',
              'Normalized skill tags (aliases mapped, e.g. k8s → Kubernetes)',
              'Years of experience and education line',
              'Project descriptions used as matching evidence',
              'Exact resume quotes for explainability',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
            Files never leave this device. Parsing and storage stay in your browser.
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <Users className="h-5 w-5 text-neutral-500" /> Candidate pool ({candidates.length})
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">No candidates yet. Upload a resume to get started.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col gap-2 border-b border-neutral-200 pb-3 last:border-0 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-semibold text-white">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900 dark:text-white">{candidate.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {candidate.email || 'Email not detected'}
                      {candidate.location ? ` • ${candidate.location}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {candidate.experienceYears ? `${candidate.experienceYears} yrs` : 'Experience not detected'} •{' '}
                    {candidate.skills.length} skills
                  </p>
                  <p className="truncate text-[11px] text-neutral-500">
                    {candidate.skills.slice(0, 5).join(' · ') || 'No known skills detected'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
