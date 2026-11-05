import { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  Download,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { load } from '@/lib/storage';
import type { Job, Application, CandidateProfile, Interview } from '@/types';

export default function AnalyticsPage() {
  const jobs = load<Job[]>('jobs', []);
  const apps = load<Application[]>('applications', []);
  const candidates = load<CandidateProfile[]>('candidates', []);
  const interviews = load<Interview[]>('interviews', []);

  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  // Filter applications by role if chosen
  const filteredApps = selectedJobId === 'all' ? apps : apps.filter((a) => a.jobId === selectedJobId);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApps = filteredApps.length;
  const shortlistedCount = filteredApps.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Interview' || a.status === 'Selected'
  ).length;
  const conversionRate = totalApps > 0 ? Math.round((shortlistedCount / totalApps) * 100) : 0;

  // Average Match Score
  const scores = filteredApps.map((a) => a.matchScore || 0).filter((s) => s > 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const averageProcessingDays = apps.length > 0
    ? (apps.reduce((total, app) => total + Math.max(0, Date.now() - new Date(app.appliedAt).getTime()), 0) / apps.length / 86_400_000).toFixed(1)
    : '2.1';

  // Real-time Dynamic Skill Gap Analysis
  const skillGapMap: Record<string, { totalChecked: number; missingCount: number }> = {};
  const relevantJobs = selectedJobId === 'all' ? jobs : jobs.filter((j) => j.id === selectedJobId);

  relevantJobs.forEach((job) => {
    const jobApps = apps.filter((a) => a.jobId === job.id);
    const jobCandidates = jobApps.map((a) => candidates.find((c) => c.id === a.candidateId)).filter(Boolean) as CandidateProfile[];

    job.requiredSkills.forEach((req) => {
      const skillName = req.skill;
      if (!skillGapMap[skillName]) {
        skillGapMap[skillName] = { totalChecked: 0, missingCount: 0 };
      }
      jobCandidates.forEach((cand) => {
        skillGapMap[skillName].totalChecked += 1;
        const candSkills = cand.skills.map((s) => s.toLowerCase());
        const hasSkill = candSkills.some((s) => s.includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(s));
        if (!hasSkill) {
          skillGapMap[skillName].missingCount += 1;
        }
      });
    });
  });

  const dynamicSkillGaps = Object.entries(skillGapMap)
    .map(([skill, data]) => {
      const percent = data.totalChecked > 0 ? Math.round((data.missingCount / data.totalChecked) * 100) : 0;
      return { skill, percent, missingCount: data.missingCount, total: data.totalChecked };
    })
    .sort((a, b) => b.percent - a.percent);

  // Conversion Funnel Data
  const funnelStages = [
    { name: 'Submitted', count: filteredApps.length },
    { name: 'Parsed', count: filteredApps.filter((a) => a.status !== 'Submitted').length },
    { name: 'AI Assessed', count: filteredApps.filter((a) => a.matchScore !== undefined).length },
    { name: 'Recruiter Review', count: filteredApps.filter((a) => ['Recruiter Review', 'Shortlisted', 'Interview', 'Selected'].includes(a.status)).length },
    { name: 'Shortlisted', count: filteredApps.filter((a) => ['Shortlisted', 'Interview', 'Selected'].includes(a.status)).length },
    { name: 'Interviewed', count: filteredApps.filter((a) => ['Interview', 'Selected'].includes(a.status)).length },
    { name: 'Offer / Selected', count: filteredApps.filter((a) => a.status === 'Selected').length },
  ];

  // Score Distribution
  const scoreBuckets = [
    { label: '90 - 100% (High Alignment)', count: scores.filter((s) => s >= 90).length, color: 'bg-emerald-500' },
    { label: '75 - 89% (Strong Fit)', count: scores.filter((s) => s >= 75 && s < 90).length, color: 'bg-blue-500' },
    { label: '60 - 74% (Moderate Match)', count: scores.filter((s) => s >= 60 && s < 75).length, color: 'bg-amber-500' },
    { label: '< 60% (Skill Deficit)', count: scores.filter((s) => s < 60).length, color: 'bg-rose-500' },
  ];

  // Export Analytics Summary to JSON
  const handleExportData = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      roleFilter: selectedJobId,
      summary: {
        totalJobs,
        activeJobs,
        totalApplicants: totalApps,
        shortlistRate: `${conversionRate}%`,
        averageMatchScore: avgScore,
        completedInterviews: interviews.filter((i) => i.status === 'completed').length,
      },
      funnelStages,
      skillGaps: dynamicSkillGaps,
      scoreBuckets,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recrulens-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Recruitment Intelligence & Analytics
          </h1>
          <p className="text-sm text-neutral-500">
            Real-time talent conversion funnels, skill deficit diagnostics, and candidate quality distributions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="all">All Vacancies ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={handleExportData} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Active Vacancies</span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">{activeJobs}</div>
          <span className="text-xs text-neutral-400">{totalJobs} total published</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Applicants</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">{totalApps}</div>
          <span className="text-xs text-emerald-600 font-medium">In pipeline scope</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Shortlist Rate</span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">{conversionRate}%</div>
          <span className="text-xs text-neutral-400">{shortlistedCount} advanced to final rounds</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Avg. Match Score</span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">{avgScore}%</div>
          <span className="text-xs text-neutral-400">Avg. cycle: {averageProcessingDays} days</span>
        </Card>
      </div>

      {/* Main Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Hiring Conversion Funnel
              </h3>
              <p className="text-xs text-neutral-500">
                Candidate drop-off and progression across stages
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {totalApps} applicants
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelStages.map((stage, idx) => {
              const maxCount = funnelStages[0]?.count || 1;
              const stagePct = maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
              return (
                <div key={stage.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {idx + 1}. {stage.name}
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                      {stage.count} ({stagePct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.max(stagePct, stage.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Dynamic Skill Gap Diagnostics */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Applicant Skill Deficit Diagnostics
              </h3>
              <p className="text-xs text-neutral-500">
                Required competencies most frequently missing in resume pools
              </p>
            </div>
            <span className="text-xs text-rose-600 font-semibold">Deficit Rate</span>
          </div>

          <div className="space-y-3 pt-2">
            {dynamicSkillGaps.length > 0 ? (
              dynamicSkillGaps.slice(0, 5).map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {item.skill}
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {item.percent}% missing ({item.missingCount} of {item.total})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No skill gap data recorded for this selection.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Score Distribution & Role Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score Distribution */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Score Distribution Index
          </h3>
          <p className="text-xs text-neutral-500">
            Categorization of candidate semantic alignment scores
          </p>

          <div className="space-y-3 pt-2">
            {scoreBuckets.map((bucket) => {
              const totalScores = scores.length || 1;
              const pct = Math.round((bucket.count / totalScores) * 100);
              return (
                <div key={bucket.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${bucket.color}`} />
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">
                        {bucket.label}
                      </span>
                    </div>
                    <span className="font-bold">{bucket.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-1.5 rounded-full ${bucket.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Role Performance Table */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Active Vacancy Pipeline Health
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
                <tr>
                  <th className="pb-2 font-semibold">Role Title</th>
                  <th className="pb-2 font-semibold">Department</th>
                  <th className="pb-2 font-semibold text-center">Applicants</th>
                  <th className="pb-2 font-semibold text-center">Avg Match</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {jobs.map((job) => {
                  const jobApplicants = apps.filter((a) => a.jobId === job.id);
                  const jobScores = jobApplicants.map((a) => a.matchScore || 0).filter((s) => s > 0);
                  const jobAvg = jobScores.length > 0 ? Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length) : 0;

                  return (
                    <tr key={job.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50">
                      <td className="py-2.5 font-medium text-neutral-900 dark:text-white">
                        {job.title}
                      </td>
                      <td className="py-2.5 text-neutral-500">{job.department}</td>
                      <td className="py-2.5 text-center font-bold text-neutral-800 dark:text-neutral-200">
                        {jobApplicants.length}
                      </td>
                      <td className="py-2.5 text-center font-bold">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] ${
                            jobAvg >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : jobAvg >= 60
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}
                        >
                          {jobAvg > 0 ? `${jobAvg}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {job.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
