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
            // Using rss2json to get OnlineKhabar English feed
            const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://english.onlinekhabar.com/feed');
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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🇳🇵</span>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Nepal Headlines</h2>
                        <p className="text-slate-400 text-sm">Latest updates from OnlineKhabar (English)</p>
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
                        <div key={i} className="h-48 w-full rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
                    ))
                ) : (
                    news.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full"
                        >
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                    {item.categories.length > 0 ? item.categories[0] : 'News'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {new Date(item.pubDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <h3 className="text-xl font-serif font-medium text-slate-100 group-hover:text-blue-300 transition-colors leading-snug mb-3">
                                {item.title}
                            </h3>

                            <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1 line-clamp-4">
                                {stripHtml(item.description)}
                            </p>

                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                                <span className="text-xs text-slate-500 italic truncate max-w-[150px]">
                                    By {item.author || 'OnlineKhabar'}
                                </span>
                                <span className="text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                                    Read &rarr;
                                </span>
                            </div>
                        </a>
                    ))
                )}
            </div>
        </div>
    );
};
