import React, { useEffect } from 'react';
import AppRouter from './router';
import SkyBackground from './components/UI/SkyBackground';
const App: React.FC = () => {
  useEffect(() => {
    // Backend keep-alive removed for static site
  }, []);

  return (
    <>
      <SkyBackground />
      <AppRouter />
    </>
  );
};

export default App;
