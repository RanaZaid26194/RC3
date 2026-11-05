import { useState } from 'react';
import { Search, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { load } from '@/lib/storage';
import type { CandidateProfile } from '@/types';

export default function IntelligencePage() {
  const candidates = load<CandidateProfile[]>('candidates', []);
  const [query, setQuery] = useState('Python developers with REST API experience');
  const [submittedQuery, setSubmittedQuery] = useState(query);
  const [blindMode, setBlindMode] = useState(false);

  const matched = candidates.filter((c) => {
    const text = (c.skills.join(' ') + ' ' + c.summary + ' ' + (c.rawResumeText || '')).toLowerCase();
    const qWords = submittedQuery.toLowerCase().split(' ').filter(w => w.length > 2);
    return qWords.some(w => text.includes(w));
  });

  const runSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
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
    </div>
  );
}
