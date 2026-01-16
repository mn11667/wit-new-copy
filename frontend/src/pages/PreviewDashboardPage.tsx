import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '../components/UI/Button';
import { LockedTabButton } from '../components/UI/LockedTabButton';
import { LoginPromptModal } from '../components/UI/LoginPromptModal';
import { getRandomQuote } from '../data/quotes';
import { Clock } from '../components/UI/Clock';

// Lazy load sections
const DiscoverSection = React.lazy(() => import('../components/User/DiscoverSection').then(module => ({ default: module.DiscoverSection })));
const BrainGymSection = React.lazy(() => import('../components/User/BrainGymSection').then(module => ({ default: module.BrainGymSection })));

const PreviewDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'discover' | 'braingym'>('discover');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [quote, setQuote] = useState('');
    const [discoverVisited, setDiscoverVisited] = useState(true); // Start with true since it's default
    const [brainGymVisited, setBrainGymVisited] = useState(false);

    useEffect(() => {
        setQuote(getRandomQuote());
    }, []);

    useEffect(() => {
        if (activeTab === 'discover') setDiscoverVisited(true);
        if (activeTab === 'braingym') setBrainGymVisited(true);
    }, [activeTab]);

    const handleLockedTabClick = () => {
        setShowLoginModal(true);
    };

    return (
        <DashboardLayout title="Preview Mode">
            <div className="space-y-4">
                {/* Preview Mode Banner */}
                <div className="rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 text-center backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-white mb-2">
                                🎉 Preview Mode - Explore Limited Features
                            </h2>
                            <p className="text-sm text-slate-300">
                                You're currently exploring in preview mode. Login to unlock full access to all content and track your progress.
                            </p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Link to="/login">
                                <Button variant="primary" className="rounded-full px-6 shadow-lg shadow-blue-500/25">
                                    Login
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                className="rounded-full px-6 border border-white/20"
                                onClick={handleLockedTabClick}
                            >
                                Request Account
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Greeting Section */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-white mb-0.5">
                            Welcome, Guest! 👋
                        </h1>
                        <p className="text-slate-400 italic text-sm">"{quote}"</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <div className="mac-pill inline-block">Preview Workspace</div>
                        <div className="text-sm text-slate-400">Local time: <Clock className="inline text-slate-200" /></div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mac-cta-row">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Locked Tabs */}
                        <LockedTabButton
                            label="Library"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />
                        <LockedTabButton
                            label="Bookmarks"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />
                        <LockedTabButton
                            label="Completed"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />
                        <LockedTabButton
                            label="Practice"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />
                        <LockedTabButton
                            label="YouTube"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />

                        {/* Active Tabs */}
                        <Button
                            variant={activeTab === 'discover' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('discover')}
                            className="hidden sm:inline-flex"
                        >
                            Discover 🚀
                        </Button>

                        <LockedTabButton
                            label="Space 🌌"
                            onClick={handleLockedTabClick}
                            className="hidden sm:inline-flex"
                        />

                        <Button
                            variant={activeTab === 'braingym' ? 'primary' : 'ghost'}
                            onClick={() => setActiveTab('braingym')}
                            className="hidden sm:inline-flex"
                        >
                            Brain Gym 🧠
                        </Button>

                        {/* Login CTA on mobile */}
                        <div className="ml-auto flex gap-2 sm:hidden">
                            <Link to="/login">
                                <Button variant="primary" className="text-sm px-4">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Limited Preview Access</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-3">
                                In preview mode, you can explore <strong className="text-white">Discover</strong> and <strong className="text-white">Brain Gym</strong> features.
                                To unlock all features including:
                            </p>
                            <ul className="text-slate-400 text-sm space-y-1.5 mb-4">
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">📚</span>
                                    <span>Curated Library with PDFs and Video Classes</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">📝</span>
                                    <span>Practice Exams with Progress Tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-red-400">📺</span>
                                    <span>YouTube Integration</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-emerald-400">⭐</span>
                                    <span>Bookmarks and Completion Tracking</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">🌌</span>
                                    <span>Space Exploration Features</span>
                                </li>
                            </ul>
                            <Button
                                variant="primary"
                                className="rounded-lg shadow-lg shadow-blue-500/20"
                                onClick={handleLockedTabClick}
                            >
                                Request Account Access
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mac-card-grid">
                    {discoverVisited && (
                        <div style={{ display: activeTab === 'discover' ? 'contents' : 'none' }}>
                            <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div></div>}>
                                <DiscoverSection />
                            </React.Suspense>
                        </div>
                    )}

                    {brainGymVisited && (
                        <div style={{ display: activeTab === 'braingym' ? 'contents' : 'none' }}>
                            <React.Suspense fallback={<div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-slate-300 border-t-purple-600 rounded-full animate-spin"></div></div>}>
                                <BrainGymSection />
                            </React.Suspense>
                        </div>
                    )}
                </div>
            </div>

            {/* Login Prompt Modal */}
            <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </DashboardLayout>
    );
};

export default PreviewDashboardPage;
