import React, { useEffect, useState } from 'react';

// Types for RSS API
interface NewsArticle {
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
    description: string;
    author: string;
    categories: string[];
}

export const DiscoverSection: React.FC = () => {
    // Force refresh check
    // --- News State ---
    // --- News State ---
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [language, setLanguage] = useState<'en' | 'np'>('en');

    // --- Effects ---
    useEffect(() => {
        fetchNews();
    }, [language]);

    // --- News Logic ---
    const fetchNews = async () => {
        setNewsLoading(true);
        setNews([]); // Clear previous news to show loading state cleanly
        try {
            // Toggle URL based on language
            const feedUrl = language === 'en'
                ? 'https://english.onlinekhabar.com/feed'
                : 'https://www.onlinekhabar.com/feed';

            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
            const data = await res.json();
            if (data.items) {
                setNews(data.items);
            }
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setNewsLoading(false);
        }
    };

    const stripHtml = (html: string) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🇳🇵</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {language === 'en' ? 'Nepal Headlines' : 'मुख्य समाचार'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {language === 'en' ? 'Latest updates from' : 'ताजा अपडेटहरू:'} <span className="font-semibold text-blue-400">OnlineKhabar</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                    {/* Language Switcher */}
                    <div className="bg-black/40 border border-white/10 p-1 rounded-lg flex items-center backdrop-blur-sm">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:text-white'}`}
                        >
                            ENGLISH
                        </button>
                        <button
                            onClick={() => setLanguage('np')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${language === 'np' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:text-white'}`}
                        >
                            नेपाली
                        </button>
                    </div>

                    <div className="flex gap-2 items-center px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-[10px] text-red-300 uppercase tracking-widest font-bold">Live</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsLoading ? (
                    // Skeleton Array
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-48 w-full rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
                    ))
                ) : (
                    news.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block p-6 rounded-sm bg-[#f4f1ea] hover:bg-[#eae6df] transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col h-full transform hover:-translate-y-1"
                            style={{ backgroundImage: 'radial-gradient(#d0cfc9 1px, transparent 0)', backgroundSize: '20px 20px' }}
                        >
                            {/* Decorative Top Border */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-900/10"></div>

                            <div className="flex items-center justify-between mb-4 border-b border-slate-900/10 pb-2">
                                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider font-serif">
                                    {item.categories.length > 0 ? item.categories[0] : 'NEWS'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(item.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug mb-3">
                                {item.title}
                            </h3>

                            <p className="text-sm text-slate-700 leading-relaxed mb-5 flex-1 line-clamp-4 font-serif">
                                {stripHtml(item.description)}
                            </p>

                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-900/10">
                                <span className="text-xs text-slate-500 italic truncate max-w-[150px] font-serif">
                                    — {item.author || 'OnlineKhabar'}
                                </span>
                                <span className="text-xs text-red-700 font-bold group-hover:translate-x-1 transition-transform font-serif tracking-widest">
                                    READ ARTICLE &rarr;
                                </span>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
};
