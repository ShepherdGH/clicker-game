import React from 'react';
import { useGame } from '../context/GameProvider';
import '../styles/dashboard.css';

const Dashboard = () => {
  const {
    gameState,
    handleClick,
    buyUpgrade,
    getUpgradeCost,
  } = useGame();

  const {
    money,
    experience,
    clickPower,
    autoClickers,
    autoExperience,
  } = gameState;

  return (
    <div className="dashboard-container">
      <div className="stat-grid">
        <div className="upgrade-card">
          <h4>Money</h4>
          <p>{money.toFixed(0)}</p>
        </div>
        <div className="upgrade-card">
          <h4>Experience</h4>
          <p>{experience.toFixed(0)}</p>
        </div>
        <div className="upgrade-card">
          <h4>Click Power</h4>
          <p>{clickPower}</p>
        </div>
        <div className="upgrade-card">
          <h4>Auto Clicker</h4>
          <p>{autoClickers}</p>
        </div>
        <div className="upgrade-card">
          <h4>Auto Experience</h4>
          <p>{autoExperience}</p>
        </div>
      </div>

      <button className="main-click-button" onClick={handleClick}>
        Click to Gain
      </button>

      <div className="upgrade-grid">
        <div className="upgrade-card">
          <h4>Upgrade Click Power</h4>
          <p>Cost: {getUpgradeCost('clickPower')}</p>
          <button onClick={() => buyUpgrade('clickPower')}>Upgrade</button>
        </div>

        <div className="upgrade-card">
          <h4>Upgrade Auto Clickers</h4>
          <p>Cost: {getUpgradeCost('autoClicker')}</p>
          <button onClick={() => buyUpgrade('autoClicker')}>Upgrade</button>
        </div>

        <div className="upgrade-card">
          <h4>Upgrade Auto Experience</h4>
          <p>Cost: {getUpgradeCost('autoClicker')}</p>
          <button onClick={() => buyUpgrade('autoClicker')}>Upgrade</button>
        </div>


        
      </div>
    </div>
  );
};

export default Dashboard;
