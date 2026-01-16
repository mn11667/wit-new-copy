import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Simply prevent scrolling without changing position
            document.body.style.overflow = 'hidden';
        } else {
            // Restore scrolling
            document.body.style.overflow = '';
        }

        return () => {
            // Cleanup on unmount
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset to login tab when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab('login');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="min-h-screen flex items-center justify-center p-4">
                <div
                    className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200 min-h-[85vh] max-h-[90vh] flex flex-col my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header with Tabs */}
                    <div className="p-6 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Access Required</h2>
                                <p className="text-sm text-slate-400">Login or request account access</p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'login'
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('request')}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'request'
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                Request Account
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {activeTab === 'login' ? (
                            <div className="p-8 flex flex-col items-center justify-center h-full">
                                <p className="text-slate-300 mb-6 text-center leading-relaxed">
                                    This feature is only available to registered users. Please login with your credentials to continue.
                                </p>
                                <Link to="/login" className="w-full max-w-xs">
                                    <Button variant="primary" className="w-full rounded-xl py-3 font-semibold shadow-lg shadow-blue-500/25">
                                        Go to Login Page
                                    </Button>
                                </Link>
                                <p className="mt-6 text-center text-xs text-slate-500">
                                    Don't have an account? Switch to "Request Account" tab
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 bg-blue-500/10 border-b border-blue-500/20 flex-shrink-0">
                                    <p className="text-sm text-blue-200 text-center mb-2">
                                        Fill out the form below to request account access from the administrator
                                    </p>
                                    <p className="text-xs text-blue-300/80 text-center font-medium mb-3">
                                        ✓ You will be contacted soon by the service provider after submission
                                    </p>
                                    <div className="flex justify-center">
                                        <a
                                            href="https://docs.google.com/forms/d/e/1FAIpQLSe0WS7ktuwhtWhabSY1G5Uj5PN6cEj4OaeS2Nqn6WKPqiPLAA/viewform"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Open Form in New Tab
                                        </a>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    <iframe
                                        src="https://docs.google.com/forms/d/e/1FAIpQLSe0WS7ktuwhtWhabSY1G5Uj5PN6cEj4OaeS2Nqn6WKPqiPLAA/viewform?embedded=true"
                                        className="w-full"
                                        style={{ minHeight: '700px', height: '100%' }}
                                        frameBorder="0"
                                        marginHeight={0}
                                        marginWidth={0}
                                    >
                                        Loading…
                                    </iframe>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
