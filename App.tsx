import React, { useEffect, useState } from 'react';
import GameProvider from './contexts/GameContext';
import GameContainer from './components/GameContainer';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <GameProvider>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <GameContainer />
      )}
    </GameProvider>
  );
}

export default App;