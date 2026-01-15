import React, { useState } from 'react';
import { Button } from '../UI/Button';

interface WikipediaArticle {
    title: string;
    description: string;
    extract: string;
    thumbnail?: {
        source: string;
    };
    content_urls: {
        desktop: {
            page: string;
        };
    };
}

export const WikipediaSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<WikipediaArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<WikipediaArticle | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchWikipedia = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Use Wikipedia's opensearch API for suggestions
            const searchRes = await fetch(
                `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&namespace=0&format=json&origin=*`
            );
            const searchData = await searchRes.json();

            // searchData format: [query, [titles], [descriptions], [urls]]
            const titles = searchData[1] || [];

            if (titles.length === 0) {
                setSearchResults([]);
                setError('No results found');
                setLoading(false);
                return;
            }

            // Fetch summary for each result
            const summaries = await Promise.all(
                titles.slice(0, 5).map(async (title: string) => {
                    try {
                        const res = await fetch(
                            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
                        );
                        return await res.json();
                    } catch (e) {
                        return null;
                    }
                })
            );

            setSearchResults(summaries.filter(s => s !== null));
        } catch (err) {
            setError('Failed to search Wikipedia');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchWikipedia(searchQuery);
    };

    const loadRandomArticle = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                'https://en.wikipedia.org/api/rest_v1/page/random/summary'
            );
            const data = await res.json();
            setSelectedArticle(data);
        } catch (err) {
            setError('Failed to load random article');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleArticleClick = (article: WikipediaArticle) => {
        setSelectedArticle(article);
    };

    const handleBack = () => {
        setSelectedArticle(null);
    };

    // Article View
    if (selectedArticle) {
        return (
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-right duration-300">
                <button
                    onClick={handleBack}
                    className="mb-4 flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Search
                </button>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {selectedArticle.thumbnail && (
                        <img
                            src={selectedArticle.thumbnail.source}
                            alt={selectedArticle.title}
                            className="w-full max-w-md mx-auto rounded-xl border border-white/10"
                        />
                    )}

                    <h2 className="text-3xl font-bold text-white">{selectedArticle.title}</h2>

                    {selectedArticle.description && (
                        <p className="text-purple-300 italic">{selectedArticle.description}</p>
                    )}

                    <div className="text-slate-300 leading-relaxed space-y-4">
                        {selectedArticle.extract.split('\n').map((para, idx) => (
                            para.trim() && <p key={idx}>{para}</p>
                        ))}
                    </div>

                    <a
                        href={selectedArticle.content_urls.desktop.page}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 transition-colors"
                    >
                        Read Full Article on Wikipedia
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>
        );
    }

    // Search View
    return (
        <div className="w-full h-full flex flex-col">
            <form onSubmit={handleSearch} className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Wikipedia..."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 transition-colors"
                    >
                        🔍
                    </button>
                </div>
            </form>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300 animate-pulse">Searching...</p>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                    {error}
                </div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Results:</h3>
                    {searchResults.map((article, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleArticleClick(article)}
                            className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex gap-3">
                                {article.thumbnail && (
                                    <img
                                        src={article.thumbnail.source}
                                        alt={article.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white group-hover:text-purple-200 transition-colors mb-1">
                                        📄 {article.title}
                                    </h4>
                                    <p className="text-sm text-slate-400 line-clamp-2">
                                        {article.description || article.extract}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && searchResults.length === 0 && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <p className="text-lg">Search for any topic on Wikipedia</p>
                    <p className="text-sm text-slate-500 max-w-md text-center">
                        Explore knowledge on any subject from the world's largest encyclopedia
                    </p>
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-white/5">
                <Button
                    variant="primary"
                    className="w-full py-3 shadow-xl shadow-purple-900/20"
                    onClick={loadRandomArticle}
                >
                    Random Article 🎲
                </Button>
            </div>
        </div>
    );
};
