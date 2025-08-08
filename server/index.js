const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
dotenv.config();

const app = express();
const PORT = 5000;
if(process.env.PORT){
    PORT = process.env.PORT;
}

// Defining Upgrade Cost Variables 
const clickUpgradeCost = 10;
const autoClickerUpgradeCost = 50;

app.use(cors());
app.use(express.json());

// Data Storage
const gameData = {};

// new user initialization
function initializeUserData(userId) {
  if (!gameData[userId]) {
    gameData[userId] = {
      inventory: {
        wood: 0,
        stone: 0,
        iron: 0,
        gold: 0,
        coins: 0,
      },
      tools: {
        axe: {
          click_level: 1,
          collector_level: 0,
        },
        pickaxe: {
          click_level: 1,
          collector_level: 0,
        },
      },
      area: {
        wood: {
          toolType: "axe",
          forest: {
            active: true,
            min_tool_level: 1,
            dropRates: {
              wood: 1.0,
            },
          },
          ancientForest: {
            active: false,
            min_tool_level: 2,
            dropRates: {
              wood: 0.9,
              rareWood: 0.1,
            },
          },
        },
        stone: {
          toolType: "pickaxe",
          mine: {
            active: true,
            min_tool_level: 1,
            dropRates: {
              stone: 0.7,
              iron: 0.2,
              gold: 0.1,
            },
          },
          deepMine: {
            active: false,
            min_tool_level: 3,
            dropRates: {
              stone: 0.4,
              iron: 0.3,
              gold: 0.3,
            },
          },
        },
      },
    };
  }
}

// Routes
app.get('/api/game/:userId', (req, res) => {
    const { userId } = req.params;
    initializeUserData(userId)
    res.json(gameData[userId]);
})
//handleClick function
app.post('/api/game/:userId/click', (req, res) => {
  const { userId } = req.params;
  const { resourceType} = req.body; 

  // check input and userId 
  if (!resourceType) {
    return res.status(400).json({ error: "Missing resourceType" });
  }
  if (!gameData[userId]) {
    return res.status(404).json({ error: `User not found with userId: ${userId}` });
  }

  // find current active area with destined ressourceType
  const activeAreaKey = Object.keys(gameData[userId].area[resourceType])
    .find(areaName => 
      areaName !== "toolType" && // skip toolType
      gameData[userId].area[resourceType][areaName].active
    );

  if (!activeAreaKey) {
    return res.status(400).json({ error: "No active area found" });
  }

  const activeArea = gameData[userId].area[resourceType][activeAreaKey];

  //get the tool
  const toolKey = gameData[userId].area[resourceType].toolType;
  const tool = gameData[userId].tools[toolKey];

  if (!tool) {
    return res.status(400).json({ error: `Tool not found for ${toolKey}` });
  }

  // check tool level
  if (tool.click_level < activeArea.min_tool_level) {
    return res.status(403).json({ error: "Tool level too low for this area" });
  }

  // simulate drop
  const drops = {};
  Object.entries(activeArea.dropRates).forEach(([item, rate]) => {
    if (Math.random() < rate) {
      drops[item] = (drops[item] || 0) + tool.click_level;
    }
  });

  // update inventory
  Object.entries(drops).forEach(([item, qty]) => {
    gameData[userId].inventory[item] = (gameData[userId].inventory[item] || 0) + qty;
  });

  gameData[userId].lastSaved = new Date();


  // return info 
  return res.json({
    message: "Resource collected",
    area: activeAreaKey,
    drops,
    inventory: gameData[userId].inventory
  });
});

app.post('/api/game/:userId/upgrade', (req, res) => {
  const { userId } = req.params;
  const { toolType, upgradeType } = req.body;

  if (!gameData[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!toolType || !gameData[userId].tools[toolType]) {
    return res.status(400).json({ error: 'Invalid toolType' });
  }
  if (!['clickPower', 'autoCollector'].includes(upgradeType)) {
    return res.status(400).json({ error: 'Invalid upgradeType' });
  }

  const tool = gameData[userId].tools[toolType];
  let currentLevel, newLevel, upgradeCost;

  if (upgradeType === 'clickPower') {
    currentLevel = tool.click_level;
    upgradeCost = currentLevel * 10; // upgrade cost, replace with function in future
    if (gameData[userId].inventory.coins < upgradeCost) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    gameData[userId].inventory.coins -= upgradeCost;
    tool.click_level += 1;
    newLevel = tool.click_level;
  } 
  
  else if (upgradeType === 'autoCollector') {
    currentLevel = tool.collector_level;
    upgradeCost = (currentLevel + 1) * 50; // upgrade cost, replace with function in future
    if (gameData[userId].inventory.coins < upgradeCost) {
      return res.status(400).json({ error: 'Not enough coins' });
    }
    gameData[userId].inventory.coins -= upgradeCost;
    tool.collector_level += 1;
    newLevel = tool.collector_level;
  }

  gameData[userId].lastSaved = new Date();

  res.json({
    message: `${toolType} ${upgradeType} upgraded to level ${newLevel}`,
    tool,
    inventory: gameData[userId].inventory
  });
});


// Auto Clicker Logic 
setInterval(() => {
  Object.keys(gameData).forEach(userId => {
    if (gameData[userId].autoClickers > 0) {
      gameData[userId].money += gameData[userId].autoClickers;
    }
  });
}, 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});