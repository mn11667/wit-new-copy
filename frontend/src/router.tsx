import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/UI/LoadingScreen';

// Eager load public pages (Non-lazy for instant initial interaction)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import FeatureLandingPage from './pages/FeatureLandingPage';

// Lazy load Dashboard (Loads only after login)
const UserDashboardPage = React.lazy(() => import('./pages/UserDashboardPage'));

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthRedirect: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated, initialized, loading } = useAuth();
  if (!initialized || loading) {
    return <LoadingScreen />;
  }
  // Only redirect if authenticated
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRouter: React.FC = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Suspense fallback={<LoadingScreen message="SYSTEM LOADING..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <UserDashboardPage />
            </RequireAuth>
          }
        />

        {/* Admin route removed as per request for static site */}

        <Route path="/landing/:feature" element={<FeatureLandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
