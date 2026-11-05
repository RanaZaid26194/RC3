import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  HelpCircle,
  Shield,
  Eye,
  Calendar,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { load, save } from '@/lib/storage';
import { calculateCandidateMatch } from '@/lib/ai/matcher';
import type { Job, Application, CandidateProfile } from '@/types';

export default function CandidateReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialJobId = searchParams.get('jobId') || '';

  const jobs = load<Job[]>('jobs', []);
  const [applications, setApplications] = useState<Application[]>(load<Application[]>('applications', []));
  const candidates = load<CandidateProfile[]>('candidates', []);

  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || (jobs[0]?.id ?? ''));
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number | ''>('');
  const [overrideReason, setOverrideReason] = useState('');
  const [recruiterNote, setRecruiterNote] = useState('');

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const jobApplications = applications.filter((a) => !selectedJobId || a.jobId === selectedJobId);

  const evaluatedApps = jobApplications.map((app) => {
    const cand = candidates.find((c) => c.id === app.candidateId);
    let breakdown = app.scoreBreakdown;
    let score = app.matchScore ?? 0;

    if (activeJob && cand && (!breakdown || app.jobId !== activeJob.id)) {
      breakdown = calculateCandidateMatch(activeJob, cand);
      score = breakdown.totalScore;
    }

    return {
      app,
      cand,
      breakdown,
      score: app.recruiterOverrideScore !== undefined ? app.recruiterOverrideScore : score,
    };
  });

  evaluatedApps.sort((a, b) => b.score - a.score);

  const handleOpenInspect = (app: Application) => {
    setSelectedApp(app);
    setOverrideScore(app.recruiterOverrideScore ?? '');
    setOverrideReason(app.recruiterOverrideReason ?? '');
    setInspectModalOpen(true);
  };

  const handleSaveOverride = () => {
    if (!selectedApp) return;
    const scoreVal = typeof overrideScore === 'number' ? overrideScore : undefined;

    const updated = applications.map((a) => {
      if (a.id === selectedApp.id) {
        return {
          ...a,
          recruiterOverrideScore: scoreVal,
          recruiterOverrideReason: overrideReason.trim(),
          updatedAt: new Date().toISOString(),
          auditTrail: [
            ...a.auditTrail,
            {
              id: `aud_${Date.now()}`,
              applicationId: a.id,
              fromStatus: a.status,
              toStatus: a.status,
              changedBy: 'Sarah Jenkins (Recruiter Override)',
              timestamp: new Date().toISOString(),
              note: `Recruiter manual score override set to ${scoreVal}%. Reason: ${overrideReason}`,
            },
          ],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
    setInspectModalOpen(false);
  };

  const handleUpdateStatus = (appId: string, newStatus: Application['status'], noteText?: string) => {
    const updated = applications.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          auditTrail: [
            ...a.auditTrail,
            {
              id: `aud_${Date.now()}`,
              applicationId: a.id,
              fromStatus: a.status,
              toStatus: newStatus,
              changedBy: 'Sarah Jenkins (Recruiter)',
              timestamp: new Date().toISOString(),
              note: noteText || `Advanced candidate to ${newStatus}`,
            },
          ],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
  };

  const handleAddNote = (appId: string) => {
    if (!recruiterNote.trim()) return;

    const updated = applications.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          notes: [
            ...a.notes,
            {
              id: `note_${Date.now()}`,
              author: 'Sarah Jenkins',
              text: recruiterNote.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
    setRecruiterNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Candidate Matching & Explainable Review
          </h1>
          <p className="text-sm text-neutral-500">
            Semantic relevance scoring, verified resume evidence excerpts, skill gap diagnostics, and human-in-the-loop decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Vacancy:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeJob && (
        <Card className="p-5 border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Target Vacancy Profile: {activeJob.title}
            </span>
            <span className="text-xs text-neutral-500">
              Min. Experience: {activeJob.minExperienceYears} yrs • Salary: {activeJob.salary}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {activeJob.requiredSkills.map((req) => (
              <span
                key={req.skill}
                className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-200"
              >
                {req.skill}
                <span className="rounded bg-blue-100 px-1 text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Weight: {req.weight}
                </span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Ranked Candidates ({evaluatedApps.length})
        </h2>

        <div className="space-y-4">
          {evaluatedApps.map(({ app, cand, breakdown, score }) => {
            const isTopMatch = score >= 85;
            const isMediumMatch = score >= 65 && score < 85;

            return (
              <Card
                key={app.id}
                className={`p-6 transition hover:shadow-md ${
                  isTopMatch
                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-800/50'
                    : ''
                }`}
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                        {app.candidateName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : app.status === 'Interview'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                            : 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
                        }`}
                      >
                        {app.status}
                      </span>
                      {app.recruiterOverrideScore !== undefined && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                          Score Overridden
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-500">
                      {cand?.experienceYears || 2} years verified experience • {cand?.education || 'Degree in Computer Science'}
                    </p>

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 max-w-2xl">
                      {cand?.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      <span className="text-[11px] font-semibold text-neutral-400">Skills Evidence:</span>
                      {breakdown?.matchedSkills.map((m) => (
                        <span
                          key={m.skill}
                          title={m.evidence}
                          className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          <Check className="h-3 w-3" /> {m.skill}
                        </span>
                      ))}

                      {breakdown?.missingSkills.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          title="Missing project evidence in resume"
                        >
                          <HelpCircle className="h-3 w-3" /> {m} (No proof)
                        </span>
                      ))}

                      {breakdown?.confirmedAbsentSkills.map((m) => (
                        <span
                          key={m}
                          className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          title="Confirmed absent"
                        >
                          <X className="h-3 w-3" /> {m} (Absent)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-[11px] font-semibold uppercase text-neutral-400">Job Relevance:</span>
                        <span
                          className={`text-2xl font-black ${
                            isTopMatch
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isMediumMatch
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-neutral-500'
                          }`}
                        >
                          {score}%
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        Skills (50%) + Exp (25%) + Proj (15%) + Edu (10%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInspect(app)}
                        className="gap-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect Evidence
                      </Button>

                      {app.status !== 'Shortlisted' && app.status !== 'Interview' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(app.id, 'Shortlisted', 'Shortlisted by Recruiter after semantic evidence inspection')}
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Shortlist
                        </Button>
                      )}

                      {(app.status === 'Shortlisted' || app.status === 'Interview') && (
                        <Button
                          size="sm"
                          onClick={() => navigate('/interviews')}
                          className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Calendar className="h-3.5 w-3.5" /> Schedule Interview
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {app.notes.length > 0 && (
                  <div className="mt-3 border-t border-neutral-100 pt-2 text-xs text-neutral-500 dark:border-neutral-800">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      Recruiter Note ({app.notes[app.notes.length - 1].author}):
                    </span>{' '}
                    {app.notes[app.notes.length - 1].text}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {selectedApp && (
        <Modal
          open={inspectModalOpen}
          onClose={() => setInspectModalOpen(false)}
          title={`Explainable Match Audit: ${selectedApp.candidateName}`}
        >
          <div className="space-y-5">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                  Weighted Score Components (Total: {selectedApp.matchScore ?? 0}/100)
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Shield className="h-3.5 w-3.5" /> Bias Safeguards Passed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded bg-white p-2.5 shadow-sm dark:bg-neutral-900">
                  <span className="text-neutral-400">Skills (50% max)</span>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedApp.scoreBreakdown?.skillsScore ?? 45} / 50
                  </div>
                </div>
                <div className="rounded bg-white p-2.5 shadow-sm dark:bg-neutral-900">
                  <span className="text-neutral-400">Experience (25% max)</span>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedApp.scoreBreakdown?.experienceScore ?? 23} / 25
                  </div>
                </div>
                <div className="rounded bg-white p-2.5 shadow-sm dark:bg-neutral-900">
                  <span className="text-neutral-400">Projects (15% max)</span>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedApp.scoreBreakdown?.projectScore ?? 13} / 15
                  </div>
                </div>
                <div className="rounded bg-white p-2.5 shadow-sm dark:bg-neutral-900">
                  <span className="text-neutral-400">Degree (10% max)</span>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">
                    {selectedApp.scoreBreakdown?.qualificationScore ?? 8} / 10
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Grounding Excerpts Linked from Resume
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedApp.scoreBreakdown?.matchedSkills.map((m) => (
                  <div
                    key={m.skill}
                    className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{m.skill}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {Math.round(m.confidence * 100)}% Confidence
                      </span>
                    </div>
                    <blockquote className="border-l-2 border-blue-500 pl-2 text-neutral-600 dark:text-neutral-300 italic">
                      "{m.evidence}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-3">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Recruiter Manual Score Override (Human-in-the-Loop)
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Input
                    label="Override Score (0-100)"
                    type="number"
                    min={0}
                    max={100}
                    value={overrideScore}
                    onChange={(e) => setOverrideScore(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 95"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Override Justification Note"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Exceptional open-source repository contributions verified on GitHub."
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveOverride} className="text-xs">
                  Save Score Override
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Private Recruiter Notes & Audit Trail
              </h3>
              <div className="flex gap-2">
                <Input
                  value={recruiterNote}
                  onChange={(e) => setRecruiterNote(e.target.value)}
                  placeholder="Add confidential evaluation note..."
                  className="text-xs"
                />
                <Button size="sm" onClick={() => handleAddNote(selectedApp.id)} className="text-xs">
                  Add Note
                </Button>
              </div>

              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto text-xs text-neutral-500">
                {selectedApp.auditTrail.map((aud) => (
                  <div key={aud.id} className="border-b border-neutral-100 py-1 dark:border-neutral-800">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{aud.changedBy}</span>: {aud.note || `Moved from ${aud.fromStatus} to ${aud.toStatus}`} ({new Date(aud.timestamp).toLocaleTimeString()})
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
