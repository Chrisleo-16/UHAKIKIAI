import { useState, useCallback } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Preloader } from '@/components/Preloader';

const Index = () => {
  const [showPreloader, setShowPreloader] = useState(true);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  return (
    <>
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      <Dashboard />
    </>
  );
};

export default Index;
