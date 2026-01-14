import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';


const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
          <label htmlFor="email" className="text-sm font-semibold text-slate-300">Email</label>
          <input
            id="email"
            name="email"
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="loksewa@gmail.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-300">Password</label>
          <input
            id="password"
            name="password"
            className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="loksewa123"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex justify-center">
          <Button type="submit" className="w-[60%] rounded-full shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
