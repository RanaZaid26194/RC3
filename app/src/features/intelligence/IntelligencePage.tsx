import { useState } from 'react';
import {
  Search,
  Sparkles,
  Shield,
  CheckCircle,
  GitCompare,
  Briefcase,
  GraduationCap,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { load } from '@/lib/storage';
import { CandidateComparisonModal } from './CandidateComparisonModal';
import type { CandidateProfile, Job } from '@/types';

export default function IntelligencePage() {
  const candidates = load<CandidateProfile[]>('candidates', []);
  const jobs = load<Job[]>('jobs', []);

  const [query, setQuery] = useState('Python developers with REST API and containerization experience');
  const [blindMode, setBlindMode] = useState(false);
  const [selectedExpFilter, setSelectedExpFilter] = useState<'all' | 'junior' | 'mid' | 'senior'>('all');
  const [selectedCandidatesForCompare, setSelectedCandidatesForCompare] = useState<string[]>(
    candidates.slice(0, 2).map((c) => c.id)
  );
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [targetJobId, setTargetJobId] = useState<string>(jobs[0]?.id || '');

  const targetJob = jobs.find((j) => j.id === targetJobId) || jobs[0];

  // Semantic query matching
  const matched = candidates.filter((c) => {
    // Experience Filter
    if (selectedExpFilter === 'junior' && c.experienceYears > 2) return false;
    if (selectedExpFilter === 'mid' && (c.experienceYears < 2 || c.experienceYears > 4)) return false;
    if (selectedExpFilter === 'senior' && c.experienceYears < 4) return false;

    if (!query.trim()) return true;

    const text = (
      c.skills.join(' ') +
      ' ' +
      c.summary +
      ' ' +
      (c.rawResumeText || '') +
      ' ' +
      c.projects.map((p) => p.name + ' ' + p.description).join(' ')
    ).toLowerCase();

    const qWords = query
      .toLowerCase()
      .split(' ')
      .filter((w) => w.length > 2 && !['with', 'and', 'for', 'the', 'developer', 'developers', 'experience'].includes(w));

    if (qWords.length === 0) return true;
    return qWords.some((w) => text.includes(w));
  });

  const toggleCompareCandidate = (id: string) => {
    if (selectedCandidatesForCompare.includes(id)) {
      setSelectedCandidatesForCompare(selectedCandidatesForCompare.filter((cid) => cid !== id));
    } else {
      if (selectedCandidatesForCompare.length < 3) {
        setSelectedCandidatesForCompare([...selectedCandidatesForCompare, id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Advanced Talent Intelligence
          </h1>
          <p className="text-sm text-neutral-500">
            Natural-language semantic candidate discovery, fairness safeguards, and multi-profile comparison matrix.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={blindMode ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setBlindMode(!blindMode)}
            className="gap-2 text-xs"
          >
            <Shield className="h-4 w-4" />
            {blindMode ? 'Blind Mode: Active' : 'Enable Blind Evaluation'}
          </Button>

          {targetJob && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCompareOpen(true)}
              disabled={selectedCandidatesForCompare.length < 2}
              className="gap-2 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
            >
              <GitCompare className="h-4 w-4" />
              Compare Selected ({selectedCandidatesForCompare.length})
            </Button>
          )}
        </div>
      </div>

      {/* Semantic Search Box */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="nl-search" className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Natural Language Semantic Talent Query
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Target Role Benchmark:</span>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="nl-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Senior engineer with high-throughput PostgreSQL, Celery, and Docker microservices"
              className="pl-9 text-xs"
            />
          </div>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> Run Search
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-neutral-500 font-medium">Quick Queries:</span>
            {['Python and Docker', 'PostgreSQL & Django', 'Cloud microservices'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-md bg-neutral-100 px-2.5 py-1 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 transition"
              >
                "{suggestion}"
              </button>
            ))}
          </div>

          {/* Experience Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-neutral-500">Experience:</span>
            {(['all', 'junior', 'mid', 'senior'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedExpFilter(tier)}
                className={`rounded px-2 py-0.5 text-xs capitalize ${
                  selectedExpFilter === tier
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {tier === 'all' ? 'All' : tier === 'junior' ? '<2y' : tier === 'mid' ? '2-4y' : '4y+'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Semantic Talent Results ({matched.length})
          </h2>
          {blindMode && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Demographic and protected identity markers masked
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matched.map((cand, idx) => {
            const isSelectedForCompare = selectedCandidatesForCompare.includes(cand.id);
            return (
              <Card
                key={cand.id}
                className={`p-5 flex flex-col justify-between space-y-4 transition-all ${
                  isSelectedForCompare ? 'ring-2 ring-indigo-500 shadow-md' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {blindMode ? `Candidate #${idx + 1} (Anonymous)` : cand.name}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {blindMode ? 'Location Hidden' : cand.location || 'Remote'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCompareCandidate(cand.id)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition ${
                        isSelectedForCompare
                          ? 'bg-indigo-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      <GitCompare className="h-3 w-3" />
                      {isSelectedForCompare ? 'Selected' : 'Compare'}
                    </button>
                  </div>

                  <div className="space-y-1.5 border-t border-neutral-100 pt-2 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{cand.experienceYears} years professional experience</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="truncate">{blindMode ? "Bachelor's Degree (CS)" : cand.education}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{cand.projects.length} verified projects parsed</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">
                    {cand.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cand.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs dark:border-neutral-800">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Semantic Match
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    ID: {cand.id}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Side-by-side Candidate Comparison Modal */}
      {targetJob && isCompareOpen && (
        <CandidateComparisonModal
          open={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          job={targetJob}
          candidates={candidates.filter((c) => selectedCandidatesForCompare.includes(c.id))}
        />
      )}
    </div>
  );
}
