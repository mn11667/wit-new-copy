import React, { useEffect, useState } from 'react';
import { SyllabusPaper, SyllabusSection } from '../../data/syllabus';

interface SyllabusModalProps {
    isOpen: boolean;
    onClose: () => void;
    syllabus: SyllabusPaper[];
    folderName?: string;
}

const SyllabusSectionItem = React.memo(({ section, defaultExpanded }: { section: SyllabusSection, defaultExpanded: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="space-y-3">
            <div
                className="rounded-md bg-amber-900/10 border border-amber-800/30 p-3 cursor-pointer hover:bg-amber-900/20 transition-colors select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <svg
                            className={`w-4 h-4 text-amber-700 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <h4 className="text-lg font-semibold text-amber-900">{section.section}</h4>
                    </div>
                    <div className="flex gap-3 text-xs">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">{section.type}</span>
                        <span className="px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">{section.marks} Marks</span>
                        <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 border border-orange-200">{section.duration}</span>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-2 pl-4 border-l-2 border-amber-300">
                    {section.topics.map((topic, tIdx) => (
                        <div key={tIdx} className="rounded-md bg-white/50 border border-amber-200 p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <h5 className="font-semibold text-gray-800 text-lg">{topic.title}</h5>
                                {topic.marks && <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 shrink-0 border border-gray-200">{topic.marks} Marks</span>}
                            </div>
                            {topic.subtopics && topic.subtopics.length > 0 && (
                                <ul className="space-y-2">
                                    {topic.subtopics.map((sub, subIdx) => (
                                        <li key={subIdx} className="text-sm text-gray-700 leading-relaxed flex items-start gap-3">
                                            <span className="text-amber-600 mt-1.5 text-[10px]">●</span>
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
});

export const SyllabusModal: React.FC<SyllabusModalProps> = ({ isOpen, onClose, syllabus, folderName }) => {
    const defaultExpanded = !!folderName;

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            // Add specific class for dashboard scroll handler to see
            document.body.classList.add('modal-open');
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.classList.remove('modal-open');
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70"
            onClick={onClose}
        >
            {/* Paper container */}
            <div
                className="w-full max-w-4xl bg-[#fef9e7] rounded-xl shadow-2xl relative flex flex-col z-50"
                style={{
                    height: '85vh', // Fixed height
                    background: 'linear-gradient(to bottom, #fef9e7, #fdf6e3, #fcf4dc)',
                }}
                // ISOLATION: Stop ALL events from bubbling to overlay
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onScroll={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed Height */}
                <div className="h-20 shrink-0 px-6 border-b-2 border-amber-200 flex items-center justify-between bg-[#fef9e7]/90 z-20 rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                            {folderName ? `${folderName} - Syllabus` : 'NEA Level 7 - Full Syllabus'}
                        </h2>
                        <p className="text-sm text-amber-700 mt-1">Electrical Engineer Exam Syllabus</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-amber-100 text-amber-800"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div
                    className="flex-1 overflow-y-auto px-6 pb-6 pt-4"
                    style={{
                        opacity: 1,
                        isolation: 'isolate',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {syllabus.map((paper, pIdx) => (
                        <div key={pIdx} className="mb-6">
                            <div className="rounded-md bg-gradient-to-r from-amber-100 to-orange-50 border-2 border-amber-300 p-4 mb-4 sticky top-0 z-10 shadow-sm">
                                <h3 className="text-xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>{paper.paper}</h3>
                                <p className="text-amber-700">{paper.subject}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="text-blue-700 font-medium">Full Marks: {paper.fullMarks}</span>
                                    <span className="text-green-700 font-medium">Pass Marks: {paper.passMarks}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {paper.sections.map((section, sIdx) => (
                                    <SyllabusSectionItem
                                        key={sIdx}
                                        section={section}
                                        defaultExpanded={defaultExpanded}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
