// src/context/GameProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    money: 0,
    experience: 0,
    level: 1,
    clickPower: 1,
    autoClickers: 0,
    autoExperience: 0,
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
      setLoading(false);
    } catch (error) {
      console.error('Error loading game data:', error);
      setLoading(false);
    }
  };

  //get click method from server
  const handleClick = async () => {
    try {
      const data = await api.click();
      setGameState(data);
    } catch (error) {
      console.error('Error clicking:', error);
    }
  };
  //calculate upgrade cost
  const getUpgradeCost = (type) => {
    switch (type) {
      case 'clickPower':
        return gameState.clickPower * 10;
      case 'autoClicker':
        return (gameState.autoClickers + 1) * 50;
      case 'autoExperience':
        return (gameState.autoExperience + 1) * 75;
      default:
        return 0;
    }
  };
  
  const handleUpgrade = async (upgradeType) => {
    try {
      const data = await api.buyUpgrade(upgradeType);
      setGameState(data);
    } catch (error) {
      alert('Not enough clicks!');
    }
  };

  const buyUpgrade = (type) => {
    handleUpgrade(type);
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
