import React from 'react';

const PLAYLIST_ID = 'PLztdBcd3--U0Lxzt4LUcYeBqy4iD-2E6n';

export const YouTubeSection: React.FC = () => {
    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Video Classes</h2>
                <p className="text-slate-400">Curated playlist for your preparation</p>
            </div>

            <div className="glass p-1 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-white/10 relative aspect-video">
                <iframe
                    className="w-full h-full rounded-xl"
                    src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}&rel=0&modestbranding=1`}
                    title="YouTube Playlist"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-white mb-2">Playlist Contents</h3>
                    <p className="text-sm text-slate-400">
                        This playlist contains comprehensive video lectures. Use the playlist icon <span className="inline-block align-middle bg-white/20 p-0.5 rounded px-1 text-[10px]">☰</span> in the top right of the video player above to browse and select specific topics.
                    </p>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Tips</h3>
                    <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                        <li>Watch at 1.5x speed for quick revision</li>
                        <li>Take notes while watching</li>
                        <li>Use the "Practice" tab to test your knowledge after watching</li>
                    </ul>
                </div>
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-emerald-300 mb-2">Progress</h3>
                    <p className="text-sm text-slate-400">
                        Your progress on these videos is tracked automatically by YouTube if you are signed in.
                    </p>
                </div>
            </div>
        </div>
    );
};
