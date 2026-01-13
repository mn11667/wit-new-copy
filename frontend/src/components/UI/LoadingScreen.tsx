import React, { useEffect, useState } from 'react';
import { getRandomQuote } from '../../data/quotes';

interface LoadingScreenProps {
  message?: string;
  enableGame?: boolean; // Kept for prop compatibility, but we are switching to "Zen Mode"
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading..."
}) => {
  const [quote, setQuote] = useState("");
  const [displayedQuote, setDisplayedQuote] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (!quote) return;
    if (charIndex < quote.length) {
      const timeout = setTimeout(() => {
        setDisplayedQuote((prev) => prev + quote[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 15); // Faster typing speed (15ms)
      return () => clearTimeout(timeout);
    }
  }, [quote, charIndex]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-slate-950/90 backdrop-blur-md transition-all duration-500">

      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        {/* Animated Loader Graphic */}
        <div className="mb-8 relative">
          <div className="w-16 h-16 border-4 border-slate-700/50 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-secondary/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Message */}
        <p className="text-secondary text-sm font-medium tracking-[0.2em] uppercase mb-6 animate-fade-in-up">
          {message}
        </p>

        {/* Quote Card */}
        <div className="glass p-8 rounded-2xl border border-white/10 shadow-2xl bg-black/40 min-h-[200px] w-full flex flex-col justify-center items-center transform transition-all hover:scale-[1.02]">
          <span className="text-4xl text-white/10 mb-2 font-serif self-start">"</span>
          <p className="text-xl md:text-2xl font-light text-slate-100 leading-relaxed font-serif relative z-10">
            {displayedQuote}
            <span className="animate-pulse text-primary font-bold ml-1">|</span>
          </p>
          <span className="text-4xl text-white/10 mt-2 font-serif self-end">"</span>

          <div className="mt-8 h-1 w-32 bg-slate-800/50 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>

        <p className="mt-8 text-[10px] text-slate-500 font-mono tracking-widest opacity-60">
          PROVISIONED BY WIT NEA
        </p>
      </div>
    </div>
  );
};
