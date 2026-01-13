import React, { useState } from 'react';
import { Button } from '../UI/Button';

interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

export const BrainGymSection: React.FC = () => {
    const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [triviaLoading, setTriviaLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [streak, setStreak] = useState(0);

    const fetchTrivia = async () => {
        setTriviaLoading(true);
        setRevealed(false);
        setSelectedAnswer(null);
        try {
            const res = await fetch('https://opentdb.com/api.php?amount=1&category=17');
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const q = data.results[0];
                setTrivia(q);
                const allOptions = [...q.incorrect_answers, q.correct_answer]
                    .sort(() => Math.random() - 0.5);
                setOptions(allOptions);
            }
        } catch (err) {
            console.error("Failed to fetch trivia", err);
        } finally {
            setTriviaLoading(false);
        }
    };

    const handleAnswer = (ans: string) => {
        setSelectedAnswer(ans);
        setRevealed(true);
        if (ans === trivia?.correct_answer) {
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }
    };

    const decodeHTML = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    return (
        <div className="flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
            <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-black/60 backdrop-blur-xl p-8 flex flex-col items-center text-center w-full max-w-2xl shadow-2xl min-h-[600px]">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                <div className="flex items-center justify-between w-full mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Brain Gym 🧠</h2>
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm font-mono">
                        Streak: {streak} 🔥
                    </div>
                </div>

                {triviaLoading && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-purple-300 animate-pulse tracking-widest text-sm font-bold">LOADING SYNAPSES...</p>
                    </div>
                )}

                {trivia ? (
                    <div className="w-full z-10 text-left">
                        <div className="mb-6">
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-xs font-bold text-purple-200 border border-purple-500/30 mb-4">
                                {decodeHTML(trivia.category)} &bull; {trivia.difficulty.toUpperCase()}
                            </span>
                            <p className="text-2xl text-white font-medium leading-relaxed">
                                {decodeHTML(trivia.question)}
                            </p>
                        </div>

                        <div className="grid gap-3 mb-8 w-full">
                            {options.map((opt, idx) => {
                                const isSelected = selectedAnswer === opt;
                                const isCorrect = opt === trivia.correct_answer;

                                let btnClass = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 p-4 text-lg";

                                if (revealed) {
                                    if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500/50 p-4 text-lg font-bold";
                                    else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-100 p-4 text-lg";
                                    else btnClass = "opacity-40 border-transparent bg-black/20 p-4";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => !revealed && handleAnswer(opt)}
                                        disabled={revealed}
                                        className={`w-full text-left rounded-xl border transition-all duration-200 flex items-center gap-4 group ${btnClass} ${!revealed && 'hover:scale-[1.01] active:scale-[0.99]'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold opacity-60 ${revealed && isCorrect ? 'bg-emerald-500 text-black border-emerald-500 opacity-100' : 'border-white/20'}`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span dangerouslySetInnerHTML={{ __html: opt }} />
                                    </button>
                                )
                            })}
                        </div>

                        {revealed && (
                            <div className={`p-4 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-2 border ${selectedAnswer === trivia.correct_answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-red-500/10 border-red-500/30 text-red-200'}`}>
                                <p className="text-lg font-bold">
                                    {selectedAnswer === trivia.correct_answer ? "Correct! 🎉" : "Incorrect ❌"}
                                </p>
                                {selectedAnswer !== trivia.correct_answer && (
                                    <p className="text-sm mt-1 opacity-80">The correct answer was: <span className="font-bold">{decodeHTML(trivia.correct_answer)}</span></p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 space-y-4">
                        <p className="text-lg">Ready to train your brain?</p>
                        <p className="text-sm text-slate-500 max-w-md">Challenge yourself with random science trivia questions. Keep your streak alive!</p>
                    </div>
                )}

                <div className="w-full mt-auto pt-4 border-t border-white/5">
                    <Button variant="primary" className="w-full py-4 text-lg shadow-xl shadow-purple-900/20" onClick={fetchTrivia}>
                        {trivia ? "Next Challenge ➡️" : "Start Training 🚀"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
