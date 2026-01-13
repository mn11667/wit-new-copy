import React, { useEffect, useState } from 'react';

// Types for RSS API
interface NewsArticle {
    title: string;
    link: string;
    thumbnail: string;
    pubDate: string;
    description: string;
    content?: string; // Full content
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
    const [source, setSource] = useState<'onlinekhabar' | 'setopati' | 'ratopati' | 'gorkhapatra'>('onlinekhabar');
    const [page, setPage] = useState(1);

    const ARTICLES_PER_PAGE = 3;
    const totalPages = news.length > 0 ? Math.ceil(news.length / ARTICLES_PER_PAGE) + 1 : 1;

    // --- Effects ---
    useEffect(() => {
        fetchNews();
        setPage(1); // Reset to cover page on source/lang change
    }, [language, source]);

    // --- News Logic ---
    const fetchNews = async () => {
        setNewsLoading(true);
        setNews([]); // Clear previous news to show loading state cleanly
        try {
            if (source === 'gorkhapatra') {
                // Scrape Gorkhapatra Loksewa (Proxy required)
                const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=https://gorkhapatraonline.com/categories/loksewa';
                const res = await fetch(proxyUrl);
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                // Select news items (Adjust selectors based on Gorkhapatra structure)
                // Observed structure: .item-content contains .item-title
                const articles: NewsArticle[] = [];
                const items = doc.querySelectorAll('.item-content, .post-item, .blog-item');

                items.forEach((item) => {
                    const titleEl = item.querySelector('.item-title a') || item.querySelector('h2 a') || item.querySelector('h3 a');
                    if (titleEl) {
                        const title = titleEl.textContent?.trim() || "News Item";
                        const link = titleEl.getAttribute('href') || "#";

                        // Try to find image in parent or previous sibling? 
                        // Often image is in .item-image which is sibling to .item-content
                        let thumbnail = "https://gorkhapatraonline.com/landing-assets/img/logo.png"; // Default
                        // Attempt to find an image in the vicinity
                        const container = item.parentElement || item;
                        const img = container.querySelector('img');
                        if (img && img.src) thumbnail = img.src;

                        // Date
                        const dateEl = item.querySelector('.fa-calendar-alt')?.parentElement;
                        const pubDate = dateEl?.textContent?.trim() || new Date().toISOString();

                        articles.push({
                            title,
                            link,
                            pubDate,
                            description: "Loksewa Preparation Material from Gorkhapatra. Click to read the full Q&A.",
                            content: "Full content available on Gorkhapatra Online.",
                            thumbnail,
                            author: "Gorkhapatra",
                            categories: ['Loksewa', 'Education']
                        });
                    }
                });

                // Dedup based on link
                const uniqueContent = Array.from(new Map(articles.map(item => [item.link, item])).values());
                setNews(uniqueContent);
                return;
            }

            let feedUrl = '';
            if (source === 'onlinekhabar') {
                feedUrl = language === 'en' ? 'https://english.onlinekhabar.com/feed' : 'https://www.onlinekhabar.com/feed';
            } else if (source === 'setopati') {
                feedUrl = language === 'en' ? 'https://en.setopati.com/feed' : 'https://www.setopati.com/feed';
            } else if (source === 'ratopati') {
                feedUrl = language === 'en' ? 'https://english.ratopati.com/feed' : 'https://ratopati.com/feed';
            }

            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
            const data = await res.json();
            if (data.items) {
                const processed = data.items.map((item: any) => ({
                    ...item,
                    // Prioritize full content, fall back to description. 
                    // Pick the longest one to ensure maximum text is shown.
                    content: (item.content && item.content.length > (item.description?.length || 0))
                        ? item.content
                        : item.description
                }));
                setNews(processed);
            }
        } catch (err) {
            console.error("Failed to fetch news", err);
        } finally {
            setNewsLoading(false);
        }
    };

    const cleanContent = (html: string) => {
        if (!html) return "";
        // manual decode simple spacing and preserve basic breaks
        let processed = html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<li.*?>/gi, '• ')
            .replace(/<\/li>/gi, '\n');

