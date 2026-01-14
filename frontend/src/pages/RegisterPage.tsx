import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/Layout/AuthLayout';
import { Button } from '../components/UI/Button';
import { useAuth } from '../hooks/useAuth';

const RegisterPage: React.FC = () => {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const user = await register(name, email, password);
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (err: any) {
            // If the error suggests registration is disabled, show that specifically
            if (err.message.includes('disabled')) {
                setError('Public registration is currently invite-only. Please contact administration.');
            } else {
                setError(err.message || 'Registration failed');
            }
        }
    };

    return (
        <AuthLayout title="Create an account" subtitle="Start your journey to success today.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-300">Full Name</label>
                    <input
                        id="name"
                        name="name"
                        className="glass w-full rounded-xl border-transparent bg-black/20 px-3 py-2 text-white shadow-inner focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                    />
                </div>

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
                        placeholder="Create a strong password"
                    />
                </div>

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <div className="flex justify-center pt-2">
                    <Button type="submit" className="w-[60%] rounded-full shadow-lg shadow-primary/20" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </div>

                <div className="text-center text-sm text-slate-400 mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-400 font-medium transition-colors">
                        Log in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default RegisterPage;
