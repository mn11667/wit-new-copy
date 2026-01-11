import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';

const PLAYLIST_ID = "PLztdBcd3--U0Lxzt4LUcYeBqy4iD-2E6n";
// Increased limit to cover more videos in the playlist.
const TOTAL_VIDEOS_ESTIMATE = 200;
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

interface PlaylistItem {
    id: number;
    title: string;
    duration?: string;
    originalIndex: number; // The actual 1-based index in the playlist
}

export const YouTubeSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [playlistData, setPlaylistData] = useState<PlaylistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylistItems = async () => {
            if (!API_KEY) {
                console.warn("YouTube API Key not found. Using generic data.");
                setIsLoading(false);
                return;
            }

            try {
                let allItems: PlaylistItem[] = [];
                let nextPageToken = '';
                let fetchMore = true;

                // Loop to fetch all pages of the playlist
                while (fetchMore) {
                    const response = await fetch(
                        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}&pageToken=${nextPageToken}`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch playlist');
                    }

                    const data = await response.json();

                    const formattedItems = data.items.map((item: any, index: number) => ({
                        id: allItems.length + index, // Continuous ID
                        title: item.snippet.title,
                        originalIndex: item.snippet.position + 1 // Position is 0-based from API
                    }));

                    allItems = [...allItems, ...formattedItems];

                    if (data.nextPageToken) {
                        nextPageToken = data.nextPageToken;
                    } else {
                        fetchMore = false;
                    }
                }

                setPlaylistData(allItems);
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistItems();
    }, []);

    // Fallback generation if API fails or no key
    const displayItems = playlistData.length > 0 ? playlistData : Array.from({ length: TOTAL_VIDEOS_ESTIMATE }, (_, i) => ({
        id: i,
        title: `Day ${i + 1}: Class Recording`,
        duration: '45:00',
        originalIndex: i + 1
    }));

    // Standard playlist embed format which typically respects 'index' better than videoseries
    const videoUrl = `https://www.youtube.com/embed?listType=playlist&list=${PLAYLIST_ID}&index=${currentIndex}&autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] gap-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-white">Live Classes: Concept of Management</h2>
                    <p className="text-slate-400 text-sm">Comprehensive video series for Loksewa preparation</p>
                </div>
                <Button variant="ghost" className="hidden md:flex" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? 'Hide Playlist' : 'Show Playlist'}
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 gap-4 overflow-hidden relative">

                {/* Video Player Container */}
                <div className={`flex-1 flex flex-col min-w-0 bg-black/40 rounded-2xl overflow-hidden border border-white/10 relative transition-all duration-300 ${isSidebarOpen ? 'md:mr-0' : ''}`}>
                    <div className="flex-1 relative bg-black">
                        <iframe
                            key={videoUrl} // Unique key to force iframe remount
                            className="absolute inset-0 w-full h-full"
                            src={videoUrl}
                            title="YouTube Playlist"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                {/* Playlist Sidebar */}
                <div className={`
                    absolute md:relative z-10 right-0 top-0 bottom-0 
                    w-80 bg-[#0f172a]/95 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-none
                    border-l md:border border-white/10 md:rounded-2xl
                    flex flex-col transition-all duration-300 transform
                    ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:hidden'}
                `}>
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Course Content</h3>
                        <span className="text-xs text-slate-400">{currentIndex} / {displayItems.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden library-scroll p-2 space-y-1">
                        {displayItems.map((item) => {
                            const isActive = item.originalIndex === currentIndex;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentIndex(item.originalIndex)}
                                    className={`
                                        w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group
                                        ${isActive
                                            ? 'bg-blue-600/20 border border-blue-500/30'
                                            : 'hover:bg-white/5 border border-transparent hover:border-white/5'}
                                    `}
                                >
                                    <div className={`
                                        flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-medium mt-0.5
                                        ${isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-white/20'}
                                    `}>
                                        {isActive ? '▶' : item.originalIndex}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-200' : 'text-slate-300'}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 bg-black/20 px-1.5 py-0.5 rounded">
                                                Video
                                            </span>
                                            {isActive && <span className="text-[10px] text-blue-400 animate-pulse">Now Playing</span>}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
