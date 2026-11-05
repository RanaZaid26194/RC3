import { Route, Routes, Navigate } from 'react-router-dom';
import JobsPage from '@/features/jobs/JobsPage';
import NewJobPage from '@/features/jobs/NewJobPage';
import PipelinePage from '@/features/pipeline/PipelinePage';
import CandidateReviewPage from '@/features/matching/CandidateReviewPage';
import InterviewsPage from '@/features/interviews/InterviewsPage';
import AnalyticsPage from '@/features/analytics/AnalyticsPage';
import IntelligencePage from '@/features/intelligence/IntelligencePage';
import CandidatePortalPage from '@/features/candidate-portal/CandidatePortalPage';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/jobs" replace />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/new" element={<NewJobPage />} />
      <Route path="/pipeline" element={<PipelinePage />} />
      <Route path="/candidates" element={<CandidateReviewPage />} />
      <Route path="/interviews" element={<InterviewsPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/intelligence" element={<IntelligencePage />} />
      <Route path="/portal" element={<CandidatePortalPage />} />
      <Route path="/portal/applications" element={<CandidatePortalPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
