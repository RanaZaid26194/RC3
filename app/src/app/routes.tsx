import { Route, Routes, Navigate } from 'react-router-dom';
import JobsPage from '@/features/jobs/JobsPage';
import NewJobPage from '@/features/jobs/NewJobPage';
import PipelinePage from '@/features/pipeline/PipelinePage';
import CandidateReviewPage from '@/features/matching/CandidateReviewPage';
import InterviewsPage from '@/features/interviews/InterviewsPage';
import AnalyticsPage from '@/features/analytics/AnalyticsPage';
import IntelligencePage from '@/features/intelligence/IntelligencePage';
import CandidatePortalPage from '@/features/candidate-portal/CandidatePortalPage';
import ResumeUploadPage from '@/features/resumes/ResumeUploadPage';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth & Legal Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Default Redirection */}
      <Route path="/" element={<Navigate to="/jobs" replace />} />

      {/* Recruiter-Only Protected Routes (R1.2 Authorization Barrier) */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <JobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/new"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <NewJobPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <PipelinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <CandidateReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interviews"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <InterviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intelligence"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <IntelligencePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resumes"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <ResumeUploadPage />
          </ProtectedRoute>
        }
      />

      {/* Candidate & Recruiter Accessible Routes */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
            <CandidatePortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal/applications"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
            <CandidatePortalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Friendly 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
