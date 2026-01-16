import React, { useState } from 'react';
import { Button } from '../UI/Button';

interface Book {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    isbn?: string[];
    subject?: string[];
    publisher?: string[];
}

interface BookDetails extends Book {
    description?: string | { value: string };
}

interface WikipediaData {
    title: string;
    extract?: string;
    thumbnail?: {
        source: string;
    };
    content_urls?: {
        desktop: {
            page: string;
        };
    };
}

export const BookSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
    const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchBooks = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
            );

            if (!res.ok) {
                throw new Error(`API returned ${res.status}`);
            }

            const data = await res.json();

            if (data.docs && data.docs.length > 0) {
                setSearchResults(data.docs);
                setError(null);
            } else {
                setSearchResults([]);
                setError('No books found');
            }
        } catch (err: any) {
            setError('Failed to search books');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchBooks(searchQuery);
    };

    const fetchWikipedia = async (title: string, author?: string[]) => {
        try {
            // Create search query with title and author
            const searchQuery = author ? `${title} ${author[0]}` : title;
            const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;

            const res = await fetch(searchUrl);
            if (res.ok) {
                const data = await res.json();
                setWikipediaData(data);
            } else {
                // Try with just the title if the combined search fails
                const titleRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
                if (titleRes.ok) {
                    const data = await titleRes.json();
                    setWikipediaData(data);
                } else {
                    setWikipediaData(null);
                }
            }
        } catch (err) {
            console.error('Wikipedia fetch error:', err);
            setWikipediaData(null);
        }
    };

    const loadBookDetails = async (book: Book) => {
        setLoading(true);
        setWikipediaData(null);
        try {
            // Fetch both book details and Wikipedia data in parallel
            const [bookRes] = await Promise.all([
                fetch(`https://openlibrary.org${book.key}.json`),
                fetchWikipedia(book.title, book.author_name)
            ]);

            const details = await bookRes.json();
            setSelectedBook({ ...book, ...details });
        } catch (err) {
            console.error(err);
            setSelectedBook(book as BookDetails);
        } finally {
            setLoading(false);
        }
    };

    const handleBookClick = (book: Book) => {
        loadBookDetails(book);
    };

    const handleBack = () => {
        setSelectedBook(null);
        setWikipediaData(null);
    };

    const getCoverUrl = (coverId?: number, size: 'S' | 'M' | 'L' = 'M') => {
        if (!coverId) return null;
        return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
    };

    const getDescription = (desc?: string | { value: string }) => {
        if (!desc) return null;
        return typeof desc === 'string' ? desc : desc.value;
    };

    // Book Details View
    if (selectedBook) {
        const description = getDescription(selectedBook.description);
        const coverUrl = getCoverUrl(selectedBook.cover_i, 'L');

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
                    {coverUrl && (
                        <img
                            src={coverUrl}
                            alt={selectedBook.title}
                            className="w-full max-w-xs mx-auto rounded-xl border border-white/10 shadow-lg"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    )}

                    <h2 className="text-3xl font-bold text-white">{selectedBook.title}</h2>

                    {selectedBook.author_name && (
                        <p className="text-purple-300 text-lg">
                            by {selectedBook.author_name.join(', ')}
                        </p>
                    )}

                    {selectedBook.first_publish_year && (
                        <p className="text-slate-400 text-sm">
                            First published: {selectedBook.first_publish_year}
                        </p>
                    )}

                    {selectedBook.publisher && selectedBook.publisher.length > 0 && (
                        <p className="text-slate-400 text-sm">
                            Publisher: {selectedBook.publisher[0]}
                        </p>
                    )}

                    {description && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                            <p className="text-slate-300 leading-relaxed">{description}</p>
                        </div>
                    )}

                    {selectedBook.subject && selectedBook.subject.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Subjects</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedBook.subject.slice(0, 10).map((subject, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs"
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {wikipediaData && wikipediaData.extract && (
                        <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
                                    <path d="M11 11h2v6h-2zm0-4h2v2h-2z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-blue-200">Wikipedia Summary</h3>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                {wikipediaData.extract}
                            </p>
                            {wikipediaData.content_urls?.desktop?.page && (
                                <a
                                    href={wikipediaData.content_urls.desktop.page}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-200 hover:bg-blue-500/30 transition-colors mt-3 text-sm"
                                >
                                    View on Wikipedia
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-6">
                        {selectedBook.isbn && selectedBook.isbn[0] && (
                            <a
                                href={`https://archive.org/details/isbn_${selectedBook.isbn[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Read Book on Internet Archive
                            </a>
                        )}

                        <a
                            href={`https://openlibrary.org${selectedBook.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 transition-colors"
                        >
                            View on Open Library
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
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
                        placeholder="Search for books..."
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 transition-colors"
                    >
                        📚
                    </button>
                </div>
            </form>

            {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300 animate-pulse">Searching...</p>
                </div>
            )}

            {error && !loading && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                    {error}
                </div>
            )}

            {!loading && searchResults.length > 0 && (
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Results:</h3>
                    {searchResults.map((book, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleBookClick(book)}
                            className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex gap-3">
                                {book.cover_i && (
                                    <img
                                        src={getCoverUrl(book.cover_i, 'S') || ''}
                                        alt={book.title}
                                        className="w-12 h-16 rounded object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white group-hover:text-purple-200 transition-colors mb-1">
                                        📖 {book.title}
                                    </h4>
                                    {book.author_name && (
                                        <p className="text-sm text-slate-400">
                                            by {book.author_name[0]}
                                        </p>
                                    )}
                                    {book.first_publish_year && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {book.first_publish_year}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {!loading && searchResults.length === 0 && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <p className="text-lg">Search for books by title or author</p>
                    <p className="text-sm text-slate-500 max-w-md text-center">
                        Discover millions of books from Open Library
                    </p>
                </div>
            )}
        </div>
    );
};
