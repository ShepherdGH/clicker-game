const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { setup } = require('./database.js');
const authRoutes = require('./auth.js');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes are public
app.use('/api/auth', authRoutes);

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

// Helper function to create initial data for a new registered user
function getInitialGameData() {
  return {
    inventory: { wood: 0, stone: 0, iron: 0, gold: 0, coins: 0 },
    tools: {
      axe: { click_level: 1, collector_level: 0 },
      pickaxe: { click_level: 1, collector_level: 0 },
    },
    // ... (rest of the initial game state)
  };
}

// --- Protected Game Routes ---
const gameRouter = express.Router();
gameRouter.use(authMiddleware); // Apply middleware to all game routes

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

  res.json(userGameData);
});

// POST /api/game/click - Handle a resource click
gameRouter.post('/click', async (req, res) => {
  const userId = req.user.id;
  const { resourceType } = req.body;
  const userGameData = await getUserGameData(userId);

  if (!userGameData) {
    return res.status(404).json({ message: 'Game data not found.' });
  }
  
  // Simplified logic, you can expand this with your original detailed logic
  const tool = userGameData.tools.axe; // Example
  userGameData.inventory[resourceType] = (userGameData.inventory[resourceType] || 0) + tool.click_level;

  res.json(userGameData);
});

// POST /api/game/save - Explicitly save data
gameRouter.post('/save', async (req, res) => {
    const userId = req.user.id;
    const userGameData = await getUserGameData(userId);

    if (!userGameData) {
        return res.status(404).json({ message: 'Game data not found.' });
    }

    const db = await setup();
    await db.run(
        'INSERT OR REPLACE INTO user_game_data (user_id, gameData) VALUES (?, ?)',
        userId,
        JSON.stringify(userGameData)
    );

    res.json({ message: 'Game saved successfully!' });
});


app.use('/api/game', gameRouter);

// --- Server Startup ---
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const db = await setup();
  
  // Load all registered users' game data into the cache on startup
  const rows = await db.all('SELECT user_id, gameData FROM user_game_data');
  rows.forEach(row => {
    activeGameData[row.user_id] = JSON.parse(row.gameData);
  });
  console.log(`Loaded ${rows.length} users' game data into cache.`);

  // Auto-collector and periodic save logic
  setInterval(async () => {
    const db = await setup();
    for (const userId in activeGameData) {
      const userGameData = activeGameData[userId];
      // Auto-collector logic (example)
      if (userGameData.tools.axe.collector_level > 0) {
          userGameData.inventory.wood += userGameData.tools.axe.collector_level;
      }

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
