import React, { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { LoadingGame } from './LoadingGame';

interface LoadingScreenProps {
  message?: string;
  enableGame?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading resources...",
  enableGame = true
}) => {
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    if (!enableGame) return;
    const timer = setTimeout(() => setShowGame(true), 2000);
    return () => clearTimeout(timer);
  }, [enableGame]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-slate-200">
      <Spinner />
      <p className="text-sm text-center text-white/70">
        {message}
      </p>
      {enableGame && (
        showGame ? (
          <LoadingGame />
        ) : (
          <p className="text-xs text-white/60">If this takes a bit, a mini-game will appear to pass the time.</p>
        )
      )}
    </div>
  );
};
