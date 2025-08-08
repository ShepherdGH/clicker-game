import React from 'react';
import { useGame } from '../context/GameProvider';
import '../styles/Store.css';

const Store = () => {
  const { gameState, getUpgradeCost, buyUpgrade } = useGame();
  const { tools = {} } = gameState;

  return (
    <div className="store-container">
      <h1 className="store-title">Store</h1>

      {/* Upgrade Section */}
      <section className="store-section">
        <h2>Upgrade Tools</h2>
        <div className="tool-list">
          {Object.entries(tools).map(([toolType, toolData]) => (
            <div key={toolType} className="tool-card">
              <h3>{toolType}</h3>
              <p>Click Level: <strong>{toolData.click_level}</strong></p>
              <p>Auto Level: <strong>{toolData.auto_level}</strong></p>

              <div className="upgrade-buttons">
                <button
                  onClick={() => buyUpgrade(toolType, 'clickPower')}
                >
                  Upgrade Click Power ({getUpgradeCost(toolType, 'clickPower')})
                </button>

                <button
                  onClick={() => buyUpgrade(toolType, 'autoCollector')}
                >
                  Upgrade Auto Collector ({getUpgradeCost(toolType, 'autoCollector')})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buy Section */}
      <section className="store-section">
        <h2>Buy Items</h2>
        <div className="buy-list">
          <p>Coming soon...</p>
        </div>
      </section>
    </div>
  );
};

export default Store;
