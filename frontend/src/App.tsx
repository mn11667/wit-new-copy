import React, { useEffect, Suspense } from 'react';
import AppRouter from './router';
import SkyBackground from './components/UI/SkyBackground';

// Lazy load the 3D moon background
const BackgroundMoon = React.lazy(() => import('./components/Three/Moon3D').then(module => ({ default: module.BackgroundMoon })));

const App: React.FC = () => {
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
      <SkyBackground />

      {/* 3D Moon with meteor storm - Global background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
          <BackgroundMoon />
        </Suspense>
      </div>

      {/* Main app content */}
      <div className="relative z-10">
        <AppRouter />
      </div>
    </>
  );
};

export default App;
