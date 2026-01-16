import React from 'react';
import { Button } from './Button';

interface LockedTabButtonProps {
    label: string;
    onClick: () => void;
    className?: string;
}

export const LockedTabButton: React.FC<LockedTabButtonProps> = ({ label, onClick, className = '' }) => {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={`relative group ${className}`}
        >
            <span className="opacity-60">{label}</span>
            <span className="ml-2 text-amber-400 group-hover:text-amber-300 transition-colors" title="Login required">
                🔒
            </span>
        </Button>
    );
};
