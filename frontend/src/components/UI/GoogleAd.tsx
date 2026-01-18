import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface GoogleAdProps {
    /** Your AdSense Client ID (e.g., ca-pub-XXXXXXXXXXXXXXXX) */
    client: string;
    /** The specific Ad Slot ID for this unit */
    slot: string;
    /** Ad format (auto is recommended for responsive layouts) */
    format?: 'auto' | 'fluid' | 'rectangle';
    /** Whether the ad should be responsive */
    responsive?: boolean;
    /** Custom styles for the container */
    style?: React.CSSProperties;
    /** Custom class names */
    className?: string;
}

const GoogleAd = ({
    client,
    slot,
    format = 'auto',
    responsive = true,
    style,
    className = ''
}: GoogleAdProps) => {
    const adRef = useRef<HTMLDivElement>(null);
    const adInitialized = useRef(false);

    useEffect(() => {
        // Prevent duplicate initialization
        if (adInitialized.current) {
            return;
        }

        try {
            // Mark as initialized before pushing to prevent race conditions
            adInitialized.current = true;
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
            // Reset on error so it can retry
            adInitialized.current = false;
        }
    }, []); // Empty dependency array - only run once on mount

    return (
        <div className={`w-full flex justify-center my-4 ${className}`} style={style}>
            {/* The ins tag is where the ad will be injected */}
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? "true" : "false"}
            />
        </div>
    );
};

export default GoogleAd;
