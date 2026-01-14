import React, { useEffect, useState, Suspense } from 'react';

// Lazy load 3D Moon to avoid main bundle bloat
const BackgroundMoonHelper = React.lazy(() => import('../Three/Moon3D').then(module => ({ default: module.BackgroundMoon })));

interface ApodData {
    date: string;
    explanation: string;
    media_type: string;
    service_version: string;
    title: string;
    url: string;
    hdurl?: string;
    copyright?: string;
}

import { MoonPhase } from './MoonPhase';

export const SpaceSection: React.FC = () => {
    const [data, setData] = useState<ApodData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchApod();
    }, []);

    const fetchApod = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
            if (!res.ok) {
                throw new Error(`NASA API Error: ${res.status}`);
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.warn("NASA API limit reached or failed, using fallback.", err);
            // Graceful Fallback
            const fallbackData: ApodData = {
                date: new Date().toISOString().split('T')[0],
                explanation: "The universe is vast and full of mysteries. Today, limits on the public comms channel have been reached, but the cosmos remains beautiful. Enjoy this stunning view from deep space while we re-establish the link.",
                media_type: "image",
                service_version: "v1",
                title: "Cosmic View (Offline Mode)",
                url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop"
            };
            setData(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[80vh] w-full overflow-hidden rounded-3xl">
            {/* 3D Background System */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-80 mix-blend-screen">
                <Suspense fallback={<div className="w-full h-full bg-black/20" />}>
                    <BackgroundMoonHelper />
                </Suspense>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 animate-in fade-in zoom-in duration-500 space-y-8 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                            Cosmic Insight 🌌
                        </h2>
                        <p className="text-slate-400 text-sm">Real-time Space Telemetry & Astronomy Picture of the Day</p>
                    </div>
                    {/* Date Display (Only if data is loaded, else skeleton) */}
                    <div className="flex items-center gap-4 text-right">
                        <div className="hidden sm:block">
                            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Transmission Date</div>
                            {loading || !data ? (
                                <div className="h-6 w-32 bg-white/10 rounded animate-pulse mt-1"></div>
                            ) : (
                                <div className="text-xl font-mono text-white">{data.date}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column: Moon & Widgets (ALWAYS VISIBLE) */}
                    <div className="space-y-6 lg:col-span-1 order-2 lg:order-1">
                        <MoonPhase />

                        {/* Placeholder for future widgets like Mars Weather or ISS location */}
                        <div className="p-6 bg-black/40 border border-white/10 rounded-3xl backdrop-blur-md opacity-60">
                            <h4 className="text-white font-mono text-xs uppercase tracking-widest mb-2">Deep Space Network</h4>
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: APOD (Main Content) - Shows Skeleton or Content */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        {loading ? (
                            // Skeleton Loader for APOD Section
                            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl h-full flex flex-col min-h-[500px]">
                                <div className="w-full aspect-video bg-white/5 animate-pulse flex items-center justify-center">
                                    <div className="text-blue-500/30 font-mono tracking-widest animate-bounce">RECEIVING TELEMETRY...</div>
                                </div>
                                <div className="p-6 md:p-8 space-y-4 flex-1">
                                    <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse"></div>
                                    <div className="h-px w-20 bg-blue-500/20"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-4 w-full bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (data ? (
                            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl h-full flex flex-col">
                                {/* Media Viewer */}
                                <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                                    {data.media_type === 'video' ? (
                                        <iframe
                                            src={data.url}
                                            title={data.title}
                                            allowFullScreen
                                            className="w-full h-full border-0"
                                        />
                                    ) : (
                                        <>
                                            {/* Blurred background for ambiance */}
                                            <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110" style={{ backgroundImage: `url(${data.url})` }} />
                                            {/* Main Image */}
                                            <img
                                                src={data.url}
                                                alt={data.title}
                                                referrerPolicy="no-referrer"
                                                className="relative z-10 max-h-full w-full object-contain shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1080&auto=format&fit=crop';
                                                }}
                                            />
                                        </>
                                    )}

                                    {/* Copyright badge */}
                                    {data.copyright && (
                                        <div className="absolute bottom-4 right-4 z-20 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white/60">
                                            © {data.copyright}
                                        </div>
                                    )}
                                </div>

                                {/* Info Panel */}
                                <div className="p-6 md:p-8 space-y-4 bg-gradient-to-b from-transparent to-black/80 flex-1">
                                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                        {data.title}
                                    </h3>
                                    <div className="h-px w-20 bg-blue-500/50"></div>
                                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                                        {data.explanation}
                                    </p>
                                    <div className="pt-4 flex items-center justify-end">
                                        <a
                                            href={data.hdurl || data.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-blue-200 transition-colors"
                                        >
                                            <span>View Full Resolution</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Error State
                            <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-2xl">
                                <p className="text-red-300 mb-4">{error || "Signal Lost."}</p>
                                <button onClick={fetchApod} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition">retry_connection</button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};
