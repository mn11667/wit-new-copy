import React, { useEffect } from 'react';
import AppRouter from './router';
import SkyBackground from './components/UI/SkyBackground';
import { startWitKeepAlive } from './services/witKeepAlive';

const App: React.FC = () => {
  useEffect(() => {
    const stop = startWitKeepAlive();
    return () => stop();
  }, []);

  return (
    <>
      <SkyBackground />
      <AppRouter />
    </>
  );
};

export default App;
