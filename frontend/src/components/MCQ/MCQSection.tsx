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

interface UserAnswer {
    questionId: number;
    questionText: string;
    selectedOption: string; // 'option a', etc.
    correctOption: string;
    isCorrect: boolean;
    remarks: string;
}

const SHEET_URL = import.meta.env.VITE_MCQ_SHEET_URL || '';

if (!SHEET_URL) {
    console.warn('VITE_MCQ_SHEET_URL is not defined in environment variables');
}

export const MCQSection: React.FC = () => {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Phases: loading -> setup -> quiz -> finished
    const [phase, setPhase] = useState<'loading' | 'setup' | 'quiz' | 'finished'>('loading');

    // Setup State
    const [customCount, setCustomCount] = useState(10);
    const [isExamMode, setIsExamMode] = useState(false);

    // Quiz State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Results Tracking
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

    // Timer State
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [initialTime, setInitialTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // AI State
    const [aiExplanation, setAiExplanation] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
    }, [phase]);

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
                setCustomCount(formattedQuestions.length);
            }
        } catch (err) {
            setError('Failed to load questions. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = (mode: 'custom' | 'exam') => {
        let count = customCount;
        let timePerQuestion = 60; // 1 min

        if (mode === 'exam') {
            count = Math.min(100, allQuestions.length);
            setIsExamMode(true);
        } else {
            setIsExamMode(false);
        }

        // Shuffle and Slice
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);

        setQuestions(selected);
        setCurrentIndex(0);
        setUserAnswers([]);
        setSelectedOption(null);
        setIsAnswered(false);

        const totalTime = count * timePerQuestion;
        setTimeLeft(totalTime);
        setInitialTime(totalTime);

        setPhase('quiz');
    };

    const finishQuiz = () => {
        stopTimer();
        setPhase('finished');
    };

    const handleOptionSelect = (optionKey: string) => {
        if (isAnswered) return;

        setSelectedOption(optionKey);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = optionKey.toLowerCase() === currentQuestion.correctAnswer;

        // Check if we already answered this question (just in case)
        const existing = userAnswers.find(a => a.questionId === currentQuestion.id);
        if (!existing) {
            const newAnswer: UserAnswer = {
                questionId: currentQuestion.id,
                questionText: currentQuestion.question,
                selectedOption: optionKey,
                correctOption: currentQuestion.correctAnswer,
                isCorrect: isCorrect,
                remarks: currentQuestion.remarks
            };
            setUserAnswers(prev => [...prev, newAnswer]);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setAiExplanation(null); // Reset AI state
        } else {
            finishQuiz();
        }
    };

    const restartSetup = () => {
        setPhase('setup');
        setSelectedOption(null);
        setIsAnswered(false);
        setUserAnswers([]);
        setAiExplanation(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchGeminiExplanation = async () => {
        if (!GEMINI_API_KEY) {
            alert("AI API Key is missing. Please check your .env file.");
            return;
        }

        setIsAiLoading(true);
        const currentQ = questions[currentIndex];

        const prompt = `
            Question: ${currentQ.question}
            Options:
            A: ${currentQ.options['option a']}
            B: ${currentQ.options['option b']}
            C: ${currentQ.options['option c']}
            D: ${currentQ.options['option d']}
            
            Correct Answer: ${currentQ.correctAnswer}
            Context/Remarks from Instructor: ${currentQ.remarks || "None"}
            
            Please provide a **concise** explanation (max 3-4 sentences) of why the correct answer is correct. Briefly mention why the selected option was wrong if applicable. Keep the response short and to the point.
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) throw new Error("AI request failed");

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setAiExplanation(text);
            } else {
                throw new Error("No explanation returned");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to get AI explanation. Please try again.");
        } finally {
            setIsAiLoading(false);
        }
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

    // --- SETUP VIEW ---
    if (phase === 'setup') {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-white">Target Practice</h2>
                    <p className="text-slate-400">Choose your challenge mode</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {/* Custom Mode */}
                    <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm space-y-8 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-emerald-400">Custom Practice</h3>
                            <p className="text-sm text-slate-400">Tailor your session with a specific number of questions.</p>

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-300">Questions</span>
                                    <span className="text-white">{customCount}</span>
                                </div>

                                <input
                                    type="range"
                                    min="5"
                                    max={Math.min(100, allQuestions.length)}
                                    value={customCount}
                                    onChange={(e) => setCustomCount(Math.min(100, Number(e.target.value)))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>5</span>
                                    <span>{Math.min(100, allQuestions.length)}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="primary" onClick={() => startQuiz('custom')} className="w-full py-3">
                            Start Custom Quiz
                        </Button>
                    </div>

                    {/* Exam Mode */}
                    <div className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm space-y-8 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-xl font-semibold text-blue-400">Full Mock Exam</h3>
                            <p className="text-sm text-slate-400">Simulate a real exam environment with 100 questions (or max available).</p>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <span>{Math.min(100, allQuestions.length)} Questions</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <span>Timed Session</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <span>Detailed Report</span>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => startQuiz('exam')} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white relative z-10">
                            Start Mock Exam
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- FINISHED VIEW ---
    if (phase === 'finished') {
        const score = userAnswers.filter(a => a.isCorrect).length;
        const wrong = userAnswers.filter(a => !a.isCorrect).length;
        const skipped = questions.length - userAnswers.length;

        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in zoom-in duration-500 w-full max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold text-white">Session Report</h2>
                    <p className="text-slate-400">{isExamMode ? 'Mock Exam' : 'Practice Session'} Completed</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Score</div>
                        <div className="text-3xl font-bold text-emerald-400">{score}</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Wrong</div>
                        <div className="text-3xl font-bold text-red-400">{wrong}</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Skipped</div>
                        <div className="text-3xl font-bold text-orange-400">{skipped}</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/10">
                        <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Accuracy</div>
                        <div className="text-3xl font-bold text-blue-400">
                            {userAnswers.length > 0 ? Math.round((score / userAnswers.length) * 100) : 0}%
                        </div>
                    </div>
                </div>

                {/* Detailed List */}
                <div className="w-full space-y-4">
                    <h3 className="text-xl font-semibold text-white px-2">Detailed Review</h3>
                    <div className="space-y-3">
                        {questions.map((q, idx) => {
                            const answer = userAnswers.find(a => a.questionId === q.id);
                            // Determine state: Correct, Wrong, or Skipped
                            let statusClass = "border-white/10 bg-white/5";
                            let icon = <span className="text-slate-500">○</span>; // Skipped

                            if (answer) {
                                if (answer.isCorrect) {
                                    statusClass = "border-emerald-500/30 bg-emerald-500/5";
                                    icon = <span className="text-emerald-400">✓</span>;
                                } else {
                                    statusClass = "border-red-500/30 bg-red-500/5";
                                    icon = <span className="text-red-400">✕</span>;
                                }
                            }

                            return (
                                <div key={q.id} className={`p-4 rounded-xl border ${statusClass} flex flex-col gap-2`}>
                                    <div className="flex gap-3">
                                        <div className="mt-1 font-mono text-sm opacity-50">{idx + 1}.</div>
                                        <div className="flex-1">
                                            <p className="text-slate-200 font-medium">{q.question}</p>

                                            {answer ? (
                                                <>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                        <div className={`${answer.isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                                                            Your Answer: <span className="font-semibold">{answer.selectedOption?.replace('option ', '').toUpperCase()}</span>
                                                        </div>
                                                        <div className="text-emerald-400">
                                                            Correct: <span className="font-semibold">{q.correctAnswer.replace('option ', '').toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                    {q.remarks && (
                                                        <p className="text-xs text-slate-400 mt-2 bg-black/20 p-2 rounded inline-block">
                                                            💡 {q.remarks}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="mt-2 text-sm text-slate-500 italic flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                    Not Attempted - Answer Hidden
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xl">
                                            {icon}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="sticky bottom-4 w-full flex justify-center">
                    <Button variant="primary" onClick={restartSetup} className="px-8 py-3 text-lg shadow-xl shadow-black/50">
                        Start New Practice
                    </Button>
                </div>
            </div>
        );
    }

    // --- PLAYING VIEW ---
    const currentQ = questions[currentIndex];

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Header / Progress */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-red-300 hover:text-red-200 hover:bg-red-500/20 h-auto py-1 px-3 text-xs" onClick={finishQuiz}>
                        End Test
                    </Button>
                    <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg bg-black/30 border border-white/10 ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                        {formatTime(timeLeft)}
                    </div>
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
                    style={{ width: `${(timeLeft / initialTime) * 100}%` }}
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
                    <div className="space-y-4">
                        <div className={`mt-6 p-4 rounded-xl animate-in fade-in slide-in-from-top-2 ${userAnswers[userAnswers.length - 1]?.isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`text-2xl ${userAnswers[userAnswers.length - 1]?.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {userAnswers[userAnswers.length - 1]?.isCorrect ? '✓' : '✕'}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-semibold ${userAnswers[userAnswers.length - 1]?.isCorrect ? 'text-emerald-200' : 'text-red-200'}`}>
                                        {userAnswers[userAnswers.length - 1]?.isCorrect ? 'Correct!' : 'Incorrect'}
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

                        {/* AI Explanation Section */}
                        {!aiExplanation && (
                            <Button
                                variant="ghost"
                                onClick={fetchGeminiExplanation}
                                disabled={isAiLoading}
                                className="w-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 flex items-center justify-center gap-2"
                            >
                                {isAiLoading ? (
                                    <>Processing with AI...</>
                                ) : (
                                    <>✨ Ask AI for Detailed Explanation</>
                                )}
                            </Button>
                        )}

                        {aiExplanation && (
                            <div className="bg-purple-900/20 border border-purple-500/20 p-6 rounded-2xl animate-in fade-in zoom-in-95">
                                <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                                    <span>✨</span> AI Analysis
                                </h4>
                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                    {aiExplanation}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
