import React, { useState, useEffect } from 'react';

interface ClockProps {
    className?: string;
    options?: Intl.DateTimeFormatOptions;
    refreshInterval?: number;
}

export const Clock: React.FC<ClockProps> = ({ className, options, refreshInterval = 1000 }) => {
    const getNow = () => new Date().toLocaleString(undefined, options);
    const [now, setNow] = useState<string>(getNow());

    useEffect(() => {
        const t = setInterval(() => setNow(getNow()), refreshInterval);
        return () => clearInterval(t);
    }, [options, refreshInterval]);

    return <span className={className}>{now}</span>;
};
