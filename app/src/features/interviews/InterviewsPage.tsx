import { useState } from 'react';
import { Calendar, Plus, Clock, Video, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { load, save, uid } from '@/lib/storage';
import type { CandidateProfile, Interview, InterviewFeedback, InterviewQuestion, Job } from '@/types';

const today = new Date().toISOString().split('T')[0];

function buildQuestions(job: Job | undefined, candidate: CandidateProfile | undefined): InterviewQuestion[] {
  const role = job?.title || 'this role';
  const project = candidate?.projects[0];
  return [
    {
      id: uid('question'),
      text: `What would you prioritize when designing a reliable solution for ${role}?`,
      difficulty: 'beginner',
      category: 'Role fundamentals',
      expectedAnswerGuidelines: 'Look for clear prioritization, measurable outcomes, trade-offs, and an understanding of the users or systems involved.',
    },
    {
      id: uid('question'),
      text: `Walk us through the most important technical decision in ${project?.name || 'a recent project'}.`,
      difficulty: 'intermediate',
      category: 'Project experience',
      expectedAnswerGuidelines: 'The candidate should explain context, alternatives considered, implementation details, and what they would improve now.',
      projectContext: project?.description,
    },
    {
      id: uid('question'),
      text: `How would you scale and monitor a production system built for ${role}?`,
      difficulty: 'advanced',
      category: 'Systems thinking',
      expectedAnswerGuidelines: 'Expect discussion of bottlenecks, observability, failure modes, capacity planning, and a safe rollout strategy.',
    },
  ];
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(load<Interview[]>('interviews', []));
  const candidates = load<CandidateProfile[]>('candidates', []);
  const jobs = load<Job[]>('jobs', []);
  const [open, setOpen] = useState(false);
  const [feedbackInterview, setFeedbackInterview] = useState<Interview | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: '4',
    technicalRating: '4',
    communicationRating: '4',
    comments: '',
    decision: 'Hire' as InterviewFeedback['decision'],
  });
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    candidateId: candidates[0]?.id || '',
    jobId: jobs[0]?.id || '',
    date: today,
    time: '10:00',
    duration: '45',
    interviewer: 'David Vance (Principal Architect)',
    interviewType: 'Technical' as Interview['interviewType'],
  });

  const selectedCandidate = candidates.find((candidate) => candidate.id === form.candidateId);
  const selectedJob = jobs.find((job) => job.id === form.jobId);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleSchedule = () => {
    if (!form.candidateId || !form.jobId || !form.date || !form.time || !form.interviewer.trim()) {
      setError('Choose a candidate, role, date, time, and interviewer before scheduling.');
      return;
    }
    if (form.date < today) {
      setError('Interview dates cannot be in the past.');
      return;
    }
    const conflict = interviews.some((interview) =>
      interview.status === 'scheduled' &&
      interview.interviewer.toLowerCase() === form.interviewer.trim().toLowerCase() &&
      interview.scheduledDate === form.date &&
      interview.scheduledTime === form.time
    );
    if (conflict) {
      setError('This interviewer already has a scheduled interview at that time. Choose another slot.');
      return;
    }

    const nextInterview: Interview = {
      id: uid('int'),
      applicationId: '',
      candidateId: form.candidateId,
      candidateName: selectedCandidate?.name || 'Candidate',
      jobId: form.jobId,
      jobTitle: selectedJob?.title || 'Interview',
      scheduledDate: form.date,
      scheduledTime: form.time,
      durationMinutes: Number(form.duration),
      interviewer: form.interviewer.trim(),
      interviewType: form.interviewType,
      status: 'scheduled',
      questions: buildQuestions(selectedJob, selectedCandidate),
    };
    const updated = [nextInterview, ...interviews];
    setInterviews(updated);
    save('interviews', updated);
    setOpen(false);
    setError(null);
  };

  const handleFeedback = () => {
    if (!feedbackInterview || !feedbackForm.comments.trim()) {
      setFeedbackError('Add concise feedback before completing the interview.');
      return;
    }
    const feedback: InterviewFeedback = {
      rating: Number(feedbackForm.rating),
      technicalRating: Number(feedbackForm.technicalRating),
      communicationRating: Number(feedbackForm.communicationRating),
      comments: feedbackForm.comments.trim(),
      decision: feedbackForm.decision,
      submittedAt: new Date().toISOString(),
    };
    const updated = interviews.map((interview) => interview.id === feedbackInterview.id
      ? { ...interview, status: 'completed' as const, feedback }
      : interview);
    setInterviews(updated);
    save('interviews', updated);
    setFeedbackInterview(null);
    setFeedbackError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Interview Schedules & Question Generation
          </h1>
          <p className="text-sm text-neutral-500">
            Schedule candidate interviews, avoid calendar conflicts, and review AI-generated role questions.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      {interviews.length === 0 && (
        <Card className="p-8 text-center text-sm text-neutral-500">
          No interviews scheduled yet. Create one to generate a tailored question set.
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interviews.map((intv) => (
          <Card key={intv.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {intv.interviewType}
                </span>
                <h3 className="mt-2 font-semibold text-neutral-900 dark:text-white">
                  {intv.candidateName}
                </h3>
                <p className="text-xs text-neutral-500">{intv.jobTitle}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800">
                <Video className="h-4 w-4" />
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>{intv.scheduledDate} at {intv.scheduledTime} ({intv.durationMinutes} min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                <span>Interviewer: {intv.interviewer}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Prepared Questions ({intv.questions.length}):
              </span>
              <ul className="mt-1 space-y-1 text-neutral-500 list-disc list-inside">
                {intv.questions.slice(0, 2).map((q) => (
                  <li key={q.id} className="truncate">{q.text}</li>
                ))}
              </ul>
            </div>

            {intv.feedback ? (
              <div className="rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <p className="font-semibold">{intv.feedback.decision} · {intv.feedback.rating}/5 overall</p>
                <p className="mt-1 line-clamp-2">{intv.feedback.comments}</p>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFeedbackInterview(intv);
                  setFeedbackError(null);
                  setFeedbackForm({ rating: '4', technicalRating: '4', communicationRating: '4', comments: '', decision: 'Hire' });
                }}
              >
                Record feedback
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        title="Schedule interview"
        onClose={() => { setOpen(false); setError(null); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>Schedule interview</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs font-medium text-red-700">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Candidate" value={form.candidateId} onChange={(event) => updateForm('candidateId', event.target.value)}>
              <option value="">Select candidate</option>
              {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
            </Select>
            <Select label="Role" value={form.jobId} onChange={(event) => updateForm('jobId', event.target.value)}>
              <option value="">Select role</option>
              {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
            </Select>
            <Input label="Date" type="date" min={today} value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
            <Input label="Time" type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} />
            <Select label="Duration" value={form.duration} onChange={(event) => updateForm('duration', event.target.value)}>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </Select>
            <Select label="Interview type" value={form.interviewType} onChange={(event) => updateForm('interviewType', event.target.value)}>
              <option>Technical</option>
              <option>Behavioral</option>
              <option>System Design</option>
              <option>Cultural Fit</option>
            </Select>
          </div>
          <Input label="Interviewer" value={form.interviewer} onChange={(event) => updateForm('interviewer', event.target.value)} />
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Scheduling generates beginner, intermediate, and advanced questions with answer guidelines tailored to the role and the candidate's projects.</span>
          </div>
        </div>
      </Modal>

      <Modal
        open={feedbackInterview !== null}
        title={`Interview feedback: ${feedbackInterview?.candidateName || ''}`}
        onClose={() => { setFeedbackInterview(null); setFeedbackError(null); }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFeedbackInterview(null)}>Cancel</Button>
            <Button onClick={handleFeedback}>Complete interview</Button>
          </>
        }
      >
        <div className="space-y-4">
          {feedbackError && <p role="alert" className="rounded-md bg-red-50 p-3 text-xs font-medium text-red-700">{feedbackError}</p>}
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Overall rating" type="number" min="1" max="5" value={feedbackForm.rating} onChange={(event) => setFeedbackForm((current) => ({ ...current, rating: event.target.value }))} />
            <Input label="Technical rating" type="number" min="1" max="5" value={feedbackForm.technicalRating} onChange={(event) => setFeedbackForm((current) => ({ ...current, technicalRating: event.target.value }))} />
            <Input label="Communication rating" type="number" min="1" max="5" value={feedbackForm.communicationRating} onChange={(event) => setFeedbackForm((current) => ({ ...current, communicationRating: event.target.value }))} />
          </div>
          <Select label="Decision" value={feedbackForm.decision} onChange={(event) => setFeedbackForm((current) => ({ ...current, decision: event.target.value as InterviewFeedback['decision'] }))}>
            <option>Hire</option>
            <option>Strong Hire</option>
            <option>Borderline</option>
            <option>No Hire</option>
          </Select>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300" htmlFor="feedback-comments">Feedback notes</label>
          <textarea id="feedback-comments" rows={4} value={feedbackForm.comments} onChange={(event) => setFeedbackForm((current) => ({ ...current, comments: event.target.value }))} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900" placeholder="Summarize evidence, strengths, and concerns" />
        </div>
      </Modal>
    </div>
  );
}
