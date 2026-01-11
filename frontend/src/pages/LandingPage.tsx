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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b border-white/5 bg-black/10 backdrop-blur-md transition-all duration-300 hover:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20 ring-1 ring-white/20" />
          <span className="text-lg font-semibold tracking-tight text-white/90">Loksewa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <Button variant="primary" className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-12 text-center lg:pt-24">

        {/* Typography */}
        <h1 className="mt-8 max-w-5xl text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 pb-2">
            Master Your
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-4">
            Loksewa Exams
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl font-light leading-relaxed">
          A premium, intelligent workspace designed for focused preparation.
          Access curated notes, video classes, and comprehensive practice exams in a beautiful glass interface.
        </p>

        <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:flex-row">
          <Link to="/register">
            <Button variant="primary" className="h-12 w-full rounded-full px-8 text-lg font-semibold shadow-xl shadow-blue-500/20 hover:scale-105 hover:shadow-blue-500/30 transition-all duration-300 sm:w-auto">
              Start Learning Free
            </Button>
          </Link>
        </div>

        {/* 3D Dashboard Mockup - The Visual Anchor */}
        <div className="relative mt-20 w-full max-w-5xl [perspective:2000px] group">
          {/* Main Tilted Window */}
          <div className="relative mx-auto w-full aspect-[16/10] rounded-xl border border-white/10 bg-[#020617]/80 backdrop-blur-xl shadow-2xl transition-all duration-700 ease-out [transform:rotateX(20deg)_scale(0.9)] group-hover:[transform:rotateX(0deg)_scale(1)] overflow-hidden">
            {/* Window Controls */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
            </div>

            {/* Mock Content */}
            <div className="absolute top-8 bottom-0 left-0 right-0 p-6 flex gap-6">
              {/* Sidebar */}
              <div className="hidden md:flex w-48 flex-col gap-4 border-r border-white/5 pr-6 opacity-80 pt-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="h-4 w-4 rounded bg-blue-400/80"></div>
                  <span className="text-xs font-medium text-blue-200">Dashboard</span>
                </div>
                <div className="flex flex-col gap-2">
                  {['My Courses', 'Practice Exams', 'Question Bank', 'Live Classes'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group/item">
                      <div className="h-3 w-3 rounded-full bg-slate-600 group-hover/item:bg-slate-400 transition-colors"></div>
                      <span className="text-[11px] font-medium text-slate-400 group-hover/item:text-slate-200 transition-colors">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto mb-2 p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-white/5">
                  <div className="text-[10px] font-semibold text-purple-300 mb-1">Weekly Goal</div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[70%] bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 flex flex-col gap-6">

                {/* Header Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/10 p-4 relative overflow-hidden group/stat flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-blue-300/60 font-semibold">Daily Streak</div>
                      <div className="text-2xl font-bold text-white mt-1">12 <span className="text-sm font-normal text-blue-300/50">days</span></div>
                    </div>
                    <div className="absolute right-3 bottom-3 flex gap-1 items-end h-6">
                      <div className="w-1 bg-blue-400/50 rounded-full animate-equalize delay-75 h-[40%]"></div>
                      <div className="w-1 bg-blue-400/50 rounded-full animate-equalize delay-150 h-[80%]"></div>
                      <div className="w-1 bg-blue-400/50 rounded-full animate-equalize delay-300 h-[60%]"></div>
                    </div>
                  </div>

                  <div className="h-24 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/10 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-purple-300/60 font-semibold">Questions</div>
                      <div className="text-2xl font-bold text-white mt-1">843</div>
                    </div>
                    <div className="absolute right-3 bottom-3 flex gap-1 items-end h-6">
                      <div className="w-1 bg-purple-400/50 rounded-full animate-equalize delay-100 h-[30%]"></div>
                      <div className="w-1 bg-purple-400/50 rounded-full animate-equalize delay-200 h-[90%]"></div>
                      <div className="w-1 bg-purple-400/50 rounded-full animate-equalize delay-75 h-[50%]"></div>
                    </div>
                  </div>

                  <div className="h-24 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/10 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-pink-300/60 font-semibold">Accuracy</div>
                      <div className="text-2xl font-bold text-white mt-1">92%</div>
                    </div>
                    <div className="absolute right-3 bottom-3 flex gap-1 items-end h-6">
                      <div className="w-1 bg-pink-400/50 rounded-full animate-equalize delay-300 h-[70%]"></div>
                      <div className="w-1 bg-pink-400/50 rounded-full animate-equalize delay-100 h-[40%]"></div>
                      <div className="w-1 bg-pink-400/50 rounded-full animate-equalize delay-200 h-[85%]"></div>
                    </div>
                  </div>
                </div>

                {/* Video Area */}
                <div className="flex-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden relative group/video">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                  <iframe
                    className="h-full w-full object-cover opacity-80 mix-blend-luminosity group-hover/video:mix-blend-normal group-hover/video:opacity-100 transition-all duration-700 pointer-events-none"
                    src="https://www.youtube.com/embed/bY_gRApfoJk?autoplay=1&mute=1&controls=0&loop=1&playlist=bY_gRApfoJk&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1"
                    title="Background Video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ pointerEvents: 'none' }}
                  ></iframe>

                  {/* Play Interface Overlay */}
                  <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-white border-b-[4px] border-b-transparent ml-1"></div>
                    </div>
                    <div className="text-xs font-medium text-white/80">
                      <span className="block text-white">Live Class: IQ & Aptitude</span>
                      <span className="text-white/50">Instructor: R. Sharma • 245 watching</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
          </div>

          {/* Shadow underneath */}
          <div className="absolute -bottom-10 left-[10%] right-[10%] h-20 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-blue-500/30"></div>
        </div>

        {/* Bento Grid Features */}
        <div className="mt-32 w-full max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Everything you need to excel</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">

            {/* Card 1: Practice Exams (Large Span) */}
            <div className="group relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl transition-all group-hover:bg-blue-500/20"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 shadow-inner shadow-white/10">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white">Practice Exams</h3>
                <p className="mt-4 text-slate-400 max-w-md text-lg">
                  Experience real exam conditions with our adaptive testing engine. Get instant feedback, detailed logical explanations, and track your improvement over time.
                </p>
                <div className="mt-auto pt-8">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">Timed Tests</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">Negative Marking</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300 ring-1 ring-white/10">Performance Analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Curated Library (Top Right) */}
            <div className="group relative col-span-1 md:col-span-1 md:row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Curated Library</h3>
              <p className="mt-2 text-sm text-slate-400">
                Structured PDF notes, acts, and video lectures organized for rapid revision.
              </p>
            </div>

            {/* Card 3: Smart Analytics (Bottom Right) */}
            <div className="group relative col-span-1 md:col-span-1 md:row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Smart Analytics</h3>
              <p className="mt-2 text-sm text-slate-400">
                Visualize your progress. Identify weak spots and optimize your study path.
              </p>
            </div>

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
