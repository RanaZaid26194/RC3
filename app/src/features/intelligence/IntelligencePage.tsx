import { useState } from 'react';
import { Search, Sparkles, Shield, CheckCircle, GitMerge, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { load, save } from '@/lib/storage';
import type { CandidateProfile } from '@/types';

export default function IntelligencePage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>(load<CandidateProfile[]>('candidates', []));
  const [query, setQuery] = useState('Python developers with REST API experience');
  const [submittedQuery, setSubmittedQuery] = useState(query);
  const [blindMode, setBlindMode] = useState(false);
  const [mergePair, setMergePair] = useState<[CandidateProfile, CandidateProfile] | null>(null);

  const duplicatePairs: [CandidateProfile, CandidateProfile][] = [];
  candidates.forEach((candidate, index) => {
    candidates.slice(index + 1).forEach((other) => {
      const sameEmail = candidate.email.trim().toLowerCase() === other.email.trim().toLowerCase();
      const sameName = candidate.name.trim().toLowerCase().replace(/\s+/g, ' ') === other.name.trim().toLowerCase().replace(/\s+/g, ' ');
      if (sameEmail || sameName) duplicatePairs.push([candidate, other]);
    });
  });

  const matched = candidates.filter((c) => {
    const text = (c.skills.join(' ') + ' ' + c.summary + ' ' + (c.rawResumeText || '')).toLowerCase();
    const qWords = submittedQuery.toLowerCase().split(' ').filter(w => w.length > 2);
    return qWords.some(w => text.includes(w));
  });

  const runSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  };

  const mergeCandidates = (keepId: string) => {
    if (!mergePair) return;
    const keep = mergePair.find((candidate) => candidate.id === keepId) || mergePair[0];
    const discard = mergePair.find((candidate) => candidate.id !== keep.id) || mergePair[1];
    const merged: CandidateProfile = {
      ...keep,
      phone: keep.phone || discard.phone,
      location: keep.location || discard.location,
      summary: keep.summary.length >= discard.summary.length ? keep.summary : discard.summary,
      skills: Array.from(new Set([...keep.skills, ...discard.skills])),
      projects: [...keep.projects, ...discard.projects.filter((project) => !keep.projects.some((item) => item.name.toLowerCase() === project.name.toLowerCase()))],
      rawResumeText: [keep.rawResumeText, discard.rawResumeText].filter(Boolean).join('\n\n') || undefined,
      excerpts: { ...discard.excerpts, ...keep.excerpts },
    };
    const updated = candidates.filter((candidate) => candidate.id !== discard.id && candidate.id !== keep.id);
    const nextCandidates = [merged, ...updated];
    setCandidates(nextCandidates);
    save('candidates', nextCandidates);
    setMergePair(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Advanced Talent Intelligence
          </h1>
          <p className="text-sm text-neutral-500">
            Natural-language semantic candidate search, side-by-side comparison, and fairness/bias safeguards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={blindMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setBlindMode(!blindMode)}
            className="gap-2 text-xs"
          >
            <Shield className="h-4 w-4" />
            {blindMode ? 'Blind Evaluation Active' : 'Enable Blind Evaluation'}
          </Button>
        </div>
      </div>

      <Card className="p-5 space-y-3">
        <label htmlFor="nl-search" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Natural Language Semantic Talent Query
        </label>
        <form className="flex gap-2" onSubmit={runSearch}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="nl-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Senior engineer with high-throughput PostgreSQL and Docker microservices"
              className="pl-9"
            />
          </div>
          <Button type="submit" className="gap-2" disabled={!query.trim()}>
            <Sparkles className="h-4 w-4" /> Run Search
          </Button>
        </form>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Try quick queries:</span>
          {['Python and Docker', 'REST APIs with Redis', 'FastAPI microservices'].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
            >
              "{suggestion}"
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Semantic Matches ({matched.length})
          </h2>
          {blindMode && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Demographic and protected personal traits excluded from ranking
            </span>
          )}
        </div>

        {matched.length === 0 ? (
          <Card className="p-8 text-center text-sm text-neutral-500">
            No candidates match “{submittedQuery}”. Try a broader skills or experience query.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matched.map((cand, idx) => (
            <Card key={cand.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {blindMode ? `Candidate #${idx + 1} (Anonymous)` : cand.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {cand.experienceYears} yrs experience • {cand.education}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Semantic Match
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                {cand.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {cand.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      {duplicatePairs.length > 0 && (
        <Card className="space-y-4 border-amber-200 p-5 dark:border-amber-900/60">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Possible duplicate candidates ({duplicatePairs.length})</h2>
              <p className="mt-1 text-xs text-neutral-500">Review each match before merging. No profile is changed automatically.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {duplicatePairs.map(([first, second]) => (
              <div key={`${first.id}-${second.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="min-w-0 text-xs">
                  <p className="truncate font-semibold text-neutral-900 dark:text-white">{first.name}</p>
                  <p className="truncate text-neutral-500">{first.email}</p>
                  <p className="truncate text-neutral-500">and {second.name}</p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-1.5" onClick={() => setMergePair([first, second])}>
                  <GitMerge className="h-3.5 w-3.5" /> Review merge
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={mergePair !== null}
        title="Review candidate merge"
        onClose={() => setMergePair(null)}
        footer={<Button variant="secondary" onClick={() => setMergePair(null)}>Cancel</Button>}
      >
        {mergePair && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Choose the profile to keep. The other profile will be removed after its unique skills, projects, and resume evidence are combined.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {mergePair.map((candidate) => (
                <button key={candidate.id} type="button" onClick={() => mergeCandidates(candidate.id)} className="rounded-lg border border-neutral-200 p-4 text-left hover:border-brand-500 dark:border-neutral-700">
                  <span className="block font-semibold text-neutral-900 dark:text-white">Keep {candidate.name}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{candidate.email}</span>
                  <span className="mt-2 block text-xs text-neutral-500">{candidate.skills.length} skills · {candidate.projects.length} projects</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
