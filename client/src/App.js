import React, { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

function App() {
  const [gameState, setGameState] = useState({
    clicks: 0,
    clickPower: 1,
    autoClickers: 0
  });
  const [loading, setLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    loadGameData();
  }, []);

  // Per Second Update
  useEffect(() => {
    const interval = setInterval(() => {
      loadGameData();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleClick = async () => {
    try {
      const data = await api.click();
      setGameState(data);
    } catch (error) {
      console.error('Error clicking:', error);
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

  const getUpgradeCost = (upgradeType) => {
    if (upgradeType === 'clickPower') {
      return gameState.clickPower * 10;
    } else if (upgradeType === 'autoClicker') {
      return (gameState.autoClickers + 1) * 50;
    }
    return 0;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Clicker Game</h1>
      
      <div className="game-stats">
        <h2>Clicks: {Math.floor(gameState.clicks)}</h2>
        <p>Click Power: {gameState.clickPower}</p>
        <p>Auto Clickers: {gameState.autoClickers}</p>
        {gameState.autoClickers > 0 && (
          <p className="auto-income">+{gameState.autoClickers} clicks/second</p>
        )}
      </div>

      <button className="click-button" onClick={handleClick}>
        CLICK ME!
      </button>

      <div className="upgrades">
        <h3>Upgrades</h3>
        
        <div className="upgrade-card">
          <h4>Upgrade Click Power</h4>
          <p>Current: {gameState.clickPower}</p>
          <p>Cost: {getUpgradeCost('clickPower')} clicks</p>
          <button 
            onClick={() => handleUpgrade('clickPower')}
            disabled={gameState.clicks < getUpgradeCost('clickPower')}
          >
            Buy (+1 click power)
          </button>
        </div>

        <div className="upgrade-card">
          <h4>Buy Auto Clicker</h4>
          <p>Current: {gameState.autoClickers}</p>
          <p>Cost: {getUpgradeCost('autoClicker')} clicks</p>
          <button 
            onClick={() => handleUpgrade('autoClicker')}
            disabled={gameState.clicks < getUpgradeCost('autoClicker')}
          >
            Buy (+1 click/second)
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;