import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  XCircle,
  History,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { load, save } from '@/lib/storage';
import type { Job, Application, PipelineStatus, AuditLogEntry } from '@/types';

const PIPELINE_COLUMNS: { status: PipelineStatus; label: string; color: string }[] = [
  { status: 'Submitted', label: '1. Submitted', color: 'border-neutral-300' },
  { status: 'Parsed', label: '2. Parsed', color: 'border-blue-300' },
  { status: 'AI Assessment Available', label: '3. AI Assessed', color: 'border-indigo-400' },
  { status: 'Recruiter Review', label: '4. Recruiter Review', color: 'border-amber-400' },
  { status: 'Shortlisted', label: '5. Shortlisted', color: 'border-emerald-500' },
  { status: 'Interview', label: '6. Interview', color: 'border-purple-500' },
  { status: 'Selected', label: '7. Selected / Hired', color: 'border-teal-600' },
];

export default function PipelinePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterJobId = searchParams.get('jobId') || '';

  const jobs = load<Job[]>('jobs', []);
  const [applications, setApplications] = useState<Application[]>(load<Application[]>('applications', []));
  const [selectedJobId, setSelectedJobId] = useState<string>(filterJobId || (jobs[0]?.id ?? ''));

  // Modals state
  const [auditModalApp, setAuditModalApp] = useState<Application | null>(null);
  const [noteModalApp, setNoteModalApp] = useState<Application | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const filteredApps = applications.filter((a) => !selectedJobId || a.jobId === selectedJobId);

  const getNextStage = (current: PipelineStatus): PipelineStatus | null => {
    switch (current) {
      case 'Submitted':
        return 'Parsed';
      case 'Parsed':
        return 'AI Assessment Available';
      case 'AI Assessment Available':
        return 'Recruiter Review';
      case 'Recruiter Review':
        return 'Shortlisted';
      case 'Shortlisted':
        return 'Interview';
      case 'Interview':
        return 'Selected';
      default:
        return null;
    }
  };

  const handleAdvanceStage = (appId: string, targetStatus?: PipelineStatus) => {
    const updated = applications.map((a) => {
      if (a.id === appId) {
        const next = targetStatus || getNextStage(a.status);
        if (!next) return a;

        const newAudit: AuditLogEntry = {
          id: `aud_${Date.now()}`,
          applicationId: a.id,
          fromStatus: a.status,
          toStatus: next,
          changedBy: 'Sarah Jenkins (Recruiter)',
          timestamp: new Date().toISOString(),
          note: `Stage transitioned from ${a.status} to ${next}`,
        };

        return {
          ...a,
          status: next,
          updatedAt: new Date().toISOString(),
          auditTrail: [...a.auditTrail, newAudit],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
  };

  const handleReject = (appId: string) => {
    const updated = applications.map((a) => {
      if (a.id === appId) {
        const newAudit: AuditLogEntry = {
          id: `aud_${Date.now()}`,
          applicationId: a.id,
          fromStatus: a.status,
          toStatus: 'Rejected',
          changedBy: 'Sarah Jenkins (Recruiter)',
          timestamp: new Date().toISOString(),
          note: 'Application rejected by recruiter.',
        };

        return {
          ...a,
          status: 'Rejected' as PipelineStatus,
          updatedAt: new Date().toISOString(),
          auditTrail: [...a.auditTrail, newAudit],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
  };

  const handleSaveNote = () => {
    if (!noteModalApp || !newNoteText.trim()) return;

    const updated = applications.map((a) => {
      if (a.id === noteModalApp.id) {
        return {
          ...a,
          notes: [
            ...a.notes,
            {
              id: `note_${Date.now()}`,
              author: 'Sarah Jenkins',
              text: newNoteText.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return a;
    });

    setApplications(updated);
    save('applications', updated);
    setNewNoteText('');
    setNoteModalApp(null);
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Application Pipeline & Stage Progression
          </h1>
          <p className="text-sm text-neutral-500">
            Track applicants through the 7-stage hiring lifecycle with full audit history and private notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="pipeline-role-filter" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Filter Role:
          </label>
          <select
            id="pipeline-role-filter"
            aria-label="Filter Role"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board Container with horizontal scroll on smaller screens */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {PIPELINE_COLUMNS.map((col) => {
          const colApps = filteredApps.filter((a) => a.status === col.status);

          return (
            <div
              key={col.status}
              className="flex w-72 shrink-0 flex-col rounded-xl border border-neutral-200 bg-neutral-100/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/60"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  {col.label}
                </span>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-bold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-3 min-h-[350px]">
                {colApps.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400 dark:border-neutral-800">
                    No candidates
                  </div>
                ) : (
                  colApps.map((app) => {
                    const score = app.recruiterOverrideScore ?? app.matchScore ?? 75;
                    const next = getNextStage(app.status);

                    return (
                      <Card
                        key={app.id}
                        className={`p-3.5 space-y-2.5 shadow-sm border-l-4 ${col.color}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                              {app.candidateName}
                            </h4>
                            <p className="text-[11px] text-neutral-500">{app.candidateEmail}</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                              score >= 85
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {score}%
                          </span>
                        </div>

                        {app.scoreBreakdown?.matchedSkills && app.scoreBreakdown.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.scoreBreakdown.matchedSkills.slice(0, 3).map((item) => (
                              <span
                                key={item.skill}
                                className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                              >
                                {item.skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-xs dark:border-neutral-800">
                          <div className="flex items-center gap-1 text-neutral-400">
                            <button
                              type="button"
                              title="Audit Trail"
                              onClick={() => setAuditModalApp(app)}
                              className="rounded p-1 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
                            >
                              <History className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Private Notes"
                              onClick={() => {
                                setNoteModalApp(app);
                                setNewNoteText('');
                              }}
                              className="rounded p-1 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {next && (
                              <Button
                                size="sm"
                                onClick={() => handleAdvanceStage(app.id, next)}
                                className="h-7 px-2 text-[11px]"
                              >
                                Advance <ArrowRight className="h-3 w-3" />
                              </Button>
                            )}
                            {app.status === 'Shortlisted' && (
                              <Button
                                size="sm"
                                onClick={() => navigate('/interviews')}
                                className="h-7 px-2 text-[11px] bg-purple-600 hover:bg-purple-700"
                              >
                                Schedule
                              </Button>
                            )}
                            {app.status !== 'Selected' && app.status !== 'Rejected' && (
                              <button
                                type="button"
                                title="Reject"
                                onClick={() => handleReject(app.id)}
                                className="text-neutral-400 hover:text-rose-600 p-1"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Log Modal */}
      {auditModalApp && (
        <Modal
          open={!!auditModalApp}
          onClose={() => setAuditModalApp(null)}
          title={`Audit History: ${auditModalApp.candidateName}`}
        >
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              Immutable audit trail recording every state change, actor, and timestamp.
            </p>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {auditModalApp.auditTrail.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-800/50 space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-blue-600 dark:text-blue-400">{entry.changedBy}</span>
                    <span className="text-neutral-400">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Status: <span className="font-bold">{entry.fromStatus}</span> → <span className="font-bold">{entry.toStatus}</span>
                  </p>
                  {entry.note && (
                    <p className="text-neutral-500 italic">"{entry.note}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Private Notes Modal */}
      {noteModalApp && (
        <Modal
          open={!!noteModalApp}
          onClose={() => setNoteModalApp(null)}
          title={`Recruiter Notes: ${noteModalApp.candidateName}`}
        >
          <div className="space-y-4">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {noteModalApp.notes.length === 0 ? (
                <p className="text-xs text-neutral-400">No private notes yet.</p>
              ) : (
                noteModalApp.notes.map((n) => (
                  <div key={n.id} className="rounded border border-neutral-200 bg-white p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex justify-between text-neutral-500 font-semibold mb-1">
                      <span>{n.author}</span>
                      <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200">{n.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <Input
                label="Add Note"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Confidential evaluation feedback..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setNoteModalApp(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNote}>
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
