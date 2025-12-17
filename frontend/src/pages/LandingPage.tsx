import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI/Button';

const LandingPage: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // Interactive glow effect
  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
        }
        rafRef.current = undefined;
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pt-20 pb-10 text-white selection:bg-primary/30">
      {/* Dynamic Background Glow */}
      <div className="mac-glow fixed inset-0 pointer-events-none z-0" ref={glowRef} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5 bg-black/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20" />
          <span className="text-lg font-semibold tracking-tight">Loksewa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button variant="primary" className="rounded-full px-6 shadow-lg shadow-primary/25">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-16 text-center lg:pt-32">


        <h1 className="mt-8 max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            Master Your
          </span>
          <span className="block bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Loksewa Exams
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
          A premium, intelligent workspace designed for focused preparation.
          Access curated notes, video classes, and comprehensive practice exams in a beautiful glass interface.
        </p>

        <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:flex-row">
          <Link to="/register">
            <Button variant="primary" className="h-12 w-full rounded-full px-8 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform sm:w-auto">
              Start Learning Free
            </Button>
          </Link>

        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Practice Exams</h3>
            <p className="mt-4 text-slate-400">
              Test your knowledge with our extensive collection of practice questions designed to help you succeed.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Curated Library</h3>
            <p className="mt-4 text-slate-400">
              Access a vast structured collection of PDF notes, video lectures, and syllabus breakdowns, all organized in a sleek file tree.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-2xl">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Smart Analytics</h3>
            <p className="mt-4 text-slate-400">
              Track your progress with beautiful visualizations. See exactly where you stand and what you need to focus on next.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 w-full border-t border-white/5 bg-black/20 py-12 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center gap-6 text-slate-500">
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
            <p className="text-sm">© 2024 Loksewa. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
