import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Users,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/ui/Card';
import { load, save } from '@/lib/storage';
import type { Job, Application } from '@/types';

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>(load<Job[]>('jobs', []));
  const applications = load<Application[]>('applications', []);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  const handleToggleJobStatus = (jobId: string) => {
    const updated = jobs.map((j) => {
      if (j.id === jobId) {
        const nextStatus = j.status === 'open' ? 'closed' : 'open';
        return { ...j, status: nextStatus as 'open' | 'closed', updatedAt: new Date().toISOString() };
      }
      return j;
    });
    setJobs(updated);
    save('jobs', updated);
  };

  const filteredJobs = jobs.filter((j) => {
    if (statusFilter === 'all') return true;
    return j.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-neutral-200/80 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="aurora-blob -right-10 -top-16 h-56 w-56 bg-brand-200/60 dark:bg-brand-900/30" />
        <div className="aurora-blob -bottom-20 left-1/3 h-48 w-48 bg-accent-500/20 dark:bg-accent-500/10" style={{ animationDelay: '-6s' }} />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
              <Sparkles className="h-3.5 w-3.5 animate-breathe" aria-hidden="true" />
              Talent Acquisition Hub
            </p>
            <h1 className="animate-fade-up font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Job Openings & <span className="animate-gradient-text">Vacancy Management</span>
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Publish vacancies, define required skill weights, and monitor applicant pools with AI matching.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/jobs/new')} className="group gap-2 hover-lift">
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" /> Create New Vacancy
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="stagger mb-4 flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-3 text-sm dark:border-neutral-800 animate-fade-up">
        <Filter className="h-4 w-4 text-neutral-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Filter:</span>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out-expo ${
            statusFilter === 'all'
              ? 'bg-brand-700 text-white shadow-md shadow-brand-600/25'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          All ({jobs.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('open')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out-expo ${
            statusFilter === 'open'
              ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
              : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-950/40'
          }`}
        >
          Open ({jobs.filter((j) => j.status === 'open').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('closed')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out-expo ${
            statusFilter === 'closed'
              ? 'bg-neutral-600 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          Closed ({jobs.filter((j) => j.status === 'closed').length})
        </button>
      </div>

      {/* Job Cards Grid */}
  <div className="stagger grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job, index) => {
          const appCount = applications.filter((a) => a.jobId === job.id).length;
          const isOpen = job.status === 'open';
          const delay = index * 80;

          return (
            <AnimatedCard
              key={job.id}
              delay={delay}
              className={`group hover-lift sheen flex flex-col justify-between p-5 transition hover:shadow-xl ${
                !isOpen ? 'opacity-70 bg-neutral-50/70 dark:bg-neutral-900/40' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {job.department}
                    </span>
                    <h3 className="mt-1 font-bold text-neutral-900 dark:text-white">
                      {job.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOpen
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {isOpen ? 'Active' : 'Closed'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    {job.location} ({job.type})
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
                    {job.salary}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                  {job.description}
                </p>

                {/* Skill Weights Badges */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Required Skills (with weights):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((req) => (
                      <span
                        key={req.skill}
                        className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
                      >
                        {req.skill}
                        <span className="rounded bg-blue-200 px-1 text-[9px] font-bold text-blue-900 dark:bg-blue-800 dark:text-blue-200">
                          w:{req.weight}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                    <Users className="h-4 w-4 text-blue-600" />
                    <strong>{appCount}</strong> candidate{appCount !== 1 ? 's' : ''} applied
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleJobStatus(job.id)}
                    className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
                  >
                    {isOpen ? 'Close vacancy' : 'Reopen vacancy'}
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/pipeline?jobId=${job.id}`)}
                  className="w-full justify-center gap-1 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  View Candidates & Scores
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
