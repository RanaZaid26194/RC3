import { useState } from 'react';
import {
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { calculateCandidateMatch } from '@/lib/ai/matcher';
import { load } from '@/lib/storage';
import type { Job, CandidateProfile, Application } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  job: Job;
  candidates: CandidateProfile[];
}

export function CandidateComparisonModal({
  open,
  onClose,
  job,
  candidates,
}: Props) {
  // Allow picking up to 3 candidates to compare
  const [selectedIds, setSelectedIds] = useState<string[]>(
    candidates.slice(0, 3).map((c) => c.id)
  );

  const comparedCandidates = candidates.filter((c) => selectedIds.includes(c.id));

  // Reuse the score stored with the application so every screen reports the same explainable breakdown.
  const applications = load<Application[]>('applications', []);
  const matchFor = (candidate: CandidateProfile) => {
    const stored = applications.find(
      (app) => app.jobId === job.id && app.candidateId === candidate.id
    );
    return stored?.scoreBreakdown || calculateCandidateMatch(job, candidate);
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Side-by-Side Candidate Comparison: ${job.title}`}
      size="3xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Candidate Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Select Applicants to Compare (max 3):
          </span>
          {candidates.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleSelect(c.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Side-by-Side Matrix Table */}
        <div className="space-y-1">
          <p className="text-[11px] text-neutral-400 sm:hidden">Swipe horizontally to compare columns →</p>
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40">
                <th className="py-3 px-3 font-semibold text-neutral-500 w-44">Evaluation Metric</th>
                {comparedCandidates.map((c) => {
                  const match = matchFor(c);
                  return (
                    <th key={c.id} className="py-3 px-3 font-bold text-neutral-900 dark:text-white min-w-48">
                      <div className="flex items-center justify-between">
                        <span>{c.name}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {match.totalScore}%
                        </span>
                      </div>
                      <p className="text-[10px] font-normal text-neutral-500">{c.education}</p>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {/* Score breakdown row */}
              <tr className="bg-neutral-50/50 dark:bg-neutral-900/40 font-semibold">
                <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300">Weighted Breakdown</td>
                {comparedCandidates.map((c) => {
                  const match = matchFor(c);
                  return (
                    <td key={c.id} className="py-2.5 px-3 text-[11px] text-neutral-700 dark:text-neutral-300">
                      Skills: <strong>{match.skillsScore}/50</strong> | Exp: <strong>{match.experienceScore}/25</strong>
                      <br />
                      Proj: <strong>{match.projectScore}/15</strong> | Edu: <strong>{match.qualificationScore}/10</strong>
                    </td>
                  );
                })}
              </tr>

              {/* Experience tenure row */}
              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-500">Verified Experience</td>
                {comparedCandidates.map((c) => (
                  <td key={c.id} className="py-2.5 px-3">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {c.experienceYears} Years
                    </span>{' '}
                    <span className="text-[10px] text-neutral-400">
                      ({c.experienceYears >= job.minExperienceYears ? 'Meets requirement' : 'Below required'})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Required Skills Matrix */}
              {job.requiredSkills.map((req) => (
                <tr key={req.skill}>
                  <td className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-400">
                    {req.skill} <span className="text-[10px] text-neutral-400">(w:{req.weight})</span>
                  </td>
                  {comparedCandidates.map((c) => {
                    const match = matchFor(c);
                    const evidence = match.matchedSkills.find((m) => m.skill === req.skill);
                    const isMissing = match.missingSkills.includes(req.skill);

                    return (
                      <td key={c.id} className="py-2.5 px-3">
                        {evidence ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <Check className="h-3.5 w-3.5" /> Verified Evidence
                            </span>
                            <p className="text-[10px] text-neutral-500 line-clamp-2 italic">
                              "{evidence.evidence}"
                            </p>
                          </div>
                        ) : isMissing ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-medium text-[11px]">
                            <HelpCircle className="h-3.5 w-3.5" /> Missing Evidence
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-medium text-[11px]">
                            <X className="h-3.5 w-3.5" /> Confirmed Absent
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Key Projects */}
              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-500">Relevant Projects</td>
                {comparedCandidates.map((c) => (
                  <td key={c.id} className="py-2.5 px-3 space-y-1">
                    {c.projects.slice(0, 2).map((p) => (
                      <div key={p.id} className="rounded bg-neutral-100 p-1.5 text-[11px] dark:bg-neutral-800">
                        <strong className="block text-neutral-900 dark:text-white">{p.name}</strong>
                        <span className="text-[10px] text-neutral-500">{p.techStack.join(', ')}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Learning / Gaps */}
              <tr>
                <td className="py-2.5 px-3 font-medium text-neutral-500">Recommended Learning</td>
                {comparedCandidates.map((c) => {
                  const match = matchFor(c);
                  return (
                    <td key={c.id} className="py-2.5 px-3">
                      {match.suggestedLearning.length > 0 ? (
                        <ul className="list-disc list-inside space-y-0.5 text-[10px] text-neutral-500">
                          {match.suggestedLearning.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-semibold">
                          No critical skill gaps detected.
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <Button size="sm" onClick={onClose}>
          Close Comparison
        </Button>
      </div>
      </div>
    </Modal>
  );
}
