import React, { useEffect, useState } from 'react';
import { SyllabusPaper, SyllabusSection } from '../../data/syllabus';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface SyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    syllabus: SyllabusPaper[];
    folderName?: string;
}

const SyllabusSectionItem = ({ section, defaultExpanded }: { section: SyllabusSection, defaultExpanded: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="pl-4 border-l-2 border-purple-500/20 space-y-3">
            <div
                className="rounded-lg bg-white/5 border border-white/10 p-3 cursor-pointer hover:bg-white/10 transition-colors select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <svg
                            className={`w-4 h-4 text-purple-300 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <h4 className="text-lg font-semibold text-purple-300">{section.section}</h4>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">{section.type}</span>
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{section.marks} Marks</span>
                        <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">{section.duration}</span>
                    </div>
                </div>
            </div>

            {/* Topics */}
            {isExpanded && (
                <div className="space-y-2">
                    {section.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="rounded-lg bg-[#111] border border-white/5 p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h5 className="font-semibold text-white text-lg">{topic.title}</h5>
                                {topic.marks && <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 shrink-0 border border-white/5">{topic.marks} Marks</span>}
                            </div>
                            {topic.subtopics && topic.subtopics.length > 0 && (
                                <ul className="space-y-2">
                                    {topic.subtopics.map((sub, subIdx) => (
                                        <li key={subIdx} className="text-sm text-slate-300 leading-relaxed flex items-start gap-3">
                                            <span className="text-blue-500 mt-1.5 text-[10px]">•</span>
                                            <span>{sub}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SyllabusModal: React.FC<SyllabusModalProps> = ({ isOpen, onClose, syllabus, folderName }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            const originalPaddingRight = document.body.style.paddingRight;

            // Check if scrollbar is visible
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Prevent background scroll
            document.body.style.overflow = 'hidden';
            // Prevent layout shift from scrollbar disappearing
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                // Restore original styles
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // If folderName is present, it's a filtered view (small), so expand by default.
    // If not, it's the full syllabus (large), so collapse by default for performance.
    const defaultExpanded = !!folderName;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
        >
            <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-muted border-white/10 shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0A0A] shadow-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {folderName ? `${folderName} - Syllabus` : 'NEA Level 7 - Full Syllabus'}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Electrical Engineer Exam Syllabus</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="shrink-0 hover:bg-white/10">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                <div
                    className="overflow-auto p-6 space-y-6 bg-black/20"
                    style={{ maxHeight: 'calc(90vh - 100px)' }}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    {syllabus.map((paper, pIdx) => (
                        <div key={pIdx} className="space-y-4">
                            {/* Paper Header */}
                            <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 p-4">
                                <h3 className="text-xl font-bold text-white">{paper.paper}</h3>
                                <p className="text-slate-300">{paper.subject}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-blue-300">Full Marks: {paper.fullMarks}</span>
                                    <span className="text-emerald-300">Pass Marks: {paper.passMarks}</span>
                                </div>
                            </div>

                            {/* Collapsible Sections */}
                            {paper.sections.map((section, sIdx) => (
                                <SyllabusSectionItem
                                    key={sIdx}
                                    section={section}
                                    defaultExpanded={defaultExpanded}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="sticky bottom-0 p-4 border-t border-white/10 bg-[#0A0A0A] shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <Button variant="primary" onClick={onClose} className="w-full">
                        Close Syllabus
                    </Button>
                </div>
            </Card>
        </div>
    );
};
