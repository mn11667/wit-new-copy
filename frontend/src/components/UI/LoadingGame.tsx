import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SENTENCES = [
  'Every keystroke is a step closer to mastery.',
  'Small wins compound into big victories.',
  'You are one focused session away from progress.',
  'Consistency beats intensity when building skills.',
  'Deep breaths, steady hands, precise typing.',
  'Slow is smooth, smooth becomes fast.',
  'Momentum is built one word at a time.',
  'Courage is starting before you feel ready.',
  'Practice in silence, let results make the noise.',
  'Today you train your fingers, tomorrow your future.',
  'Mistakes are proof you are trying something new.',
  'Clarity comes from doing the work, not waiting.',
  'Repetition turns effort into instinct.',
  'A calm mind makes faster decisions.',
  'Discipline is choosing what you want most over now.',
  'Your future self thanks you for showing up.',
  'Typing fast starts with typing accurately.',
  'Focus on accuracy, speed will follow.',
  'You are improving even when progress feels slow.',
  'Stay patient; growth is rarely instant.',
  'Sharpen the saw, then swing with confidence.',
  'Talent is nothing without consistent practice.',
  'Your best work lives beyond your comfort zone.',
  'Push past hesitation; action cures fear.',
  'Turn challenge into fuel for momentum.',
  'Precision today becomes speed tomorrow.',
  'Show up, tune in, and let your fingers fly.',
  'A great day begins with a single focused minute.',
  'You are capable of more than you think.',
  'Keep going; you are closer than you realize.',
];

const computeWpm = (charCount: number, elapsedMs: number) => {
  const minutes = Math.max(elapsedMs / 60000, 1 / 120);
  return Math.round((charCount / 5) / minutes);
};

export const LoadingGame: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(() => Math.floor(Math.random() * SENTENCES.length));
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [status, setStatus] = useState<'ready' | 'typing' | 'done'>('ready');
  const [lastWpm, setLastWpm] = useState(0);
  const [lastAccuracy, setLastAccuracy] = useState(100);
  const [bestWpm, setBestWpm] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const target = SENTENCES[currentIndex];

  const calcErrors = useCallback(
    (value: string) => {
      let count = 0;
      for (let i = 0; i < value.length; i += 1) {
        if (value[i] !== target[i]) {
          count += 1;
        }
      }
      return count;
    },
    [target],
  );

  const errors = useMemo(() => calcErrors(input), [calcErrors, input]);
  const currentAccuracy = input.length === 0 ? 100 : Math.max(0, Math.round(((input.length - errors) / input.length) * 100));
  const progress = Math.min(1, input.length / target.length);

  const liveWpm = useMemo(() => {
    if (!startTime) return 0;
    return computeWpm(Math.max(input.length, 1), Date.now() - startTime);
  }, [input.length, startTime]);

  const displayedWpm = status === 'done' ? lastWpm : liveWpm;
  const displayedAccuracy = status === 'done' ? lastAccuracy : currentAccuracy;

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const finishRound = useCallback(
    (value: string, startedAt?: number) => {
      const started = startTime ?? startedAt;
      if (!started) return;
      const elapsedMs = Math.max(Date.now() - started, 1);
      const finalWpm = computeWpm(target.length, elapsedMs);
      const finalAccuracy =
        value.length === 0 ? 100 : Math.max(0, Math.round(((value.length - calcErrors(value)) / value.length) * 100));

      setLastWpm(finalWpm);
      setLastAccuracy(finalAccuracy);
      setBestWpm((prev) => Math.max(prev, finalWpm));
      setStartTime(null);
      setStatus('done');
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    },
    [calcErrors, startTime, target.length],
  );

  const handleChange = (value: string) => {
    const startedAt = startTime ?? Date.now();
    if (!startTime) setStartTime(startedAt);
    setStatus('typing');
    setInput(value);
    if (value === target) {
      finishRound(value, startedAt);
    }
  };

  const restartLine = useCallback(() => {
    setInput('');
    setStartTime(null);
    setStatus('ready');
    focusInput();
  }, [focusInput]);

  const goToNext = useCallback(
    (resetStreak = false) => {
      setInput('');
      setStartTime(null);
      setStatus('ready');
      setCurrentIndex((prev) => {
        const candidate = Math.floor(Math.random() * SENTENCES.length);
        return candidate === prev ? (candidate + 1) % SENTENCES.length : candidate;
      });
      if (resetStreak) setStreak(0);
      focusInput();
    },
    [focusInput],
  );

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-slate-900/30 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)] glass">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-secondary/70">Test your typing speed</p>
          <p className="text-sm text-white/70">Backend is waking up — warm up your fingers on motivating lines.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary shadow-[0_0_0_1px_rgba(56,189,248,0.35)]">
            {status === 'done' ? 'Last' : 'Live'} WPM {displayedWpm}
          </span>
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]">
            Accuracy {displayedAccuracy}%
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Sentence</p>
          <p className="text-sm font-semibold text-white">{currentIndex + 1} / {SENTENCES.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Streak</p>
          <p className="text-sm font-semibold text-white">{streak} <span className="text-xs text-white/60">best {bestStreak}</span></p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Best WPM</p>
          <p className="text-sm font-semibold text-white">{bestWpm}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{status === 'done' ? 'Last Accuracy' : 'Current Accuracy'}</p>
          <p className="text-sm font-semibold text-white">{displayedAccuracy}%</p>
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-white/5 via-white/0 to-black/40 p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.18),transparent_35%)] opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-25" />
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Motivation line</p>
          <div className="relative z-10 mt-2 flex flex-wrap text-base leading-7">
            {target.split('').map((char, idx) => {
              const typedChar = input[idx];
              const isFuture = typedChar === undefined;
              const isCorrect = typedChar === char;
              return (
                <span
                  key={`${char}-${idx}`}
                  className={clsx(
                    'px-[1px] transition-colors duration-150',
                    isFuture && 'text-white/35',
                    !isFuture && isCorrect && 'text-white',
                    !isFuture && !isCorrect && 'rounded-[3px] bg-rose-500/25 text-rose-50 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]',
                  )}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && status === 'done') {
              event.preventDefault();
              goToNext();
            }
          }}
          placeholder="Type the sentence here..."
          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 shadow-inner shadow-black/40 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/35"
        />
      </div>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 shadow-inner shadow-black/40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-emerald-400 transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(6, progress * 100))}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/60">
          <span>Finish the sentence to log WPM. Press Enter to jump to the next line when done.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restartLine}
              className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/70 transition hover:bg-white/20"
            >
              Restart line
            </button>
            <button
              type="button"
              onClick={() => goToNext(false)}
              className="rounded-full bg-primary/20 px-3 py-1 font-semibold text-primary transition hover:bg-primary/30 hover:text-white"
            >
              Next line
            </button>
            <button
              type="button"
              onClick={() => goToNext(true)}
              className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white/70 transition hover:bg-rose-500/30 hover:text-white"
            >
              Skip (reset streak)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
