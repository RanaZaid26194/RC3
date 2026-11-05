import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Sparkles, TrendingUp, Target, ArrowRight, Zap, BarChart3, MapPin, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MagicButton, SubmitButton } from '@/components/ui/Button';
import type { Job, Application } from '@/types';
import { load } from '@/lib/storage';

// Helper function to count applications per job
const getAppCountForJob = (jobId: string) => {
  const applications = load<Application[]>('applications', []);
  return applications.filter((a) => a.jobId === jobId).length;
};

export default function Home() {
  const navigate = useNavigate();
  
  // Load data
  const jobs = load<Job[]>('jobs', []);
  const apps = load<Application[]>('applications', []);
  
  // Metrics calculation
  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplications = apps.length;
  const shortlistedCount = apps.filter((a) => a.status === 'Shortlisted' || a.status === 'Selected').length;
  const avgMatchScore = apps.length > 0 
    ? Math.round(apps.reduce((sum, app) => sum + (app.matchScore || 0), 0) / apps.length)
    : 0;

  const recentJobs = [...jobs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  const quickStats = [
    { label: 'Active Jobs', value: activeJobs.toString(), icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-100' },
    { label: 'Applications', value: totalApplications.toString(), icon: Users, color: 'text-accent-600', bg: 'bg-accent-100' },
    { label: 'Shortlisted', value: shortlistedCount.toString(), icon: Target, color: 'text-success-600', bg: 'bg-success-100' },
    { label: 'Avg Match Score', value: `${avgMatchScore}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-brand-700 p-8 shadow-lg">
        <div className="absolute right-[-20px] top-[-20px] h-40 w-40 opacity-10">
          <Sparkles className="h-full w-full" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-white/90">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered Recruitment Platform</span>
          </div>
          <h1 className="mb-4 display-text text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Smart Talent Discovery & Candidate Matching
          </h1>
          <p className="mb-6 text-lg text-white/90">
            Publish jobs, parse resumes automatically, and get explainable AI-powered candidate scores with skill gap insights.
          </p>
          <div className="flex flex-wrap gap-3">
            <MagicButton onClick={() => navigate('/pipeline')} size="lg" className="group">
              View Hiring Pipeline
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagicButton>
            <SubmitButton variant="outline" onClick={() => navigate('/jobs/new')} loading={false}>
              Create New Job
            </SubmitButton>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div>
        <h2 className="mb-4 heading-3">Dashboard Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md"
            >
              <div className={`absolute left-0 top-0 h-full w-1 ${stat.bg}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} rounded-full p-3`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${stat.bg.replace('bg-', 'bg-').replace('100', '500')}`}
                  style={{ width: stat.label.includes('Applications') ? '70%' : stat.label.includes('Score') ? '80%' : '60%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured Jobs */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="heading-3">Featured Openings</h2>
            <Button variant="ghost" onClick={() => navigate('/jobs')} size="sm" className="gap-2">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          {recentJobs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentJobs.map((job) => {
                const appCount = getAppCountForJob(job.id);
                return (
                  <div
                    key={job.id}
                    className="group cursor-pointer rounded-[var(--radius-lg)] border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md"
                    onClick={() => navigate(`/pipeline?jobId=${job.id}`)}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-xs font-semibold text-brand-600">{job.department}</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
                        Open
                      </span>
                    </div>
                    
                    <h3 className="mb-2 font-semibold text-neutral-900 line-clamp-1">{job.title}</h3>
                    
                    <div className="mb-3 space-y-1.5 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location} • {job.type}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 3).map((req) => (
                          <span
                            key={req.skill}
                            className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50"
                          >
                            {req.skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-[10px] text-neutral-400">+{job.requiredSkills.length - 3}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
                        <Users className="h-3.5 w-3.5 text-brand-600" />
                        {appCount} applied
                      </div>
                      <button className="text-xs text-brand-600 hover:text-brand-700 transition-colors">
                        Review →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
              <Briefcase className="mx-auto mb-3 h-12 w-12 text-neutral-400" />
              <h3 className="font-semibold text-neutral-700">No jobs posted yet</h3>
              <p className="mt-1 text-sm text-neutral-500">Start by creating your first job opening</p>
              <Button variant="secondary" className="mt-4" onClick={() => navigate('/jobs/new')}>
                <Plus className="h-4 w-4" /> Post Your First Job
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div>
          <h2 className="mb-4 heading-3">Quick Actions</h2>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/jobs/new')}
            >
              <Plus className="h-4 w-4 text-brand-600" />
              Create New Job
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/pipeline')}
            >
              <BarChart3 className="h-4 w-4 text-accent-600" />
              Review Pipeline
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/resumes')}
            >
              <FileText className="h-4 w-4 text-success-600" />
              Upload Resumes
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/intelligence')}
            >
              <Zap className="h-4 w-4 text-warning-600" />
              Search Candidates
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="h-4 w-4 text-blue-600" />
              View Analytics
            </Button>
          </div>

          {/* AI Feature Highlight */}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-accent-200 bg-accent-50 p-5 dark:border-accent-800 dark:bg-accent-900/40">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-600" />
              <span className="text-sm font-semibold text-accent-800 dark:text-accent-200">AI-Powered Insights</span>
            </div>
            <p className="text-sm text-accent-700 dark:text-accent-300">
              Get explainable candidate scores with skill gap analysis and interview question generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
