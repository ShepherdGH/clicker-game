// src/context/GameProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    money: 0,
    experience: 0,
    level: 1,
    clickPower: 1,
    autoMoney: 0,
    autoExperience: 0,
  });
  //自动增长
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        money: prev.money + prev.autoMoney,
        experience: prev.experience + prev.autoExperience,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  //点击逻辑
  const handleClick = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + prev.clickPower,
      experience: prev.experience + prev.clickPower * 0.5,
    }));
  };
  const getUpgradeCost = (type) => {
    switch (type) {
      case 'clickPower':
        return gameState.clickPower * 10;
      case 'autoMoney':
        return (gameState.autoMoney + 1) * 50;
      case 'autoExperience':
        return (gameState.autoExperience + 1) * 75;
      default:
        return 0;
    }
  };
  const buyUpgrade = (type) => {
    const cost = getUpgradeCost(type);
    if (gameState.money < cost) return false;

    setGameState(prev => {
      switch (type) {
        case 'clickPower':
          return {
            ...prev,
            money: prev.money - cost,
            clickPower: prev.clickPower + 1,
          };
        case 'autoMoney':
          return {
            ...prev,
            money: prev.money - cost,
            autoMoney: prev.autoMoney + 1,
          };
        case 'autoExperience':
          return {
            ...prev,
            money: prev.money - cost,
            autoExperience: prev.autoExperience + 1,
          };
        default:
          return prev;
      }
    });

    return true;
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
