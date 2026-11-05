import { useState } from 'react';
import {
  Calendar,
  Plus,
  Video,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  User,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { QuestionTiers } from '@/components/ui/CustomIcons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { load, save, uid } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { calculateCandidateMatch } from '@/lib/ai/matcher';
import { generateInterviewQuestionsUnified } from '@/lib/ai/orchestrator';
import type { Interview, InterviewQuestion, CandidateProfile, Job, Application } from '@/types';

const INTERVIEWERS = [
  'David Vance (Principal Architect)',
  'Elena Rostova (Lead Software Engineer)',
  'Michael Ross (Engineering Manager)',
  'Sarah Jenkins (Senior Talent Partner)',
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(() => load<Interview[]>('interviews', []));
  const candidates = load<CandidateProfile[]>('candidates', []);
  const jobs = load<Job[]>('jobs', []);
  const applications = load<Application[]>('applications', []);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);

  // Scheduling Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(candidates[0]?.id || '');
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [selectedInterviewer, setSelectedInterviewer] = useState(INTERVIEWERS[0]);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewType, setInterviewType] = useState<Interview['interviewType']>('Technical');
  const [modalQuestions, setModalQuestions] = useState<InterviewQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generatedProvider, setGeneratedProvider] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionText, setEditingQuestionText] = useState('');
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<string | null>(null);

  // Feedback Modal State
  const [feedbackInterview, setFeedbackInterview] = useState<Interview | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackTechRating, setFeedbackTechRating] = useState(4);
  const [feedbackCommRating, setFeedbackCommRating] = useState(4);
  const [feedbackDecision, setFeedbackDecision] = useState<'Hire' | 'Strong Hire' | 'Borderline' | 'No Hire'>('Hire');
  const [feedbackComments, setFeedbackComments] = useState('');

  // Fall back to the first available candidate/job so scheduling still works if
  // the stored ids were never initialised (e.g. page mounted before seed data).
  const activeCandidateId = selectedCandidateId || candidates[0]?.id || '';
  const activeJobId = selectedJobId || jobs[0]?.id || '';

  // Conflict Detection Engine — catches exact clashes and partial time overlaps
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const detectConflict = (
    interviewer: string,
    date: string,
    time: string,
    duration: number,
    currentInterviewId?: string
  ) => {
    if (!date || !time) return undefined;
    const start = toMinutes(time);
    const end = start + duration;
    return interviews.find((intv) => {
      if (intv.id === currentInterviewId) return false;
      if (intv.status !== 'scheduled') return false;
      if (intv.scheduledDate !== date) return false;
      if (intv.interviewer.trim().toLowerCase() !== interviewer.trim().toLowerCase()) return false;
      const otherStart = toMinutes(intv.scheduledTime);
      const otherEnd = otherStart + (intv.durationMinutes || 45);
      return start < otherEnd && otherStart < end;
    });
  };

  const currentConflict = detectConflict(
    selectedInterviewer,
    scheduledDate,
    scheduledTime,
    durationMinutes
  );

  // Handle Question Generation inside Modal
  const handleGenerateQuestions = async () => {
    const candidate = candidates.find((c) => c.id === activeCandidateId);
    const job = jobs.find((j) => j.id === activeJobId);
    if (!candidate || !job) return;

    setIsGeneratingQuestions(true);
    try {
      const projectNames = candidate.projects?.map((p) => p.name) || [];
      const res = await generateInterviewQuestionsUnified(job.title, candidate.name, projectNames);
      setModalQuestions(res.questions);
      setGeneratedProvider(res.provider);
    } catch (err) {
      console.error('Failed to generate questions:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleStartEditQuestion = (question: InterviewQuestion) => {
    setEditingQuestionId(question.id);
    setEditingQuestionText(question.text);
  };

  const handleSaveQuestionEdit = (questionId: string) => {
    const trimmed = editingQuestionText.trim();
    if (!trimmed) return;
    setModalQuestions((current) =>
      current.map((q) => (q.id === questionId ? { ...q, text: trimmed } : q))
    );
    setEditingQuestionId(null);
    setEditingQuestionText('');
  };

  const handleRemoveQuestion = (questionId: string) => {
    setModalQuestions((current) => current.filter((q) => q.id !== questionId));
    if (editingQuestionId === questionId) setEditingQuestionId(null);
  };

  const handleRegenerateQuestion = async (questionId: string) => {
    const candidate = candidates.find((c) => c.id === activeCandidateId);
    const job = jobs.find((j) => j.id === activeJobId);
    if (!candidate || !job) return;

    setRegeneratingQuestionId(questionId);
    try {
      const projectNames = candidate.projects?.map((p) => p.name) || [];
      const res = await generateInterviewQuestionsUnified(job.title, candidate.name, projectNames);
      setModalQuestions((current) => {
        const existing = current.find((q) => q.id === questionId);
        const usedTexts = new Set(current.filter((q) => q.id !== questionId).map((q) => q.text));
        const pool = res.questions.filter((q) => !usedTexts.has(q.text));
        const replacement =
          pool.find((q) => q.difficulty === existing?.difficulty) ||
          pool[0] ||
          res.questions[0];
        if (!replacement) return current;
        return current.map((q) =>
          q.id === questionId ? { ...replacement, id: questionId } : q
        );
      });
      setGeneratedProvider(res.provider);
    } catch (err) {
      console.error('Failed to regenerate question:', err);
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  // Open Schedule Modal pre-populated
  const handleOpenSchedule = (candidateId?: string, jobId?: string) => {
    if (candidateId) setSelectedCandidateId(candidateId);
    if (jobId) setSelectedJobId(jobId);
    setModalQuestions([]);
    setGeneratedProvider(null);
    setEditingQuestionId(null);
    setIsScheduleOpen(true);
  };

  // Save Scheduled Interview
  const handleSaveInterview = () => {
    if (currentConflict) return;
    const candidate = candidates.find((c) => c.id === activeCandidateId);
    const job = jobs.find((j) => j.id === activeJobId);
    if (!candidate || !job) return;

    // Default questions if none generated
    const finalQuestions: InterviewQuestion[] =
      modalQuestions.length > 0
        ? modalQuestions
        : [
            {
              id: uid('q'),
              text: `How do you approach scalable system architecture in ${job.title}?`,
              difficulty: 'intermediate',
              category: 'General & Architecture',
              expectedAnswerGuidelines: 'Evaluate structured thinking, performance tradeoffs, and testing strategy.',
            },
          ];

    let matchingApp = applications.find(
      (a) => a.candidateId === candidate.id && a.jobId === job.id
    );

    // Interviews must point at a real application so the final decision can update it.
    if (!matchingApp) {
      const match = calculateCandidateMatch(job, candidate);
      matchingApp = {
        id: uid('app'),
        jobId: job.id,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        status: 'Interview',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        matchScore: match.totalScore,
        scoreBreakdown: match,
        notes: [],
        auditTrail: [
          {
            id: uid('aud'),
            applicationId: '',
            fromStatus: 'Submitted',
            toStatus: 'Interview',
            changedBy: getCurrentUser()?.name ?? 'Recruiter',
            timestamp: new Date().toISOString(),
            note: 'Application opened from interview scheduling',
          },
        ],
      };
      matchingApp.auditTrail[0].applicationId = matchingApp.id;
      const latestApplications = load<Application[]>('applications', []);
      save('applications', [matchingApp, ...latestApplications]);
    }

    const newInterview: Interview = {
      id: uid('int'),
      applicationId: matchingApp.id,
      candidateId: candidate.id,
      candidateName: candidate.name,
      jobId: job.id,
      jobTitle: job.title,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      interviewer: selectedInterviewer,
      interviewType,
      status: 'scheduled',
      questions: finalQuestions,
    };

    const updated = [newInterview, ...interviews];
    setInterviews(updated);
    save('interviews', updated);
    setIsScheduleOpen(false);
  };

  // Cancel Interview
  const handleCancelInterview = (id: string) => {
    const updated = interviews.map((intv) =>
      intv.id === id ? { ...intv, status: 'cancelled' as const } : intv
    );
    setInterviews(updated);
    save('interviews', updated);
  };

  // Submit Feedback
  const handleSubmitFeedback = () => {
    if (!feedbackInterview) return;

    const updated = interviews.map((intv) =>
      intv.id === feedbackInterview.id
        ? {
            ...intv,
            status: 'completed' as const,
            feedback: {
              rating: feedbackRating,
              technicalRating: feedbackTechRating,
              communicationRating: feedbackCommRating,
              comments: feedbackComments,
              decision: feedbackDecision,
              submittedAt: new Date().toISOString(),
            },
          }
        : intv
    );

    setInterviews(updated);
    save('interviews', updated);

    const nextStatus =
      feedbackDecision === 'Hire' || feedbackDecision === 'Strong Hire'
        ? ('Selected' as const)
        : feedbackDecision === 'No Hire'
          ? ('Rejected' as const)
          : null;

    if (nextStatus) {
      const actor = getCurrentUser()?.name ?? 'Interview Panel';
      const storedApplications = load<Application[]>('applications', []);
      const syncedApplications = storedApplications.map((app) =>
        app.id === feedbackInterview.applicationId && app.status !== nextStatus
          ? {
              ...app,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              auditTrail: [
                ...app.auditTrail,
                {
                  id: uid('aud'),
                  applicationId: app.id,
                  fromStatus: app.status,
                  toStatus: nextStatus,
                  changedBy: actor,
                  timestamp: new Date().toISOString(),
                  note: `Interview outcome recorded: ${feedbackDecision} (${feedbackRating}/5 overall)`,
                },
              ],
            }
          : app
      );
      save('applications', syncedApplications);
    }

    setFeedbackInterview(null);
    setFeedbackComments('');
  };

  // Filtered interviews
  const filteredInterviews = interviews.filter((intv) => {
    const matchesStatus = statusFilter === 'all' || intv.status === statusFilter;
    const matchesSearch =
      intv.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intv.interviewer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Interview Schedules & Question Kit
          </h1>
          <p className="text-sm text-neutral-500">
            Intelligent calendar scheduling with conflict detection and automated 3-tier AI question rubrics.
          </p>
        </div>
        <Button onClick={() => handleOpenSchedule()} className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900">
          {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              {st} ({st === 'all' ? interviews.length : interviews.filter((i) => i.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            aria-label="Search candidate, role, or interviewer"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, role, or interviewer..."
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Interviews List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInterviews.map((intv) => {
          const isExpanded = expandedInterviewId === intv.id;
          return (
            <Card key={intv.id} className="flex flex-col justify-between p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        intv.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          : intv.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {intv.status.toUpperCase()} • {intv.interviewType}
                    </span>
                    <h3 className="mt-2 font-semibold text-neutral-900 dark:text-white">
                      {intv.candidateName}
                    </h3>
                    <p className="text-xs text-neutral-500">{intv.jobTitle}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <Video className="h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                      {intv.scheduledDate} at {intv.scheduledTime} ({intv.durationMinutes} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="truncate">Interviewer: {intv.interviewer}</span>
                  </div>
                </div>

                {/* Feedback badge if completed */}
                {intv.feedback && (
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Outcome: {intv.feedback.decision}</span>
                      <span>Rating: {intv.feedback.rating}/5</span>
                    </div>
                    {intv.feedback.comments && (
                      <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 italic">
                        "{intv.feedback.comments}"
                      </p>
                    )}
                  </div>
                )}

                {/* Questions Preview */}
                <div className="border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      AI Question Kit ({intv.questions.length})
                    </span>
                    <button
                      onClick={() => setExpandedInterviewId(isExpanded ? null : intv.id)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {isExpanded ? (
                        <>Hide <ChevronUp className="h-3 w-3" /></>
                      ) : (
                        <>Inspect <ChevronDown className="h-3 w-3" /></>
                      )}
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="mt-2.5 space-y-2.5">
                      {intv.questions.map((q) => (
                        <div
                          key={q.id}
                          className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-900"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                q.difficulty === 'beginner'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  : q.difficulty === 'intermediate'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <span className="text-[10px] text-neutral-400">{q.category}</span>
                          </div>
                          <p className="mt-1.5 font-medium text-neutral-800 dark:text-neutral-200">{q.text}</p>
                          {q.expectedAnswerGuidelines && (
                            <p className="mt-1 text-[11px] text-neutral-500">
                              <span className="font-semibold text-neutral-600 dark:text-neutral-400">Rubric:</span>{' '}
                              {q.expectedAnswerGuidelines}
                            </p>
                          )}
                          {q.projectContext && (
                            <p className="mt-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                              Context: {q.projectContext}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="mt-1.5 space-y-1 text-neutral-500 list-disc list-inside">
                      {intv.questions.slice(0, 2).map((q) => (
                        <li key={q.id} className="truncate">
                          <span className="capitalize font-medium">[{q.difficulty}]</span> {q.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-neutral-100 pt-3 flex items-center justify-between gap-2 dark:border-neutral-800">
                {intv.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFeedbackInterview(intv)}
                      className="text-xs flex-1"
                    >
                      Record Feedback
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInterview(intv.id)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {intv.status === 'completed' && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="h-4 w-4" /> Evaluation Completed
                  </span>
                )}
                {intv.status === 'cancelled' && (
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <XCircle className="h-4 w-4" /> Interview Cancelled
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filteredInterviews.length === 0 && (
        <Card className="p-8 text-center space-y-3">
          <HelpCircle className="mx-auto h-8 w-8 text-neutral-400" />
          <h3 className="font-medium text-neutral-900 dark:text-white">No interviews found</h3>
          <p className="text-xs text-neutral-500">
            {statusFilter !== 'all' ? `No interviews in "${statusFilter}" state.` : 'Click Schedule Interview to book one.'}
          </p>
        </Card>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      <Modal
        open={isScheduleOpen}
        title="Schedule Interview & Generate Question Kit"
        onClose={() => setIsScheduleOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveInterview}
              disabled={Boolean(currentConflict) || !scheduledDate || !scheduledTime}
              className="gap-2"
            >
              <Check className="h-4 w-4" /> Confirm Schedule
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-left">
          {/* Calendar Conflict Alert */}
          {currentConflict && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">⚠️ Calendar Conflict Detected!</p>
                <p className="mt-0.5">
                  {selectedInterviewer} already has a {currentConflict.interviewType} interview booked on{' '}
                  {currentConflict.scheduledDate} at {currentConflict.scheduledTime} with{' '}
                  {currentConflict.candidateName}.
                </p>
                <p className="mt-1 font-semibold text-amber-800 dark:text-amber-300">
                  Please change the time or interviewer before confirming.
                </p>
              </div>
            </div>
          )}

          {/* Candidate & Job Selectors */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sched-candidate-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Candidate *
              </label>
              <select
                id="sched-candidate-select"
                aria-label="Candidate"
                value={activeCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.skills.slice(0, 3).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sched-role-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Role *
              </label>
              <select
                id="sched-role-select"
                aria-label="Target Role"
                value={activeJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interviewer & Type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="sched-interviewer-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Interviewer *
              </label>
              <select
                id="sched-interviewer-select"
                aria-label="Interviewer"
                value={selectedInterviewer}
                onChange={(e) => setSelectedInterviewer(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                {INTERVIEWERS.map((intvr) => (
                  <option key={intvr} value={intvr}>
                    {intvr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sched-type-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Interview Stage
              </label>
              <select
                id="sched-type-select"
                aria-label="Interview Stage"
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as Interview['interviewType'])}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="Technical">Technical Deep-Dive</option>
                <option value="System Design">System Architecture & Design</option>
                <option value="Behavioral">Behavioral & Leadership</option>
                <option value="Cultural Fit">Cultural Fit & Values</option>
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="sched-date-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Date *
              </label>
              <Input
                id="sched-date-input"
                aria-label="Interview Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label htmlFor="sched-time-input" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Time (24h) *
              </label>
              <Input
                id="sched-time-input"
                aria-label="Interview Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label htmlFor="sched-duration-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Duration (min)
              </label>
              <select
                id="sched-duration-select"
                aria-label="Duration (minutes)"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
          </div>

          {/* AI Question Generation Section */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 space-y-3 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Targeted Question Generator
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Synthesize questions based on role requirements and candidate's verified projects.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions}
                className="gap-1.5 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
              >
                <QuestionTiers className="h-3.5 w-3.5 text-blue-600" />
                {isGeneratingQuestions ? 'Generating...' : 'Generate 3-Tier Questions'}
              </Button>
            </div>

            {generatedProvider && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" /> Successfully generated via {generatedProvider}
              </div>
            )}

            {modalQuestions.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {modalQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="rounded-lg border border-neutral-200 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-600 dark:text-blue-400">
                        {q.difficulty} • {q.category}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {editingQuestionId === q.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveQuestionEdit(q.id)}
                              aria-label="Save question"
                              className="rounded p-1.5 text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              aria-label="Cancel editing question"
                              className="rounded p-1.5 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEditQuestion(q)}
                              aria-label="Edit question"
                              className="rounded p-1.5 text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleRegenerateQuestion(q.id)}
                              aria-label="Regenerate question"
                              disabled={regeneratingQuestionId === q.id}
                              className="rounded p-1.5 text-neutral-500 transition hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-700"
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 ${regeneratingQuestionId === q.id ? 'animate-spin' : ''}`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              aria-label="Remove question"
                              className="rounded p-1.5 text-neutral-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingQuestionId === q.id ? (
                      <textarea
                        value={editingQuestionText}
                        onChange={(e) => setEditingQuestionText(e.target.value)}
                        aria-label="Question text"
                        rows={2}
                        className="mt-1 w-full rounded-md border border-blue-300 bg-white p-2 text-xs focus:border-blue-500 focus:outline-none dark:border-blue-700 dark:bg-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="mt-1 font-medium text-neutral-800 dark:text-neutral-200">{q.text}</p>
                    )}
                    {q.expectedAnswerGuidelines && (
                      <p className="mt-1 text-[11px] text-neutral-500">
                        <span className="font-semibold">Rubric:</span> {q.expectedAnswerGuidelines}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* RECORD FEEDBACK MODAL */}
      {feedbackInterview && (
        <Modal
          open={Boolean(feedbackInterview)}
          title={`Interview Evaluation: ${feedbackInterview.candidateName}`}
          onClose={() => setFeedbackInterview(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setFeedbackInterview(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitFeedback} className="gap-2">
                <Check className="h-4 w-4" /> Save Evaluation
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-left">
            <div className="rounded-lg bg-neutral-50 p-3 text-xs dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold">{feedbackInterview.jobTitle}</span>
              <p className="text-neutral-500">Interviewer: {feedbackInterview.interviewer}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="eval-overall-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Overall Rating
                </label>
                <select
                  id="eval-overall-select"
                  aria-label="Overall Rating"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  <option value={5}>5 - Exceptional</option>
                  <option value={4}>4 - Above Bar</option>
                  <option value={3}>3 - Meets Bar</option>
                  <option value={2}>2 - Below Bar</option>
                  <option value={1}>1 - Strong No</option>
                </select>
              </div>

              <div>
                <label htmlFor="eval-tech-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Technical Depth
                </label>
                <select
                  id="eval-tech-select"
                  aria-label="Technical Depth"
                  value={feedbackTechRating}
                  onChange={(e) => setFeedbackTechRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  <option value={5}>5 - Architect Level</option>
                  <option value={4}>4 - High Proficiency</option>
                  <option value={3}>3 - Competent</option>
                  <option value={2}>2 - Shallow</option>
                  <option value={1}>1 - Deficient</option>
                </select>
              </div>

              <div>
                <label htmlFor="eval-comm-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Communication
                </label>
                <select
                  id="eval-comm-select"
                  aria-label="Communication"
                  value={feedbackCommRating}
                  onChange={(e) => setFeedbackCommRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  <option value={5}>5 - Clear & Precise</option>
                  <option value={4}>4 - Effective</option>
                  <option value={3}>3 - Adequate</option>
                  <option value={2}>2 - Disjointed</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label htmlFor="eval-decision-select" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Hiring Decision
                </label>
                <select
                  id="eval-decision-select"
                  aria-label="Hiring Decision"
                  value={feedbackDecision}
                  onChange={(e) => setFeedbackDecision(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-xs font-bold dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Borderline">Borderline</option>
                  <option value="No Hire">No Hire</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="eval-notes-textarea" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Detailed Evaluation Notes & Code Review Remarks
              </label>
              <textarea
                id="eval-notes-textarea"
                aria-label="Detailed Evaluation Notes"
                value={feedbackComments}
                onChange={(e) => setFeedbackComments(e.target.value)}
                rows={4}
                placeholder="Candidate demonstrated deep understanding of Django ORM query optimization and container boundaries. Clear communicator and structured problem solver."
                className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-xs focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
