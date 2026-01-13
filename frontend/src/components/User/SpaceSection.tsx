import React, { useEffect, useState } from 'react';

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
                throw new Error('Failed to fetch APOD data');
            }
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            setError('Could not establish link with NASA satellites.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-blue-300 animate-pulse font-mono tracking-widest">RECEIVING TELEMETRY...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-2xl">
                <p className="text-red-300 mb-4">{error || "Signal Lost."}</p>
                <button onClick={fetchApod} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-100 rounded-lg transition">retry_connection</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in zoom-in duration-500 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                        Cosmic Insight 🌌
                    </h2>
                    <p className="text-slate-400 text-sm">Astronomy Picture of the Day</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Transmission Date</div>
                    <div className="text-xl font-mono text-white">{data.date}</div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">

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
                            <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110" style={{ backgroundImage: `url(${data.url})` }} />
                            <img
                                src={data.hdurl || data.url}
                                alt={data.title}
                                className="relative z-10 max-h-full w-auto object-contain shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
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
                <div className="p-6 md:p-8 space-y-4 bg-gradient-to-b from-transparent to-black/80">
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        {data.title}
                    </h3>
                    <div className="h-px w-20 bg-blue-500/50"></div>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base max-w-4xl">
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
        </div>
    );
};
