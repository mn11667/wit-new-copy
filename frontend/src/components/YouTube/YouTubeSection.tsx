import React, { useState } from 'react';
import { Button } from '../UI/Button';

const PLAYLIST_ID = 'PLztdBcd3--U0Lxzt4LUcYeBqy4iD-2E6n';
const TOTAL_VIDEOS_ESTIMATE = 30; // Estimated count based on user context

export const YouTubeSection: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Generate dummy playlist items since we can't fetch real titles without API key
    const playlistItems = Array.from({ length: TOTAL_VIDEOS_ESTIMATE }, (_, i) => ({
        id: i,
        title: `Day ${i + 1}: Class Recording`,
        duration: '45:00' // Placeholder
    }));

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
                            key={currentIndex} // Force reload on index change to ensure proper start
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&index=${currentIndex}&autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
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
                        <span className="text-xs text-slate-400">{currentIndex + 1} / {playlistItems.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden library-scroll p-2 space-y-1">
                        {playlistItems.map((item, idx) => {
                            const isActive = idx === currentIndex;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentIndex(idx)}
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
                                        {isActive ? '▶' : idx + 1}
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
