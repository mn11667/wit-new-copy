import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height
}) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';

    const variantClasses = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%')
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};

// Dashboard skeleton for loading state
export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 p-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton width={200} height={24} />
                    <Skeleton width={300} height={16} />
                </div>
                <div className="space-y-2">
                    <Skeleton width={100} height={32} variant="rectangular" />
                    <Skeleton width={120} height={16} />
                </div>
            </div>

            {/* Tab buttons skeleton */}
            <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} width={100} height={36} variant="rectangular" />
                ))}
            </div>

            {/* Content cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-3 p-4 rounded-xl border border-white/10">
                        <Skeleton height={160} variant="rectangular" />
                        <Skeleton width="80%" />
                        <Skeleton width="60%" />
                        <div className="flex gap-2">
                            <Skeleton width={60} height={24} variant="rectangular" />
                            <Skeleton width={60} height={24} variant="rectangular" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// MCQ Section skeleton
export const MCQSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton width={150} height={20} />
                <Skeleton width="100%" height={60} variant="rectangular" />
            </div>

            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height={48} variant="rectangular" />
                ))}
            </div>

            <div className="flex justify-between">
                <Skeleton width={100} height={40} variant="rectangular" />
                <Skeleton width={100} height={40} variant="rectangular" />
            </div>
        </div>
    );
};

// News/Discover section skeleton
export const NewsSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/10">
                    <Skeleton width={120} height={120} variant="rectangular" />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="90%" height={20} />
                        <Skeleton width="100%" />
                        <Skeleton width="100%" />
                        <Skeleton width="70%" />
                        <div className="flex gap-2 mt-2">
                            <Skeleton width={60} height={20} variant="rectangular" />
                            <Skeleton width={80} height={20} variant="rectangular" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
