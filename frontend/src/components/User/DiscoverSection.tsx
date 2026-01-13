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
        <div className="animate-in fade-in slide-in-from-bottom-4 flex justify-center pb-12">
            {/* The Paper Container */}
            <div className="w-full max-w-6xl bg-[#f4f1ea] text-slate-900 shadow-2xl p-6 md:p-12 min-h-[800px] relative"
                style={{ backgroundImage: 'radial-gradient(#d0cfc9 1px, transparent 0)', backgroundSize: '30px 30px' }}>

                {/* Paper Header */}
                <header className="border-b-4 border-slate-900 mb-10 pb-6 text-center relative">
                    {/* Top Meta Line */}
                    <div className="flex justify-between items-center text-xs font-serif italic text-slate-600 mb-6 border-b border-slate-300 pb-2">
                        <span>Vol. 1, Issue 2026</span>
                        <span>Established 2024</span>
                        <span className="hidden sm:inline">Price: Free for You</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-7xl font-black font-serif uppercase tracking-tight mb-4 text-slate-900 leading-none">
                        {language === 'en' ? 'The Nepal Chronicle' : 'नेपाल सन्देश पत्र'}
                    </h1>

                    {/* Navbar / Date Line */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm font-bold border-t-2 border-b-2 border-slate-900 py-3 mt-4 font-mono uppercase tracking-widest">
                        <div className="flex-1 text-center sm:text-left">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        {/* Language Toggle Centered */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`transition-colors ${language === 'en' ? 'text-red-700 underline decoration-2 underline-offset-4' : 'text-slate-400 hover:text-red-700'}`}
                            >
                                ENGLISH EDITION
                            </button>
                            <button
                                onClick={() => setLanguage('np')}
                                className={`transition-colors ${language === 'np' ? 'text-red-700 underline decoration-2 underline-offset-4' : 'text-slate-400 hover:text-red-700'}`}
                            >
                                नेपाली संस्करण
                            </button>
                        </div>

                        <div className="flex-1 text-center sm:text-right text-red-700">
                            Late City Edition
                        </div>
                    </div>
                </header>

                {/* Content Columns */}
                {newsLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                        <div className="font-serif italic text-slate-500 animate-pulse text-xl">Hot off the press...</div>
                    </div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                        {/* Featured First Item (Optional larger styling) */}
                        {news.length > 0 && (
                            <article className="break-inside-avoid mb-10 border-b-2 border-slate-900 pb-8">
                                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase mb-3 tracking-wider">
                                    {news[0].categories[0] || 'Top Story'}
                                </span>
                                <a href={news[0].link} target="_blank" rel="noopener noreferrer">
                                    <h2 className="text-3xl md:text-4xl font-black font-serif leading-none mb-4 hover:text-red-800 transition-colors">
                                        {news[0].title}
                                    </h2>
                                </a>
                                <p className="text-base font-serif leading-relaxed text-justify text-slate-800 first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-10px]">
                                    {stripHtml(news[0].description)}
                                </p>
                            </article>
                        )}

                        {/* Rest of the items */}
                        {news.slice(1).map((item, idx) => (
                            <article key={idx} className="break-inside-avoid mb-8 border-b border-slate-900/10 pb-6 group">
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                    <h2 className="text-lg md:text-xl font-bold font-serif leading-tight mb-2 group-hover:text-red-700 transition-colors">
                                        {item.title}
                                    </h2>
                                </a>

                                <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2">
                                    <span className="uppercase font-bold text-slate-400">{item.categories[0] || 'NEWS'}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>{new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <p className="text-sm font-serif leading-relaxed text-justify text-slate-700 line-clamp-6">
                                    {stripHtml(item.description)}
                                </p>
                            </article>
                        ))}
                    </div>
                )}

                {/* Paper Footer */}
                <footer className="mt-12 pt-8 border-t-4 border-double border-slate-900 text-center">
                    <p className="font-serif italic text-slate-500 text-sm">Thank you for reading The Nepal Chronicle. Support unbiased journalism.</p>
                </footer>
            </div>
        </div>
    );
};
