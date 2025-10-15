// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { setup } = require('./database.js');
const authRoutes = require('./auth.js'); // Assuming auth.js file is present
const authMiddleware = require('./authMiddleware'); // Assuming authMiddleware.js is present

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // Use port 5000 as default

app.use(cors());
app.use(express.json());

// --- Simple Clicker Game Model ---
const getInitialGameData = () => ({
  clicks: 0,
  clickPower: 1,
  autoClickers: 0
});

function getUpgradeCost(gameData, upgradeType) {
  if (upgradeType === 'clickPower') {
    return gameData.clickPower * 10;
  } else if (upgradeType === 'autoClicker') {
    return (gameData.autoClickers + 1) * 50;
  }
  return Infinity;
}
// --- End Model ---


// In-memory cache for active players' game data
let activeGameData = {};

// Helper function to get a user's game data (from cache or DB)
async function getUserGameData(userId) {
  if (activeGameData[userId]) {
    return activeGameData[userId];
  }
  const db = await setup();
  const row = await db.get('SELECT gameData FROM user_game_data WHERE user_id = ?', userId);
  if (row) {
    const data = JSON.parse(row.gameData);
    activeGameData[userId] = data; // Cache it
    return data;
  }
  return null;
}

// --- Auth Routes (Public) ---
app.use('/api/auth', authRoutes);


// --- Protected Game Routes ---
const gameRouter = express.Router();
gameRouter.use(authMiddleware); // Apply authentication middleware

// GET /api/game - Get user's game state
gameRouter.get('/', async (req, res) => {
  const userId = req.user.id;
  let userGameData = await getUserGameData(userId);

  if (!userGameData) {
    // If no data, create and save initial data
    userGameData = getInitialGameData();
    const db = await setup();
    await db.run(
      'INSERT INTO user_game_data (user_id, gameData) VALUES (?, ?)',
      userId,
      JSON.stringify(userGameData)
    );
    activeGameData[userId] = userGameData;
  }
  
  // Calculate Offline Income
  const db = await setup();
  const row = await db.get('SELECT last_login FROM registered_users WHERE id = ?', userId);
  const lastLogin = row ? new Date(row.last_login).getTime() : Date.now();
  const timeOffline = (Date.now() - lastLogin) / 1000;
  
  // Only calculate offline income if they have auto-clickers and a significant time has passed
  if (userGameData.autoClickers > 0 && timeOffline > 5) {
      const offlineIncome = Math.floor(userGameData.autoClickers * timeOffline);
      userGameData.clicks += offlineIncome;
      console.log(`User ${userId} earned ${offlineIncome} clicks while offline.`);
  }

  // Update last login time
  await db.run('UPDATE registered_users SET last_login = ? WHERE id = ?', new Date().toISOString(), userId);

  res.json(userGameData);
});

// POST /api/game/click - Handle a resource click
gameRouter.post('/click', async (req, res) => {
  const userId = req.user.id;
  const userGameData = await getUserGameData(userId);

  if (!userGameData) {
    return res.status(404).json({ message: 'Game data not found.' });
  }
  
  // Apply the click
  userGameData.clicks += userGameData.clickPower;

  // The client will use the response, data will be saved by the minute interval
  res.json(userGameData);
});

// POST /api/game/upgrade - Handle a purchase of an upgrade
gameRouter.post('/upgrade', async (req, res) => {
    const userId = req.user.id;
    // Note: The client sends 'clickPower' or 'autoClicker' as upgradeType
    const { upgradeType } = req.body; 
    const userGameData = await getUserGameData(userId);

    if (!userGameData) {
        return res.status(404).json({ message: 'Game data not found.' });
    }

    const cost = getUpgradeCost(userGameData, upgradeType);

    if (userGameData.clicks < cost) {
        return res.status(400).json({ message: 'Not enough clicks.' });
    }

    userGameData.clicks -= cost;

    if (upgradeType === 'clickPower') {
        userGameData.clickPower += 1;
    } else if (upgradeType === 'autoClicker') {
        userGameData.autoClickers += 1;
    } else {
        return res.status(400).json({ message: 'Invalid upgrade type.' });
    }

    // The client will use the response, data will be saved by the minute interval
    res.json(userGameData);
});


app.use('/api/game', gameRouter);


// --- Server Startup ---
app.listen(PORT, async () => {
  const db = await setup();
  console.log(`Server running on port ${PORT}`);
  
  // Load all users' game data into the cache on startup
  const rows = await db.all('SELECT user_id, gameData FROM user_game_data');
  rows.forEach(row => {
    try {
        const parsedData = JSON.parse(row.gameData);
        // Ensure only simple clicker data is loaded
        if ('clicks' in parsedData && 'clickPower' in parsedData && 'autoClickers' in parsedData) {
            activeGameData[row.user_id] = parsedData;
        } else {
             activeGameData[row.user_id] = getInitialGameData();
        }
    } catch (e) {
         activeGameData[row.user_id] = getInitialGameData();
    }
  });
  console.log(`Loaded ${Object.keys(activeGameData).length} users' game data into cache.`);


  // Auto-collector and periodic save logic
  setInterval(async () => {
    const db = await setup();
    for (const userId in activeGameData) {
      const userGameData = activeGameData[userId];
      
      // Auto-clicker logic (Server-side safety net)
      userGameData.clicks += userGameData.autoClickers;

      // Periodic save to DB
      await db.run(
        'INSERT OR REPLACE INTO user_game_data (user_id, gameData) VALUES (?, ?)',
        userId,
        JSON.stringify(userGameData)
      );
    }
    if (Object.keys(activeGameData).length > 0) {
        console.log('Auto-collectors ran and all active data saved.');
    }
  }, 60000); // Every minute
});