        const doc = new DOMParser().parseFromString(processed, 'text/html');
        const text = doc.body.textContent || "";
        // Clean up excessive newlines (>3 becomes 2)
        return text.replace(/\n{3,}/g, '\n\n').trim();
    }


    const renderCoverPage = () => (
        <div className="columns-1 md:columns-3 gap-6">
            {news.map((item, i) => {
                const targetPage = 2 + Math.floor(i / ARTICLES_PER_PAGE);
                return (
                    <div key={i} className="break-inside-avoid mb-6 border-b border-slate-900/10 pb-4 group">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{item.categories[0] || 'News'}</span>
                        <h3
                            className="font-bold font-serif text-lg leading-tight mb-2 group-hover:text-red-700 cursor-pointer transition-colors"
                            onClick={() => setPage(targetPage)}
                        >
                            {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-3 mb-2 font-serif leading-relaxed">
                            {cleanContent(item.description)}
                        </p>
                        <button
                            onClick={() => setPage(targetPage)}
                            className="text-[10px] font-bold text-red-700 uppercase hover:underline flex items-center gap-1"
                        >
                            Turn to Page {targetPage} <span>&rarr;</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderInnerPage = () => {
        const startIndex = (page - 2) * ARTICLES_PER_PAGE;
        const pageItems = news.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

        return (
            <div className="columns-1 md:columns-2 gap-8">
                <div className="break-inside-avoid mb-8 font-mono text-xs text-slate-500 border-b border-slate-300 pb-2 uppercase tracking-widest col-span-full">
                    Page {page} &mdash; Detailed Reports
                </div>
                {pageItems.map((item, idx) => (
                    <article key={idx} className="break-inside-avoid mb-8 border-b border-slate-900/10 pb-6 group">
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                            <h2 className="text-xl md:text-2xl font-bold font-serif leading-tight mb-2 group-hover:text-red-700 transition-colors">
                                {item.title}
                            </h2>
                        </a>

                        <div className="text-[10px] text-slate-500 font-mono mb-2 flex items-center gap-2">
                            <span className="uppercase font-bold text-slate-400">{item.categories[0] || 'NEWS'}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span>{new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <p className="text-sm font-serif leading-relaxed text-justify text-slate-700 whitespace-pre-line">
                            {cleanContent(item.content || item.description)}
                        </p>
                        <div className="mt-3">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-red-700 hover:underline transition-colors">
                                Read Full Story <span className="text-sm leading-none">&raquo;</span>
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center pb-12 gap-6">

            {/* --- External Dashboard Controls --- */}
            <div className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-4 px-2">

                {/* Source Selector */}
                <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-4 rounded-full border border-slate-700 backdrop-blur-md shadow-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">News Source</span>
                    <div className="h-4 w-px bg-slate-600 mx-1"></div>
                    <select
                        value={source}
                        onChange={(e) => setSource(e.target.value as any)}
                        className="bg-transparent text-white text-xs font-bold uppercase tracking-wider hover:text-blue-400 cursor-pointer focus:outline-none appearance-none pr-4"
                    >
                        <option value="onlinekhabar">OnlineKhabar</option>
                        <option value="setopati">Setopati</option>
                        <option value="ratopati">Ratopati</option>
                        <option value="gorkhapatra">Gorkhapatra</option>
                    </select>
                </div>

                {/* Language Toggle */}
                <button
                    onClick={() => setLanguage(l => l === 'en' ? 'np' : 'en')}
                    className="relative flex items-center w-32 h-8 bg-slate-800/80 rounded-full p-1 border border-slate-700 shadow-lg cursor-pointer overflow-hidden"
                >
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow-md transition-all duration-300 ease-out z-0 ${language === 'np' ? 'translate-x-[100%] left-1' : 'left-1'
                            }`}
                    />
                    <span className={`flex-1 text-center text-[10px] uppercase font-bold tracking-widest z-10 transition-colors duration-300 ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>ENG</span>
                    <span className={`flex-1 text-center text-[10px] uppercase font-bold tracking-widest z-10 transition-colors duration-300 ${language === 'np' ? 'text-white' : 'text-slate-400'}`}>NEP</span>
                </button>
            </div>

            {/* The Paper Container */}
            <div className="w-full max-w-6xl bg-[#f4f1ea] text-slate-900 shadow-2xl p-6 md:p-12 min-h-[800px] relative flex flex-col"
                style={{ backgroundImage: 'radial-gradient(#d0cfc9 1px, transparent 0)', backgroundSize: '30px 30px' }}>

                {/* Paper Header */}
                <header className="border-b-4 border-slate-900 mb-10 pb-6 text-center relative">
                    {/* ... (Header content same as before) ... */}
                    {/* Top Meta Line */}
                    <div className="flex justify-between items-center text-xs font-serif italic text-slate-600 mb-6 border-b border-slate-300 pb-2">
                        <span>Vol. 1, Issue 2026</span>
                        <span>Established 2024</span>
                        <span className="hidden sm:inline">Price: Free for You</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-7xl font-black font-serif uppercase tracking-tight mb-4 text-slate-900 leading-none">
                        {language === 'en' ? 'The Nepal Chronicle' : 'नेपाल समाचार'}
                    </h1>

                    {/* Navbar / Date Line */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm font-bold border-t-2 border-b-2 border-slate-900 py-3 mt-4 font-mono uppercase tracking-widest">
                        <div className="flex-1 text-center sm:text-left">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>

                        <div className="flex-1 text-center sm:text-right text-red-700">
                            {page === 1 ? 'Cover Page' : `Page ${page}`}
                        </div>
                    </div>
                </header>

                {/* Content Columns using Pagination Logic */}
                <div className="flex-1">
                    {newsLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                            <div className="font-serif italic text-slate-500 animate-pulse text-xl">Hot off the press...</div>
                        </div>
                    ) : (
                        page === 1 ? renderCoverPage() : renderInnerPage()
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="flex justify-between items-center border-t-4 border-double border-slate-900 pt-4 mt-12 pb-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="font-bold font-serif uppercase text-xs disabled:opacity-20 hover:text-red-700 flex items-center gap-2 transition-colors"
                    >
                        &larr; Previous Page
                    </button>

                    <div className="font-serif italic text-slate-500 text-sm">
                        Page {page} of {totalPages}
                    </div>

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="font-bold font-serif uppercase text-xs disabled:opacity-20 hover:text-red-700 flex items-center gap-2 transition-colors"
                    >
                        Next Page &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};
