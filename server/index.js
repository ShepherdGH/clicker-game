const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { setup } = require('./database.js');
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
let gameData = {};

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
              stone: 1,
              iron: 0,
              gold: 0,
            },
          },
          deepMine: {
            active: false,
            min_tool_level: 3,
            dropRates: {
              stone: 0.9,
              iron: 0.1,
              gold: 0,
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
  return res.json(gameData[userId]);
});
// upgrade logic
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

  return res.json(gameData[userId]);
});


// 静态价格表（以后可替换为数据库动态价格）
const RESOURCE_PRICES = {
  wood: 2,
  stone: 3,
  iron: 5,
  gold: 10
};
//sell logic
app.post('/api/game/:userId/sell', (req, res) => {
  const { userId } = req.params;
  const { resourceType, quantity } = req.body;

  // basic check
  if (!gameData[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!resourceType || !(resourceType in RESOURCE_PRICES)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }
  //get inventory
  const userInv = gameData[userId].inventory;
  if ((userInv[resourceType] || 0) < quantity) {
    return res.status(400).json({ error: 'Not enough resources' });
  }

  // sell and gain
  userInv[resourceType] -= quantity;

  const coinsEarned = quantity * RESOURCE_PRICES[resourceType];
  userInv.coins = (userInv.coins || 0) + coinsEarned;

  gameData[userId].lastSaved = new Date();

  return res.json(gameData[userId]);
});


// Auto Clicker Logic 
setInterval(() => {
  Object.keys(gameData).forEach(userId => {
    const user = gameData[userId];
    if (!user) return;

    // 遍历所有资源类型的区域
    Object.keys(user.area).forEach(resourceType => {
      const areaData = user.area[resourceType];
      const toolType = areaData.toolType;
      const tool = user.tools[toolType];

      if (!tool || tool.collector_level <= 0) return;

      // 找到当前激活的区域
      const activeAreaKey = Object.keys(areaData).find(areaName =>
        areaName !== "toolType" && areaData[areaName].active
      );
      if (!activeAreaKey) return;

      const activeArea = areaData[activeAreaKey];
      if (tool.click_level < activeArea.min_tool_level) return; // 工具等级不足

      // 模拟掉落（按 collector_level 采集）
      Object.entries(activeArea.dropRates).forEach(([item, rate]) => {
        if (Math.random() < rate) {
          user.inventory[item] = (user.inventory[item] || 0) + tool.collector_level;
        }
      });
    });
  });
}, 1000);


app.listen(PORT, async () => {
  const db = await setup();
  console.log(`Server running on port ${PORT}`);
  // Load data from the database on startup
  const users = await db.all('SELECT * FROM users');
  users.forEach(user => {
    gameData[user.id] = JSON.parse(user.gameData);
  });
  console.log('Data loaded from database.');

  // Periodically save data to the database
  setInterval(async () => {
    for (const userId in gameData) {
      await db.run(
        'INSERT OR REPLACE INTO users (id, gameData) VALUES (?, ?)',
        userId,
        JSON.stringify(gameData[userId])
      );
    }
    console.log('Data saved to database.');
  }, 60000); // Every minute
});
