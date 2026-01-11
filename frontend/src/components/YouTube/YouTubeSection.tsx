
import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';

const PLAYLIST_ID = "PLztdBcd3--U0Lxzt4LUcYeBqy4iD-2E6n";
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

interface PlaylistItem {
    id: string | number; // String for API search results (videoId), Number for playlist index
    title: string;
    thumbnail?: string;
    originalIndex?: number; // For playlist items
    videoId?: string; // For search items
}

export const YouTubeSection: React.FC = () => {
    // Top-level View State
    const [subTab, setSubTab] = useState<'playlist' | 'search'>('playlist');

    // Playlist State
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [playlistData, setPlaylistData] = useState<PlaylistItem[]>([]);
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchContext, setSearchContext] = useState<'loksewa' | 'news'>('loksewa');
    const [searchResults, setSearchResults] = useState<PlaylistItem[]>([]);
    const [playingSearchVideoId, setPlayingSearchVideoId] = useState<string | null>(null);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    // --- Playlist Fetching Logic (Existing) ---
    useEffect(() => {
        const fetchPlaylistItems = async () => {
            if (!API_KEY) {
                console.warn("YouTube API Key missing.");
                setIsPlaylistLoading(false);
                return;
            }
            try {
                let allItems: PlaylistItem[] = [];
                let nextPageToken = '';
                let fetchMore = true;

                while (fetchMore) {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}&pageToken=${nextPageToken}`
                    );
                    if (!response.ok) throw new Error('Playlist fetch failed');
                    const data = await response.json();

                    const formattedItems = data.items.map((item: any, index: number) => ({
                        id: allItems.length + index,
                        title: item.snippet.title,
                        originalIndex: item.snippet.position + 1
                    }));

                    allItems = [...allItems, ...formattedItems];

                    if (data.nextPageToken) nextPageToken = data.nextPageToken;
                    else fetchMore = false;
                }
                setPlaylistData(allItems);
            } catch (error) {
                console.error(error);
            } finally {
                setIsPlaylistLoading(false);
            }
        };
        if (subTab === 'playlist' && playlistData.length === 0) fetchPlaylistItems();
    }, [subTab]); // Only fetch when entering playlist tab if empty

    // --- Search Logic (New) ---
    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim() || !API_KEY) return;

        setIsSearchLoading(true);
        try {
            // STRICT Context Enforcement
            const strictQuery = searchContext === 'loksewa'
                ? `Loksewa Nepal ${searchQuery}`
                : `Nepali News ${searchQuery}`;

            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(strictQuery)}&type=video&key=${API_KEY}`
            );

            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();

            const items: PlaylistItem[] = data.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url,
                videoId: item.id.videoId
            }));

            setSearchResults(items);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearchLoading(false);
        }
    };

    // --- Render Helpers ---

    // Construct the active video URL
    // If Playlist Tab: Use standard playlist embed by index
    // If Search Tab: Use specific video embed by ID
    const getEmbedUrl = () => {
        if (subTab === 'playlist') {
            return `https://www.youtube.com/embed?listType=playlist&list=${PLAYLIST_ID}&index=${currentIndex}&autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;
        } else {
            // If a searched video is selected, play it. Otherwise, show nothing or placeholder.
            return playingSearchVideoId
                ? `https://www.youtube.com/embed/${playingSearchVideoId}?autoplay=1&rel=0`
                : '';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] gap-4 animate-in fade-in slide-in-from-bottom-4">

            {/* Top Navigation / Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setSubTab('playlist')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'playlist' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Course Playlist
                    </button>
                    <button
                        onClick={() => setSubTab('search')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${subTab === 'search' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Search Videos
                    </button>
                </div>

                {subTab === 'playlist' && (
                    <Button variant="ghost" className="hidden md:flex" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? 'Hide List' : 'Show List'}
                    </Button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-4 overflow-hidden relative">

                {/* LEFT SIDE: Video Player (Shared) */}
                <div className={`flex-1 flex flex-col min-w-0 bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative transition-all duration-300 ${isSidebarOpen && subTab === 'playlist' ? 'md:mr-0' : ''}`}>
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        {subTab === 'search' && !playingSearchVideoId ? (
                            <div className="text-center p-8 text-slate-500">
                                <div className="mb-4 text-4xl">🔍</div>
                                <p>Search and select a video to start playing</p>
                            </div>
                        ) : (
                            <iframe
                                key={getEmbedUrl()} // Force reload on URL change
                                className="absolute inset-0 w-full h-full"
                                src={getEmbedUrl()}
                                title="YouTube Player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE: Sidebar / List (Context Dependent) */}
                <div className={`
                    absolute md:relative z-10 right-0 top-0 bottom-0 
                    w-80 md:w-96 bg-[#0f172a]/95 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-none
                    border-l md:border border-white/10 md:rounded-2xl
                    flex flex-col transition-all duration-300 transform
                    ${(isSidebarOpen || subTab === 'search') ? 'translate-x-0' : 'translate-x-full md:hidden'} 
                    ${subTab === 'search' ? 'md:block' : ''}
                `}>

                    {/* --- PLAYLIST CONTENT --- */}
                    {subTab === 'playlist' && (
                        <>
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-semibold text-white">Course Content</h3>
                                <span className="text-xs text-slate-400">{currentIndex} / {playlistData.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto overflow-x-hidden library-scroll p-2 space-y-1">
                                {isPlaylistLoading ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">Loading playlist...</div>
                                ) : (
                                    playlistData.map((item) => {
                                        const isActive = item.originalIndex === currentIndex;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setCurrentIndex(item.originalIndex || 1)}
                                                className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent hover:border-white/5'}`}
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-medium mt-0.5 ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-white/20'}`}>
                                                    {isActive ? '▶' : item.originalIndex}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>{item.title}</p>
                                                    {isActive && <span className="text-[10px] text-blue-400 animate-pulse mt-1 block">Now Playing</span>}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}

                    {/* --- SEARCH CONTENT --- */}
                    {subTab === 'search' && (
                        <>
                            <div className="p-4 border-b border-white/10 space-y-3">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSearchContext('loksewa')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${searchContext === 'loksewa' ? 'bg-blue-500/20 border-blue-500 text-blue-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                                    >
                                        Loksewa Only
                                    </button>
                                    <button
                                        onClick={() => setSearchContext('news')}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${searchContext === 'news' ? 'bg-green-500/20 border-green-500 text-green-300' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}
                                    >
                                        Nepali News
                                    </button>
                                </div>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={searchContext === 'loksewa' ? "Search topics..." : "Search news..."}
                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50"
                                    />
                                    <Button type="submit" variant="primary" disabled={isSearchLoading} className="px-3">
                                        {isSearchLoading ? '...' : 'Go'}
                                    </Button>
                                </form>
                            </div>

                            <div className="flex-1 overflow-y-auto overflow-x-hidden library-scroll p-2 space-y-2">
                                {searchResults.length === 0 && !isSearchLoading && (
                                    <div className="text-center py-10 text-slate-500 text-xs px-6">
                                        Use the search bar above to find {searchContext === 'loksewa' ? 'Loksewa videos' : 'Nepali news'}.
                                    </div>
                                )}
                                {searchResults.map((video) => {
                                    const isPlaying = video.id === playingSearchVideoId;
                                    return (
                                        <button
                                            key={video.id}
                                            onClick={() => setPlayingSearchVideoId(video.id as string)}
                                            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group ${isPlaying ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="relative flex-shrink-0 w-24 aspect-video rounded-md overflow-hidden bg-black">
                                                {video.thumbnail && <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                                            </div>
                                            <div className="min-w-0 flex-1 py-1">
                                                <p className={`text-xs font-medium line-clamp-2 ${isPlaying ? 'text-blue-200' : 'text-slate-300'}`}>{video.title}</p>
                                                {isPlaying && <span className="text-[10px] text-blue-400 mt-1 block">Now Playing</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
