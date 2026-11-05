import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { load } from '@/lib/storage';
import type { CandidateProfile, Job, Application } from '@/types';

export default function AnalyticsPage() {
  const jobs = load<Job[]>('jobs', []);
  const apps = load<Application[]>('applications', []);
  const candidates = load<CandidateProfile[]>('candidates', []);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApps = apps.length;
  const shortlisted = apps.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview' || a.status === 'Selected').length;
  const conversionRate = totalApps > 0 ? Math.round((shortlisted / totalApps) * 100) : 0;
  const averageProcessingDays = apps.length > 0
    ? (apps.reduce((total, app) => total + Math.max(0, Date.now() - new Date(app.appliedAt).getTime()), 0) / apps.length / 86_400_000).toFixed(1)
    : '0.0';
  const requiredSkills = jobs.flatMap((job) => job.requiredSkills.map((requirement) => requirement.skill));
  const skillGaps = Array.from(new Set(requiredSkills)).map((skill) => {
    const normalized = skill.toLowerCase();
    const withSkill = candidates.filter((candidate) => candidate.skills.some((candidateSkill) => candidateSkill.toLowerCase() === normalized)).length;
    const missingPercent = candidates.length > 0 ? Math.round(((candidates.length - withSkill) / candidates.length) * 100) : 0;
    return { skill, percent: missingPercent };
  }).sort((left, right) => right.percent - left.percent).slice(0, 5);
  const stages = [
    { stage: 'Submitted', count: apps.filter((app) => app.status === 'Submitted').length, color: 'bg-neutral-400' },
    { stage: 'AI Assessment Available', count: apps.filter((app) => app.status === 'AI Assessment Available').length, color: 'bg-blue-500' },
    { stage: 'Recruiter Review', count: apps.filter((app) => app.status === 'Recruiter Review').length, color: 'bg-amber-500' },
    { stage: 'Shortlisted / Interview', count: shortlisted, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Recruitment Intelligence & Analytics
        </h1>
        <p className="text-sm text-neutral-500">
          Monitor vacancy performance, candidate stage conversion, average processing times, and aggregate skill deficits.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Active Vacancies</span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold">{activeJobs}</div>
          <span className="text-xs text-neutral-400">{totalJobs} total created</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Applicants</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold">{totalApps}</div>
          <span className="text-xs text-emerald-600">Across all active pipelines</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Shortlist Rate</span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold">{conversionRate}%</div>
          <span className="text-xs text-neutral-400">{shortlisted} advanced</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Avg. Processing Time</span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold">{averageProcessingDays} days</div>
          <span className="text-xs text-neutral-400">Since each application was submitted</span>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Common Skill Gaps Across Applicants
          </h3>
          <div className="space-y-3">
            {skillGaps.length === 0 ? (
              <p className="text-sm text-neutral-500">Add open jobs and candidate profiles to calculate skill deficits.</p>
            ) : skillGaps.map((item) => (
              <div key={item.skill} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.skill}</span>
                  <span className="text-neutral-500">{item.percent}% missing</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-rose-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Pipeline Stage Distribution
          </h3>
          <div className="space-y-3">
            {stages.map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{stage.stage}</span>
                </div>
                <span className="font-bold">{stage.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
