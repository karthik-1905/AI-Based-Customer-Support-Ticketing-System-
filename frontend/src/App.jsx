import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import LoadingSpinner from './components/ui/LoadingSpinner.jsx';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/auth/Login.jsx'));
const Register = lazy(() => import('./pages/auth/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'));
const RecruiterDashboard = lazy(() => import('./pages/dashboard/RecruiterDashboard.jsx'));
const CandidateDashboard = lazy(() => import('./pages/dashboard/CandidateDashboard.jsx'));
const JobsListing = lazy(() => import('./pages/jobs/JobsListing.jsx'));
const CreateJob = lazy(() => import('./pages/jobs/CreateJob.jsx'));
const JobDetail = lazy(() => import('./pages/jobs/JobDetail.jsx'));
const CandidatesList = lazy(() => import('./pages/candidates/CandidatesList.jsx'));
const CandidateProfile = lazy(() => import('./pages/candidates/CandidateProfile.jsx'));
const HiringPipeline = lazy(() => import('./pages/pipeline/HiringPipeline.jsx'));
const ResumeAnalyzer = lazy(() => import('./pages/resume/ResumeAnalyzer.jsx'));
const InterviewScheduler = lazy(() => import('./pages/interviews/InterviewScheduler.jsx'));
const Analytics = lazy(() => import('./pages/analytics/Analytics.jsx'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner overlay />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Dashboard Router — picks correct dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'candidate') return <CandidateDashboard />;
  return <RecruiterDashboard />;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner overlay />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobsListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <CandidatesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidates/:id"
          element={
            <ProtectedRoute>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <HiringPipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-analyzer"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interviews"
          element={
            <ProtectedRoute>
              <InterviewScheduler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="recruiter">
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
