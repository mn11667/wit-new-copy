import React, { useEffect, useState, Suspense } from 'react';
import AppRouter from './router';

// Lazy load background components for better performance
const SkyBackground = React.lazy(() => import('./components/UI/SkyBackground'));
const BackgroundMoon = React.lazy(() => import('./components/Three/Moon3D').then(module => ({ default: module.BackgroundMoon })));

// Hook to detect if device is mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const App: React.FC = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    // Backend keep-alive removed for static site

    // Limit scroll speed by 25%
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      window.scrollBy({
        top: e.deltaY * 0.75,
        left: e.deltaX * 0.75,
        behavior: 'auto'
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <>
      {/* Weather-based 2D sky background */}
      <Suspense fallback={<div className="fixed inset-0 z-[-1] bg-black" />}>
        <SkyBackground />
      </Suspense>

      {/* 3D Moon with meteor storm - Only render on desktop for performance */}
      {!isMobile && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
            <BackgroundMoon />
          </Suspense>
        </div>
      )}

      {/* Main app content */}
      <div className="relative z-10">
        <AppRouter />
      </div>
    </>
  );
};

export default App;
