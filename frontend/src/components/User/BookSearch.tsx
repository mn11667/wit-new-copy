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

export const BookSearch: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
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

    const loadBookDetails = async (book: Book) => {
        setLoading(true);
        try {
            const res = await fetch(`https://openlibrary.org${book.key}.json`);
            const details = await res.json();
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

                    <a
                        href={`https://openlibrary.org${selectedBook.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 transition-colors mt-4"
                    >
                        View on Open Library
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
