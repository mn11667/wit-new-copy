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

    const [feedCache, setFeedCache] = useState<{ en: NewsArticle[], np: NewsArticle[] }>({ en: [], np: [] });

    // Reader Mode State
    const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);
    const [contentLoading, setContentLoading] = useState(false);

    const ARTICLES_PER_PAGE = 3;
    const totalPages = news.length > 0 ? Math.ceil(news.length / ARTICLES_PER_PAGE) + 1 : 1;

    // --- Data Loading & Availability Logic ---
    useEffect(() => {
        const loadSourceData = async () => {
            setNewsLoading(true);
            try {
                let enItems: NewsArticle[] = [];
                let npItems: NewsArticle[] = [];

                if (source === 'gorkhapatra') {
                    // Gorkhapatra: Only Nepali (Loksewa)
                    const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=https://gorkhapatraonline.com/categories/loksewa';
                    const res = await fetch(proxyUrl);
                    const html = await res.text();
                    const doc = new DOMParser().parseFromString(html, 'text/html');

                    const articles: NewsArticle[] = [];
                    // .blog-box-layout11 seems to be the container in recent HTML check
                    const items = doc.querySelectorAll('.blog-box-layout11, .item-content, .post-item');

                    const nepaliDigits = '०१२३४५६७८९';
                    const convertDigits = (str: string) => str.replace(/[०-९]/g, d => String(nepaliDigits.indexOf(d)));
                    const nepaliMonths = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'];

                    items.forEach((item) => {
                        const titleEl = item.querySelector('.item-title a') || item.querySelector('h2 a') || item.querySelector('h3 a');
                        if (titleEl) {
                            const title = titleEl.textContent?.trim() || "Questions & Answers";
                            const link = titleEl.getAttribute('href') || "#";

                            let thumbnail = "https://gorkhapatraonline.com/landing-assets/img/logo.png";
                            const container = item.parentElement || item;
                            const img = container.querySelector('img');
                            if (img && img.src) thumbnail = img.src;

                            // Date Parsing
                            let pubDate = new Date().toISOString();
                            const rawDate = item.querySelector('.fa-calendar-alt')?.parentElement?.textContent?.trim().replace(/,/g, '') || "";
                            // E.g. "१६ पुस २०८२ बुधबार"
                            const parts = rawDate.split(/\s+/);
                            if (parts.length >= 3) {
                                const day = parseInt(convertDigits(parts[0]));
                                const monthName = parts[1]; // Nepali text
                                const year = parseInt(convertDigits(parts[2]));
                                const monthIdx = nepaliMonths.indexOf(monthName);

                                if (!isNaN(day) && !isNaN(year) && monthIdx !== -1) {
                                    // Approx BS to AD : Year - 57
                                    const adYear = year - 57;
                                    const d = new Date(adYear, monthIdx, day, 12, 0, 0);
                                    if (!isNaN(d.getTime())) pubDate = d.toISOString();
                                }
                            }

                            // Description
                            // Gorkhapatra puts summary in a <p> tag
                            const desc = item.querySelector('p')?.textContent?.trim() || "Click to read the full Q&A content.";

                            articles.push({
                                title,
                                link,
                                thumbnail,
                                pubDate,
                                description: desc,
                                content: "", // Loaded via Reader
                                author: "Gorkhapatra",
                                categories: ['Loksewa']
                            });
                        }
                    });

                    npItems = Array.from(new Map(articles.map(item => [item.link, item])).values());

                } else {
                    // RSS feeds for standard portals
                    const getUrl = (src: string, lang: 'en' | 'np') => {
                        if (src === 'onlinekhabar') return lang === 'en' ? 'https://english.onlinekhabar.com/feed' : 'https://www.onlinekhabar.com/feed';
                        if (src === 'setopati') return lang === 'en' ? 'https://en.setopati.com/feed' : 'https://www.setopati.com/feed';
                        if (src === 'ratopati') return lang === 'en' ? 'https://english.ratopati.com/feed' : 'https://ratopati.com/feed';
                        return '';
                    };

                    const fetchFeed = async (lang: 'en' | 'np') => {
                        try {
                            const url = getUrl(source, lang);
                            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${url}`);
                            const data = await res.json();
                            return data.items ? data.items.map((item: any) => ({
                                ...item,
                                content: (item.content && item.content.length > (item.description?.length || 0)) ? item.content : item.description
                            })) : [];
                        } catch (e) { return []; }
                    };

                    const [en, np] = await Promise.all([fetchFeed('en'), fetchFeed('np')]);
                    enItems = en;
                    npItems = np;
                }

                // Update Cache
                setFeedCache({ en: enItems, np: npItems });

                // Auto-Switch Logic: If current language is empty but other has data, switch.
                // Prioritize checking if we are on 'en' and it's empty.
                if (language === 'en' && enItems.length === 0 && npItems.length > 0) {
                    setLanguage('np');
                } else if (language === 'np' && npItems.length === 0 && enItems.length > 0) {
                    setLanguage('en');
                }

            } catch (error) {
                console.error("Error loading source:", error);
            } finally {
                setNewsLoading(false);
            }
        };

        loadSourceData();
    }, [source]);

    // --- Update View on Change ---
    useEffect(() => {
        setNews(feedCache[language]);
        setPage(1);
    }, [language, feedCache]);

    // --- Reader Logic ---
    const handleArticleClick = async (e: React.MouseEvent, article: NewsArticle) => {
        if (source === 'gorkhapatra') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setReadingArticle(article);
            setContentLoading(true);

            try {
                // Fetch full content via proxy
                const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(article.link)}`;
                const res = await fetch(proxyUrl);
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                // Extract content from .blog-details
                // There are multiple .blog-details (some are metadata), so pick the one with the most content
                const contentEls = Array.from(doc.querySelectorAll('.blog-details'));
                const contentEl = contentEls.reduce((max, el) => {
                    return (el.textContent?.length || 0) > (max?.textContent?.length || 0) ? el : max;
                }, null as Element | null);

                // Remove social shares or ads if present inside
                contentEl?.querySelectorAll('.share-buttons, .ads').forEach(el => el.remove());

                const fullContent = contentEl?.innerHTML || article.description;

                setReadingArticle(prev => prev ? { ...prev, content: fullContent } : null);
            } catch (err) {
                console.error("Failed to load full content:", err);
            } finally {
                setContentLoading(false);
            }
        }
    };

    const renderReader = () => {
        if (!readingArticle) return null;

        return (
            <div className="animate-in fade-in slide-in-from-right-8">
                {/* Back Button */}
                <button
                    onClick={() => setReadingArticle(null)}
                    className="mb-6 flex items-center gap-2 text-red-800 font-bold uppercase tracking-widest text-xs hover:underline"
                >
                    &larr; Back to {page === 1 ? 'Front Page' : `Page ${page}`}
                </button>

                {contentLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-8 h-8 border-4 border-slate-300 border-t-red-700 rounded-full animate-spin"></div>
                        <p className="font-serif italic text-slate-500">Fetching full article...</p>
                    </div>
                ) : (
                    <article className="prose prose-slate max-w-none font-serif">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
                            {readingArticle.title}
                        </h1>
                        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mb-8 border-b border-slate-300 pb-4">
                            <span>{new Date(readingArticle.pubDate).toDateString()}</span>
                            <span>•</span>
                            <span>{readingArticle.author || 'Gorkhapatra'}</span>
                        </div>

                        {/* Render HTML Content safely */}
                        <div
                            className="text-lg leading-relaxed text-justify text-slate-800 space-y-4 article-content"
                            dangerouslySetInnerHTML={{ __html: readingArticle.content || "" }}
                        />

                        <div className="mt-8 pt-8 border-t border-slate-300 text-center">
                            <a href={readingArticle.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-red-700 uppercase tracking-widest hover:underline">
                                Read original on Website &rarr;
                            </a>
                        </div>
                    </article>
                )}
            </div>
        );
    }

    // Helper to clean HTML content
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
                    onClick={() => {
                        // User can still toggle manually
                        setLanguage(l => l === 'en' ? 'np' : 'en');
                    }}
                    className="relative flex items-center w-36 h-8 bg-slate-800/80 rounded-full p-1 border border-slate-700 shadow-lg cursor-pointer overflow-hidden"
                >
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow-md transition-all duration-300 ease-out z-0 ${language === 'np' ? 'translate-x-[100%] left-1' : 'left-1'
                            }`}
                    />

                    {/* English Label */}
                    <div className={`flex-1 flex items-center justify-center gap-1.5 z-10 transition-colors duration-300 ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>
                        <span className="text-[10px] uppercase font-bold tracking-widest">ENG</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${feedCache.en.length > 0 ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.6)]' : 'bg-red-500/50'}`}></span>
                    </div>

                    {/* Nepali Label */}
                    <div className={`flex-1 flex items-center justify-center gap-1.5 z-10 transition-colors duration-300 ${language === 'np' ? 'text-white' : 'text-slate-400'}`}>
                        <span className="text-[10px] uppercase font-bold tracking-widest">NEP</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${feedCache.np.length > 0 ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.6)]' : 'bg-red-500/50'}`}></span>
                    </div>
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
                    ) : readingArticle ? (
                        renderReader()
                    ) : (
                        page === 1 ? renderCoverPage() : renderInnerPage()
                    )}
                </div>

                {/* Pagination Footer */}
                {!readingArticle && (
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
                )}
            </div>
        </div>
    );
};
