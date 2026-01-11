import React, { useEffect, useState, useRef } from 'react';
import { parseCSV } from '../../utils/csvParser';
import { Button } from '../UI/Button';

interface Question {
    id: number;
    question: string;
    options: {
        'option a': string;
        'option b': string;
        'option c': string;
        'option d': string;
    };
    correctAnswer: string;
    remarks: string;
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1n-prhxZhz3mEukX9-hFtwqXfvnzzKMqZUUEMtILIF7c/export?format=csv';

export const MCQSection: React.FC = () => {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Phases: loading -> setup -> quiz -> finished
    const [phase, setPhase] = useState<'loading' | 'setup' | 'quiz' | 'finished'>('loading');

    // Setup State
    const [questionCount, setQuestionCount] = useState(10);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchQuestions();
        return () => stopTimer();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (phase === 'quiz' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopTimer();
                        finishQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            stopTimer();
        }
        return () => stopTimer();
    }, [phase, timeLeft]);

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            const data = parseCSV(text);

            const formattedQuestions: Question[] = data
                .filter((row: any) => row.question && row['right ans'])
                .map((row: any, index: number) => ({
                    id: index,
                    question: row.question,
                    options: {
                        'option a': row['option a'],
                        'option b': row['option b'],
                        'option c': row['option c'],
                        'option d': row['option d'],
                    },
                    correctAnswer: row['right ans']?.toLowerCase().trim(),
                    remarks: row.remarks,
                }));

            setAllQuestions(formattedQuestions);
            setPhase('setup');

            // Default count adjustment if fewer questions exist
            if (formattedQuestions.length < 10) {
                setQuestionCount(formattedQuestions.length);
            }
        } catch (err) {
            setError('Failed to load questions. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        // Shuffle and Slice
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, questionCount);

        setQuestions(selected);
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setIsAnswered(false);

        // Set Timer (e.g., 60 seconds per question)
        setTimeLeft(questionCount * 60);

        setPhase('quiz');
    };

    const finishQuiz = () => {
        setPhase('finished');
    };

    const handleOptionSelect = (optionKey: string) => {
        if (isAnswered) return;
        setSelectedOption(optionKey);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        if (optionKey.toLowerCase() === currentQuestion.correctAnswer) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            finishQuiz();
        }
    };

    const restartSetup = () => {
        setPhase('setup');
        setSelectedOption(null);
        setIsAnswered(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="text-white animate-pulse">Loading questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
                <p>{error}</p>
                <Button variant="ghost" onClick={fetchQuestions} className="mt-4">Try Again</Button>
            </div>
        );
    }

    if (allQuestions.length === 0) {
        return (
            <div className="text-center py-10 text-slate-400">
                No questions found.
            </div>
        );
    }

    // --- SETUP VIEW ---
    if (phase === 'setup') {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">Target Practice</h2>
                    <p className="text-slate-400">Choose your challenge level</p>
                </div>

                <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm space-y-8">
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-300">Number of Questions</span>
                            <span className="text-emerald-400 text-lg">{questionCount}</span>
                        </div>

                        <input
                            type="range"
                            min="5"
                            max={allQuestions.length}
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>5</span>
                            <span>{allQuestions.length}</span>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Time Limit:</span>
                            <span className="text-white font-mono">{formatTime(questionCount * 60)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Topic:</span>
                            <span className="text-white">General Knowledge</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Mode:</span>
                            <span className="text-white">Random Shuffle</span>
                        </div>
                    </div>

                    <Button variant="primary" onClick={startQuiz} className="w-full py-4 text-ld font-semibold shadow-lg shadow-emerald-500/20">
                        Start Quiz
                    </Button>
                </div>
            </div>
        );
    }

    // --- FINISHED VIEW ---
    if (phase === 'finished') {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="text-4xl font-bold text-white">Quiz Completed!</div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                        <div className="text-sm text-slate-400 uppercase tracking-widest">Score</div>
                        <div className="text-3xl font-bold text-emerald-400">{score} <span className="text-lg text-slate-500">/ {questions.length}</span></div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl text-center border border-white/10">
                        <div className="text-sm text-slate-400 uppercase tracking-widest">Time Left</div>
                        <div className="text-3xl font-bold text-blue-400 font-mono">{formatTime(timeLeft)}</div>
                    </div>
                </div>

                <div className="w-full max-w-md bg-white/5 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${(score / questions.length) * 100}%` }}
                    />
                </div>

                <Button variant="primary" onClick={restartSetup} className="px-8 py-3 text-lg">
                    Practice Again
                </Button>
            </div>
        );
    }

    // --- PLAYING VIEW ---
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption?.toLowerCase() === currentQ.correctAnswer;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Header / Progress */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg bg-black/30 border border-white/10 ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">

                {/* Timer Progress Bar (Subtle background) */}
                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 opacity-50 transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / (questionCount * 60)) * 100}%` }}
                />

                <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                    {currentQ.question}
                </h2>

                <div className="grid gap-3">
                    {Object.entries(currentQ.options).filter(([_, val]) => val).map(([key, value]) => {
                        const isSelected = selectedOption === key;
                        const isRightAnswer = key.toLowerCase() === currentQ.correctAnswer;

                        let buttonStyle = "hover:bg-white/10 border-white/10 text-slate-200";

                        if (isAnswered) {
                            if (isRightAnswer) {
                                buttonStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/50";
                            } else if (isSelected) {
                                buttonStyle = "bg-red-500/20 border-red-500/50 text-red-100 ring-1 ring-red-500/50";
                            } else {
                                buttonStyle = "opacity-50 border-white/5 text-slate-500";
                            }
                        }

                        return (
                            <button
                                key={key}
                                disabled={isAnswered}
                                onClick={() => handleOptionSelect(key)}
                                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-200
                  flex items-center gap-4 group
                  ${buttonStyle}
                  ${!isAnswered && "hover:scale-[1.01] active:scale-[0.99]"}
                `}
                            >
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border
                  ${isAnswered && isRightAnswer ? 'bg-emerald-500 border-emerald-500 text-white' :
                                        isAnswered && isSelected ? 'bg-red-500 border-red-500 text-white' :
                                            'bg-white/5 border-white/20 text-slate-400 group-hover:border-white/40'}
                `}>
                                    {key.replace('option ', '').toUpperCase()}
                                </div>
                                <span className="flex-1">{value}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Feedback / Next */}
                {isAnswered && (
                    <div className={`mt-6 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-start gap-3">
                            <div className={`text-2xl ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isCorrect ? '✓' : '✕'}
                            </div>
                            <div className="flex-1">
                                <p className={`font-semibold ${isCorrect ? 'text-emerald-200' : 'text-red-200'}`}>
                                    {isCorrect ? 'Correct!' : 'Incorrect'}
                                </p>
                                {currentQ.remarks && (
                                    <p className="text-slate-300 mt-1 text-sm bg-black/20 p-2 rounded-lg inline-block">
                                        💡 {currentQ.remarks}
                                    </p>
                                )}
                            </div>
                            <Button onClick={nextQuestion}>
                                {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
