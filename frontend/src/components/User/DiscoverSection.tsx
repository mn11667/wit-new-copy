import React, { useEffect, useState } from 'react';

// Types for APIs
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
    // --- News State ---
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);

    // --- Effects ---
    useEffect(() => {
        fetchNews();
    }, []);

    // --- News Logic ---
    const fetchNews = async () => {
        setNewsLoading(true);
        try {
            const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=12'); // Increased limit for full page
            const data = await res.json();
            setNews(data.results);
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setNewsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">📰</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Science Headlines</h2>
                        <p className="text-slate-400 text-sm">Latest updates from the cosmos</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse mt-1.5"></div>
                    <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Live Feed</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsLoading ? (
                    // Skeleton Array
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-64 w-full rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
                    ))
                ) : (
                    news.map((item) => (
                        <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:bg-white/5 hover:scale-[1.02] transition-all duration-300 shadow-lg flex flex-col h-full"
                        >
                            <div className="h-48 w-full overflow-hidden bg-slate-900 relative">
                                <div className="absolute top-2 left-2 z-10">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10">
                                        {item.news_site}
                                    </span>
                                </div>
                                <img src={item.image_url} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-[10px] text-slate-500 mb-2 font-mono">
                                    {new Date(item.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2 mb-3 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                                    {item.summary}
                                </p>
                                <div className="flex items-center text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform w-fit">
                                    Read Article <span className="ml-1">→</span>
                                </div>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
};
