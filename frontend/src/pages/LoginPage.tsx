import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle } from '../services/authApi';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    /* global google */
    if (window.google) {
      window.google.accounts.id.initialize({
        // @ts-ignore
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '882414192670-2epj6i8cm6prnbjbrr0kp4e9ng8bmr7u.apps.googleusercontent.com',
        callback: async (response: any) => {
          try {
            const user = await loginWithGoogle(response.credential);
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
          } catch (err: any) {
            setError(err.message || 'Google login failed');
          }
        },
      });
      const parent = document.getElementById('googleSignInDiv');
      if (parent) {
        window.google.accounts.id.renderButton(parent, { theme: 'outline', size: 'large', width: '100%' });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Access your learning hub with one click.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Email</label>
          <input
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-300">Password</label>
          <input
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot your password?
          </Link>
          <Link to="/register" className="text-slate-400 hover:text-slate-200">
            Create account
          </Link>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex justify-center">
          <Button type="submit" className="w-[60%] rounded-full shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div id="googleSignInDiv" className="w-full flex justify-center"></div>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Experiencing login issues? Please ensure third-party cookies are enabled in your browser for seamless authentication.
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
