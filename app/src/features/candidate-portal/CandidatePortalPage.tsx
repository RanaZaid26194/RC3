import { useState } from 'react';
import { CheckCircle2, ArrowRight, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ResumeUploader } from '@/features/resumes/ResumeUploader';
import { load, save, uid } from '@/lib/storage';
import { getCurrentUser, DEFAULT_CANDIDATE } from '@/lib/auth';
import { calculateCandidateMatch } from '@/lib/ai/matcher';
import type { Job, Application, CandidateProfile } from '@/types';

export default function CandidatePortalPage() {
  const user = getCurrentUser() || DEFAULT_CANDIDATE;
  const allJobs = load<Job[]>('jobs', []);
  const jobs = allJobs.filter((j) => j.status === 'open');
  const [applications, setApplications] = useState<Application[]>(load<Application[]>('applications', []));
  const [candidates, setCandidates] = useState<CandidateProfile[]>(load<CandidateProfile[]>('candidates', []));
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetJobForUpload, setTargetJobForUpload] = useState<Job | null>(null);

  const pipelineStages = ['Submitted', 'Parsed', 'AI Assessment Available', 'Recruiter Review', 'Shortlisted', 'Interview', 'Selected'] as const;

  // Only link a resume profile that belongs to the signed-in account; never fall back
  // to another candidate's profile (that leaked the wrong name into the greeting).
  const myProfile =
    candidates.find((c) => c.email.toLowerCase() === user.email.toLowerCase()) ??
    (user.id === DEFAULT_CANDIDATE.id ? candidates[0] : undefined);

  const myApplications = applications.filter(
    (a) => a.candidateEmail.toLowerCase() === user.email.toLowerCase() || a.candidateId === myProfile?.id
  );

  const rankedJobs = myProfile
    ? jobs
        .map((job) => ({ job, match: calculateCandidateMatch(job, myProfile) }))
        .sort((a, b) => b.match.totalScore - a.match.totalScore)
    : jobs.map((job) => ({ job, match: undefined }));
  const topUnappliedIndex = rankedJobs.findIndex(
    ({ job }) => !myApplications.some((a) => a.jobId === job.id)
  );

  const handleApply = (job: Job) => {
    const already = applications.some((a) => a.jobId === job.id && (a.candidateId === myProfile?.id || a.candidateEmail === user.email));
    if (already) {
      setFeedbackMsg(`You have already applied for ${job.title}.`);
      return;
    }

    const match = myProfile ? calculateCandidateMatch(job, myProfile) : undefined;
    const newApp: Application = {
      id: uid('app'),
      jobId: job.id,
      candidateId: myProfile?.id || uid('cand'),
      candidateName: myProfile?.name || user.name,
      candidateEmail: myProfile?.email || user.email,
      status: 'Submitted',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchScore: match?.totalScore,
      scoreBreakdown: match,
      notes: [],
      auditTrail: [
        {
          id: uid('aud'),
          applicationId: 'temp',
          fromStatus: 'Submitted',
          toStatus: 'Submitted',
          changedBy: 'Candidate Application',
          timestamp: new Date().toISOString(),
          note: 'Application submitted via Candidate Portal',
        },
      ],
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    save('applications', updated);
    setFeedbackMsg(`Application successfully submitted for ${job.title}!`);
    setActiveTab('applications');
  };

  const handleResumeParsed = (newProfile: CandidateProfile) => {
    const updatedCandidates = [newProfile, ...candidates.filter(c => c.id !== newProfile.id)];
    setCandidates(updatedCandidates);
    save('candidates', updatedCandidates);
    setUploadModalOpen(false);

    if (targetJobForUpload) {
      handleApply(targetJobForUpload);
      setTargetJobForUpload(null);
    } else {
      setFeedbackMsg('Resume successfully parsed and candidate profile updated!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-900/50 dark:bg-brand-950/20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
              Candidate Workspace
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Welcome back, {user.name}
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              Browse vacancies, upload resume documents, and track explainable AI screening progress in real time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setTargetJobForUpload(null);
                setUploadModalOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Resume
            </Button>
            <Button
              variant={activeTab === 'jobs' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('jobs')}
              className="text-xs"
            >
              Browse Openings ({jobs.length})
            </Button>
            <Button
              variant={activeTab === 'applications' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('applications')}
              className="text-xs"
            >
              My Applications ({myApplications.length})
            </Button>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span>{feedbackMsg}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="underline">Dismiss</button>
        </div>
      )}

      {/* Tabs View */}
      {activeTab === 'jobs' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Available Vacancies
            </h2>
            {myProfile && (
              <span className="text-xs text-neutral-500">
                Sorted by fit with your parsed resume
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rankedJobs.map(({ job, match }, index) => {
              const hasApplied = myApplications.some((a) => a.jobId === job.id);
              return (
                <Card key={job.id} className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {job.department} • {job.location}
                        </span>
                        <h3 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                          {job.title}
                        </h3>
                      </div>
                      <span className="rounded bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {job.type}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
                      {job.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.requiredSkills.map((req) => (
                        <span
                          key={req.skill}
                          className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          {req.skill}
                        </span>
                      ))}
                    </div>

                    {match && (
                      <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-800/40">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            Your resume fit: {match.totalScore}%
                            {index === topUnappliedIndex && (
                              <span className="ml-1.5 rounded bg-accent-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-800 dark:bg-accent-900/50 dark:text-accent-300">
                                Best fit
                              </span>
                            )}
                          </span>
                          <span className="text-neutral-500">
                            {match.matchedSkills.length}/{job.requiredSkills.length} required skills verified
                          </span>
                        </div>
                        {match.missingSkills.length > 0 ? (
                          <p className="mt-1 text-neutral-500">
                            Missing: {match.missingSkills.join(', ')}
                          </p>
                        ) : (
                          <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                            All required skills found in your resume.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {job.salary}
                    </span>
                    {hasApplied ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" /> Applied
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApply(job)}
                          className="gap-1 text-xs"
                        >
                          1-Click Apply <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Submitted Applications & Live Pipeline Status
          </h2>

          {myApplications.length === 0 ? (
            <Card className="p-8 text-center text-neutral-500">
              <FileText className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
              <p className="text-sm">You have not submitted any applications yet.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('jobs')}
                className="mt-3"
              >
                Explore Open Jobs
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app) => {
                const job = allJobs.find((j) => j.id === app.jobId);
                const currentStageIndex = pipelineStages.indexOf(app.status as (typeof pipelineStages)[number]);
                return (
                  <Card key={app.id} className="p-5 space-y-3">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white">
                          {job?.title || 'Backend Engineer'}
                        </h3>
                        <p className="text-xs text-neutral-500">
                          Applied on {new Date(app.appliedAt).toLocaleDateString()} • {job?.department || 'Engineering'}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                        Status: {app.status}
                      </span>
                    </div>

                    {app.status === 'Rejected' ? (
                      <div className="rounded bg-red-50 p-2 text-center text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        Application closed after recruiter review
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 pt-2 text-center text-[10px] font-medium text-neutral-500 sm:grid-cols-4 lg:grid-cols-7">
                        {pipelineStages.map((stage, index) => {
                          const completed = currentStageIndex >= index;
                          return (
                            <div
                              key={stage}
                              className={`rounded p-1.5 transition-colors ${completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
                            >
                              {index + 1}. {stage === 'AI Assessment Available' ? 'AI Assessment' : stage}
                              {completed ? ' ✓' : ''}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resume Upload Modal */}
      {uploadModalOpen && (
        <Modal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload & Parse Resume"
        >
          <ResumeUploader
            onParsed={handleResumeParsed}
            onCancel={() => setUploadModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
