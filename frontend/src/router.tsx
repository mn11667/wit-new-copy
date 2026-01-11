import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FeatureLandingPage from './pages/FeatureLandingPage';
import { useAuth } from './hooks/useAuth';
import { LoadingScreen } from './components/UI/LoadingScreen';

const RequireAuth: React.FC<{ children: React.ReactElement; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isAuthenticated, initialized, loading } = useAuth();

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AuthRedirect: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated, initialized, loading } = useAuth();
  if (!initialized || loading) {
    return <LoadingScreen />;
  }
  // Only redirect if authenticated and not ADMIN, and status is not PENDING
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
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
        path="/register"
        element={
          <AuthRedirect>
            <RegisterPage />
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
      <Route
        path="/admin"
        element={
          <RequireAuth adminOnly>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />

      <Route path="/landing/:feature" element={<FeatureLandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
