import React, { useState, useEffect, useRef } from 'react';

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroState {
    mode: PomodoroMode;
    timeLeft: number; // seconds
    isActive: boolean;
    sessions: number; // completed work sessions
    totalStudyTime: number; // total seconds studied
}

interface PomodoroTimerProps {
    onClose?: () => void;
    isCompact?: boolean; // Compact mode for header display
}

const MODE_DURATIONS = {
    work: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60, // 15 minutes
};

const MODE_LABELS = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
};

const MODE_COLORS = {
    work: 'from-blue-500 to-blue-600',
    shortBreak: 'from-green-500 to-green-600',
    longBreak: 'from-purple-500 to-purple-600',
};

const STORAGE_KEY = 'loksewa-pomodoro-state';
const STATS_KEY = 'loksewa-pomodoro-stats';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onClose, isCompact = false }) => {
    const [state, setState] = useState<PomodoroState>(() => {
        // Load from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved pomodoro state', e);
            }
        }
        return {
            mode: 'work',
            timeLeft: MODE_DURATIONS.work,
            isActive: false,
            sessions: 0,
            totalStudyTime: 0,
        };
    });

    const [isMinimized, setIsMinimized] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [isEditing, setIsEditing] = useState(!state.isActive); // Default to editing if not running
    const intervalRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Save state to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    // Force editing mode on mount (dedicated effect)
    useEffect(() => {
        if (!isCompact) {
            setIsEditing(true);
        }
    }, [isCompact]);

    // Timer logic
    useEffect(() => {
        if (state.isActive && state.timeLeft > 0) {
            intervalRef.current = window.setInterval(() => {
                setState((prev) => {
                    const newTimeLeft = prev.timeLeft - 1;
                    const newTotalStudyTime =
                        prev.mode === 'work' ? prev.totalStudyTime + 1 : prev.totalStudyTime;

                    if (newTimeLeft <= 0) {
                        // Timer complete
                        playNotification();

                        // Determine next mode
                        let nextMode: PomodoroMode;
                        let nextSessions = prev.sessions;

                        if (prev.mode === 'work') {
                            nextSessions = prev.sessions + 1;
                            // Every 4 work sessions, take a long break
                            nextMode = nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
                        } else {
                            // After break, back to work
                            nextMode = 'work';
                        }

                        return {
                            ...prev,
                            mode: nextMode,
                            timeLeft: MODE_DURATIONS[nextMode],
                            isActive: false, // Auto-pause after mode change
                            sessions: nextSessions,
                            totalStudyTime: newTotalStudyTime,
                        };
                    }

                    return {
                        ...prev,
                        timeLeft: newTimeLeft,
                        totalStudyTime: newTotalStudyTime,
                    };
                });
            }, 1000);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [state.isActive, state.timeLeft]);

    const playNotification = () => {
        // Use Web Audio API for notification sound
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio notification not available');
        }

        // Browser notification (if permitted)
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: `${MODE_LABELS[state.mode]} complete!`,
                icon: '/favicon.ico',
            });
        }
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    const toggleTimer = () => {
        if (!state.isActive) {
            requestNotificationPermission();
        }
        setState((prev) => ({ ...prev, isActive: !prev.isActive }));
    };

    const resetTimer = () => {
        setState((prev) => ({
            ...prev,
            timeLeft: MODE_DURATIONS[prev.mode],
            isActive: false,
        }));
    };

    const skipMode = () => {
        setState((prev) => {
            let nextMode: PomodoroMode;
            if (prev.mode === 'work') {
                nextMode = 'shortBreak';
            } else {
                nextMode = 'work';
            }
            return {
                ...prev,
                mode: nextMode,
                timeLeft: MODE_DURATIONS[nextMode],
                isActive: false,
            };
        });
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const progress = ((MODE_DURATIONS[state.mode] - state.timeLeft) / MODE_DURATIONS[state.mode]) * 100;

    // Compact mode for status bar - 8-segment LED display style
    if (isCompact) {
        return (
            <div className="flex items-center gap-2">
                {/* 7-segment LED display */}
                {/* 7-segment LED display / Slider */}
                <div className="flex items-center px-4 py-1 rounded-md bg-black/90 border border-white/20 min-w-[130px] justify-center relative group">
                    {isEditing ? (
                        <input
                            type="range"
                            min="1"
                            max="60"
                            step="1"
                            value={Math.ceil(state.timeLeft / 60)}
                            onChange={(e) => {
                                const newMinutes = parseInt(e.target.value);
                                setState(prev => ({
                                    ...prev,
                                    timeLeft: newMinutes * 60,
                                    isActive: false
                                }));
                            }}
                            onBlur={() => setIsEditing(false)}
                            className="w-24 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                            autoFocus
                        />
                    ) : (
                        <span
                            onClick={() => !state.isActive && setIsEditing(true)}
                            className={`text-2xl tracking-widest tabular-nums ${!state.isActive ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                            title={!state.isActive ? "Click to set time" : undefined}
                            style={{
                                fontFamily: '"DSEG7 Classic", monospace',
                                fontWeight: 700,
                                color: state.mode === 'work' ? '#00ff00' : state.mode === 'shortBreak' ? '#ffaa00' : '#ff00ff',
                                textShadow: `0 0 10px ${state.mode === 'work' ? '#00ff00' : state.mode === 'shortBreak' ? '#ffaa00' : '#ff00ff'}`,
                                letterSpacing: '0.1em',
                                filter: 'brightness(1.5)'
                            }}
                        >
                            {formatTime(state.timeLeft)}
                        </span>
                    )}

                    {/* Tooltip hint on hover (only when paused and not editing) */}
                    {!state.isActive && !isEditing && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap border border-white/10 z-50">
                            Click to edit
                        </div>
                    )}
                </div>

                {/* Play/Pause button */}
                <button
                    onClick={toggleTimer}
                    className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition"
                    title={state.isActive ? 'Pause' : 'Start'}
                >
                    {state.isActive ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>

                {/* Stop/Reset button */}
                <button
                    onClick={resetTimer}
                    className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white transition"
                    title="Reset"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v12H6z" />
                    </svg>
                </button>

                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition"
                        title="Close Timer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        );
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{formatTime(state.timeLeft)}</span>
                    {state.isActive && <span className="animate-pulse">●</span>}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:w-80">
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${MODE_COLORS[state.mode]} p-3 sm:p-4`}>
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold">{MODE_LABELS[state.mode]}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="p-1 hover:bg-white/20 rounded transition"
                                title="Statistics"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-1 hover:bg-white/20 rounded transition"
                                title="Minimize"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/20 rounded transition"
                                    title="Close"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {showStats ? (
                    /* Statistics View */
                    <div className="p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-white mb-2">Today's Statistics</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Sessions</div>
                                <div className="text-2xl font-bold text-white">{state.sessions}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-slate-400">Study Time</div>
                                <div className="text-2xl font-bold text-white">{formatDuration(state.totalStudyTime)}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowStats(false)}
                            className="w-full mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition"
                        >
                            Back to Timer
                        </button>
                    </div>
                ) : (
                    /* Timer View */
                    <>
                        {/* Circular Progress */}
                        <div className="p-4 sm:p-6 flex flex-col items-center">
                            <div className="relative w-40 h-40">
                                {/* Background circle */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    {/* Progress circle */}
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Time display */}
                                {/* Time display / Slider */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                                    {isEditing ? (
                                        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-200">
                                            <input
                                                type="range"
                                                min="1"
                                                max="60"
                                                step="1"
                                                value={Math.ceil(state.timeLeft / 60)}
                                                onChange={(e) => {
                                                    const newMinutes = parseInt(e.target.value);
                                                    setState(prev => ({
                                                        ...prev,
                                                        timeLeft: newMinutes * 60,
                                                        isActive: false
                                                    }));
                                                }}
                                                className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
                                                autoFocus
                                            />
                                            <div className="text-2xl font-bold text-white">
                                                {Math.ceil(state.timeLeft / 60)}m
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="text-4xl font-bold text-white tabular-nums cursor-pointer hover:scale-110 transition-transform"
                                                onClick={() => setIsEditing(true)}
                                                title="Click to edit time"
                                            >
                                                {formatTime(state.timeLeft)}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Session {state.sessions + 1}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="p-4 pt-0 space-y-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleTimer}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${state.isActive
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                        }`}
                                >
                                    {state.isActive ? 'Pause' : 'Start'}
                                </button>
                                <button
                                    onClick={resetTimer}
                                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                                    title="Reset"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button
                                    onClick={skipMode}
                                    className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
                                    title="Skip"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
