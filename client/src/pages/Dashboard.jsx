import React, { useRef } from 'react';
import { useGame } from '../context/GameProvider';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { gameState, handleClick } = useGame();
  const { inventory = {}, tools = {}, area = {} } = gameState;

const getActiveAreaName = (resourceKey) => {
  const resourceArea = area[resourceKey];
  if (!resourceArea) return '无';
  const activeEntry = Object.entries(resourceArea).find(([key, value]) => value?.active);
  return activeEntry ? activeEntry[0] : '无';
};


  const renderResourceSection = (resourceKey, toolType) => {
    const tool = tools[toolType] || { click_level: 1, collector_level: 0 };
    const areaName = getActiveAreaName(resourceKey);
    const resourcePerSec = tool.collector_level * 1; // 暂时固定公式

    return (
      <div className="resource-section">
        <h3>{resourceKey}</h3>
        <p>当前区域: {areaName}</p>
        <p>工具等级: {tool.click_level}</p>
        <p>自动采集等级: {tool.collector_level}</p>
        <p>资源/秒: {resourcePerSec}</p>
        <button onClick={() => handleClick(resourceKey)}>手动采集 {resourceKey}</button>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="inventory-bar">
        {Object.entries(inventory).map(([item, count]) => (
          <div key={item} className="inventory-item">
            {item}: {count}
          </div>
        ))}
      </div>

      <div className="modules">
        {renderResourceSection('wood', 'axe')}
        {renderResourceSection('stone', 'pickaxe')}
      </div>
    </div>
  );
};

export default Dashboard;
