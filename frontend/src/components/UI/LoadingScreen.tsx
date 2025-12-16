import React, { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { LoadingGame } from './LoadingGame';

export const LoadingScreen: React.FC = () => {
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGame(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-slate-200">
      <Spinner />
      <p className="text-sm text-center text-white/70">
        Backend is waking up — test your typing speed while we get things ready.
      </p>
      {showGame ? (
        <LoadingGame />
      ) : (
        <p className="text-xs text-white/60">If this takes a bit, a mini-game will appear to pass the time.</p>
      )}
    </div>
  );
};
