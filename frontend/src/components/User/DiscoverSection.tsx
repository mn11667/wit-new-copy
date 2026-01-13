import React, { useEffect, useState } from 'react';
import { Button } from '../UI/Button';

// Types for APIs
interface TriviaQuestion {
    category: string;
    type: string;
    difficulty: string;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
}

interface NewsArticle {
    id: number;
    title: string;
    url: string;
    image_url: string;
    news_site: string;
    published_at: string;
    summary: string;
}

export const DiscoverSection: React.FC = () => {
    // --- Trivia State ---
    const [trivia, setTrivia] = useState<TriviaQuestion | null>(null);
    const [triviaLoading, setTriviaLoading] = useState(false);
    const [revealed, setRevealed] = useState(false);

    // --- News State ---
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);

    // --- Effects ---
    useEffect(() => {
        fetchNews();
    }, []);

    // --- Trivia Logic ---
    const fetchTrivia = async () => {
        setTriviaLoading(true);
        setRevealed(false);
        try {
            // Category 17: Science & Nature, 18: Computers, 19: Math. We'll pick random or default to Science (17)
            const res = await fetch('https://opentdb.com/api.php?amount=1&category=17&type=multiple');
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                setTrivia(data.results[0]);
            }
        } catch (err) {
            console.error("Failed to fetch trivia", err);
        } finally {
            setTriviaLoading(false);
        }
    };

    const decodeHTML = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    // --- News Logic ---
    const fetchNews = async () => {
        setNewsLoading(true);
        try {
            const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6');
            const data = await res.json();
            setNews(data.results);
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setNewsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* 🧠 Brain Gym Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-black/40 p-6 flex flex-col items-center text-center h-full min-h-[300px] shadow-xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-1">Brain Gym 🧠</h2>
                        <p className="text-xs text-purple-300/60 mb-6 uppercase tracking-widest">Random Science Trivia</p>

                        {triviaLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                                <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                <p className="text-xs text-purple-300 animate-pulse">Synapsing...</p>
                            </div>
                        ) : trivia ? (
                            <div className="flex-1 flex flex-col justify-between w-full z-10">
                                <div>
                                    <span className="inline-block px-2 py-1 rounded bg-purple-500/20 text-[10px] text-purple-200 border border-purple-500/30 mb-3">
                                        {decodeHTML(trivia.category)} &bull; {trivia.difficulty.toUpperCase()}
                                    </span>
                                    <p className="text-lg text-white font-medium leading-relaxed mb-6">
                                        {decodeHTML(trivia.question)}
                                    </p>
                                </div>

                                {revealed ? (
                                    <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-xl animate-in fade-in zoom-in">
                                        <p className="text-xs text-emerald-300 uppercase font-bold mb-1">Answer</p>
                                        <p className="text-white font-bold text-lg">{decodeHTML(trivia.correct_answer)}</p>
                                    </div>
                                ) : (
                                    <Button variant="ghost" className="w-full border-dashed border-white/20 hover:border-white/40 hover:bg-white/5" onClick={() => setRevealed(true)}>
                                        Show Answer 👁️
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                                Ready to train?
                            </div>
                        )}

                        <div className="w-full mt-6">
                            <Button variant="primary" className="w-full shadow-lg shadow-purple-900/20" onClick={fetchTrivia}>
                                {trivia ? "Next Question ➡️" : "Start Training 🚀"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 📰 Sci-Tech News Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">📰</span>
                            <h2 className="text-xl font-bold text-white">Science Headlines</h2>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs text-slate-400 uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {newsLoading ? (
                            // Array of 3 skeletons
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-24 w-full rounded-xl bg-white/5 animate-pulse"></div>
                            ))
                        ) : (
                            <div className="space-y-3">
                                {news.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative block overflow-hidden rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 transition-all duration-300 hover:border-white/10"
                                    >
                                        <div className="flex items-start md:items-center gap-4 p-4">
                                            <div className="h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/20">
                                                        {item.news_site}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(item.published_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h3 className="text-sm md:text-base font-medium text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1 hidden md:block">
                                                    {item.summary}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition-colors">
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
