import React, { useState } from 'react';
import { useGame } from '../context/GameProvider';
import '../styles/Store.css';

const RESOURCE_PRICES = {
  wood: 2,
  stone: 3,
  iron: 5,
  gold: 10
};

const Store = () => {
  const { gameState, getUpgradeCost, buyUpgrade, handleSell  } = useGame();
  const { tools = {}, inventory = {} } = gameState;

  const [sellQuantities, setSellQuantities] = useState({});
  //when input quantity change
  const onQuantityChange = (resource, value) => {
    setSellQuantities(prev => ({
      ...prev,
      [resource]: value
    }));
  };

  const onSellClick = (resource) => {
    const quantity = parseInt(sellQuantities[resource], 10) || 0;
    if (quantity <= 0) {
      alert('请输入有效的数量');
      return;
    }
    if (quantity > (inventory[resource] || 0)) {
      alert('库存不足');
      return;
    }
    handleSell(resource, quantity);
    setSellQuantities(prev => ({ ...prev, [resource]: '' })); 
  };

  return (
    <div className="store-container">
      <h1 className="store-title">Store</h1>

      {/* Inventory Section */}
      <section className="store-section">
        <h2>Your Inventory</h2>
        <div className="inventory-list">
          {Object.entries(inventory).map(([item, count]) => (
            <div key={item} className="inventory-item">
              {item}: {count}
            </div>
          ))}
        </div>
      </section>

      {/* Sell Section */}
      <section className="store-section">
        <h2>Sell Resources</h2>
        <div className="sell-list">
          {Object.entries(RESOURCE_PRICES).map(([resource, price]) => (
            <div key={resource} className="sell-item">
              <span>{resource} - {price} coins each</span>
              <input
                type="number"
                min="1"
                max={inventory[resource] || 0}
                value={sellQuantities[resource] || ''}
                onChange={(e) => onQuantityChange(resource, e.target.value)}
                placeholder="数量"
                style={{ width: '80px', marginLeft: '10px', marginRight: '10px' }}
              />
              <button onClick={() => onSellClick(resource)}>Sell</button>
            </div>
          ))}
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="store-section">
        <h2>Upgrade Tools</h2>
        <div className="tool-list">
          {Object.entries(tools).map(([toolType, toolData]) => (
            <div key={toolType} className="tool-card">
              <h3>{toolType}</h3>
              <p>Click Level: <strong>{toolData.click_level}</strong></p>
              <p>Auto Level: <strong>{toolData.collector_level}</strong></p>

              <div className="upgrade-buttons">
                <button onClick={() => buyUpgrade(toolType, 'clickPower')}>
                  Upgrade Click Power ({getUpgradeCost(toolType, 'clickPower')})
                </button>
                <button onClick={() => buyUpgrade(toolType, 'autoCollector')}>
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
