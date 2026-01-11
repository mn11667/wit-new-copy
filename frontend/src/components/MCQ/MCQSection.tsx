import React, { useEffect, useState, useMemo } from 'react';
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
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            const data = parseCSV(text);

            const formattedQuestions: Question[] = data
                .filter((row: any) => row.question && row['right ans']) // Filter invalid rows
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

            // Shuffle questions
            const shuffled = formattedQuestions.sort(() => 0.5 - Math.random());
            setQuestions(shuffled);
        } catch (err) {
            setError('Failed to load questions. Please check your connection.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionKey: string) => {
        if (isAnswered) return;
        setSelectedOption(optionKey);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        // "option c" == "option c"
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
            setQuizFinished(true);
        }
    };

    const restartQuiz = () => {
        setScore(0);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setQuizFinished(false);
        // Re-shuffle
        setQuestions(q => [...q].sort(() => 0.5 - Math.random()));
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

    if (questions.length === 0) {
        return (
            <div className="text-center py-10 text-slate-400">
                No questions found.
            </div>
        );
    }

    if (quizFinished) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="text-4xl font-bold text-white">Quiz Completed!</div>
                <div className="text-xl text-slate-300">
                    You scored <span className="text-emerald-400 font-bold">{score}</span> out of <span className="text-white">{questions.length}</span>
                </div>

                <div className="w-full max-w-md bg-white/5 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${(score / questions.length) * 100}%` }}
                    />
                </div>

                <Button variant="primary" onClick={restartQuiz} className="px-8 py-3 text-lg">
                    Practice Again
                </Button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption?.toLowerCase() === currentQ.correctAnswer;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            {/* Header / Progress */}
            <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Question Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
                <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                    {currentQ.question}
                </h2>

                <div className="grid gap-3">
                    {Object.entries(currentQ.options).filter(([_, val]) => val).map(([key, value]) => {
                        const isSelected = selectedOption === key;
                        const isRightAnswer = key.toLowerCase() === currentQ.correctAnswer;

                        // Logic for styling
                        // If satisfied (answered):
                        // - If this is the CORRECT answer: Show Green
                        // - If this is the SELECTED answer but WRONG: Show Red
                        // - Otherwise: Dim it

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
