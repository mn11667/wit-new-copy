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

    useEffect(() => {
        // Only execute if not already populated to avoid duplicate push errors in React strict mode
        if (adRef.current && adRef.current.innerHTML.trim() === '') {
            // This logic is tricky with the <ins> tag being managed by AdSense.
            // Usually, we just push to adsbygoogle.
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

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
