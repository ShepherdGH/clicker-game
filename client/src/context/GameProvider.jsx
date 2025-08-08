// src/context/GameProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const GameProvider = ({ children }) => {
  //initialization
  const [gameState, setGameState] = useState({
    inventory: {},
    tools: {},
    area: {}
  });

  //per sec update
  useEffect(() => {
    const interval = setInterval(() => {
      loadGameData();
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  //get game data from server by api
  //set gameState by data
  const loadGameData = async () => {
    try {
      const data = await api.getGameData();
      setGameState(data);
    } catch (error) {
      console.error('Error loading game data:', error);
      
    }
  };

  //get click method from server
  const handleClick = async (resourceType) => {
    try {
      const data = await api.click(resourceType);
      setGameState(data);
    } catch (error) {
      console.error('Error clicking:', error);
    }
  };
  //calculate upgrade cost
  const getUpgradeCost = (toolType, upgradeType) => {
    const tool = gameState.tools[toolType];
    if (!tool) return 0;

    switch (upgradeType) {
      case 'clickPower':
        return (tool.click_level + 1) * 10; 
      case 'autoCollector':
        return (tool.collector_level + 1) * 50; 
      default:
        return 0;
    }
  };
  
  const handleUpgrade = async (toolType, upgradeType) => {
    try {
      const data = await api.buyUpgrade(toolType, upgradeType);
      setGameState(data);
    } catch (error) {
      alert('Not enough resources!');
    }
  };

  
  const buyUpgrade = (toolType, upgradeType) => {
    handleUpgrade(toolType, upgradeType);
  };


  return (
    <GameContext.Provider value={{
      gameState,
      handleClick,
      buyUpgrade,
      getUpgradeCost,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
