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

// Routes
app.get('/api/game/:userId', (req, res) => {
    const { userId } = req.params;
    if (!gameData[userId]) {
        gameData[userId] = {
          money: 0,
          experience: 0,
          level: 1,
          clickPower: 1,
          autoClickers: 0,
          autoExperience: 0,
        }
    }
    res.json(gameData[userId]);
})

app.post('/api/game/:userId/click', (req, res) => {
  const { userId } = req.params;
  if (!gameData[userId]) {
    return res.status(404).json({ error: `User not found with userId: ${userId}` });
  }
  
  gameData[userId].money += gameData[userId].clickPower;
  gameData[userId].lastSaved = new Date();
  res.json(gameData[userId]);
});

app.post('/api/game/:userId/upgrade', (req, res) => {
  const { userId } = req.params;
  const { upgradeType } = req.body;
  
  if (!gameData[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Simple upgrade logic
  if (upgradeType === 'clickPower') {
    const cost = gameData[userId].clickPower * 10;
    if (gameData[userId].money >= cost) {
      gameData[userId].money -= cost;
      gameData[userId].clickPower += 1;
    } else {
      return res.status(400).json({ error: 'Not enough money' });
    }
  } else if (upgradeType === 'autoClicker') {
    const cost = (gameData[userId].autoClickers + 1) * 50;
    if (gameData[userId].money >= cost) {
      gameData[userId].money -= cost;
      gameData[userId].autoClickers += 1;
    } else {
      return res.status(400).json({ error: 'Not enough money' });
    }
  }
  
  gameData[userId].lastSaved = new Date();
  res.json(gameData[userId]);
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