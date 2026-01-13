import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Definition {
    word: string;
    phonetic?: string;
    meanings: {
        partOfSpeech: string;
        definitions: {
            definition: string;
            example?: string;
        }[];
    }[];
}

export const DefinitionPopup: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Definition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleDoubleClick = async (e: MouseEvent) => {
            const selection = window.getSelection();
            const text = selection?.toString().trim();

            if (!text || text.includes(' ') || text.length < 2) {
                return;
            }

            // Check if clicked inside an input or editable area
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }

            // Set initial position immediately to click coordinates
            // Adjust if near right edge
            let x = e.clientX;
            let y = e.clientY + 20; // 20px below cursor

            const screenWidth = window.innerWidth;
            if (x + 300 > screenWidth) {
                x = screenWidth - 320;
            }

            setPosition({ x, y });
            setVisible(true);
            setLoading(true);
            setError(null);
            setData(null);

            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
                if (!res.ok) throw new Error('Definition not found');
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) {
                    setData(json[0]);
                } else {
                    setError('No definition found.');
                }
            } catch (err) {
                setError('Could not define text.');
            } finally {
                setLoading(false);
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setVisible(false);
            }
        };

        // Use capture to detect double click everywhere
        document.addEventListener('dblclick', handleDoubleClick);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('dblclick', handleDoubleClick);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!visible) return null;

    return createPortal(
        <div
            ref={popupRef}
            className="fixed z-50 w-80 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.y, left: position.x }}
        >
            <div className="glass bg-black/80 border border-white/10 backdrop-blur-xl rounded-xl shadow-2xl p-4 text-left">
                {loading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <div className="w-4 h-4 border-2 border-slate-500 border-t-emerald-500 rounded-full animate-spin"></div>
                        Defining...
                    </div>
                ) : error ? (
                    <div className="text-rose-400 text-sm">{error}</div>
                ) : data ? (
                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-xl font-bold text-white capitalize">{data.word}</h3>
                            {data.phonetic && <span className="text-slate-500 font-mono text-xs">{data.phonetic}</span>}
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {data.meanings.slice(0, 2).map((meaning, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">{meaning.partOfSpeech}</div>
                                    <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                                        {meaning.definitions.slice(0, 2).map((def, dIdx) => (
                                            <li key={dIdx}>
                                                <span className="text-slate-200">{def.definition}</span>
                                                {def.example && (
                                                    <p className="text-slate-500 text-xs italic ml-4 mt-1">"{def.example}"</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="pt-2 border-t border-white/5 text-[10px] text-slate-600 uppercase tracking-widest text-right">
                            Dictionary
                        </div>
                    </div>
                ) : null}
            </div>
        </div>,
        document.body
    );
};
