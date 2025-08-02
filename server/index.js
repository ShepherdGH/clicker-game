const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv'); 
dotenv.config();

const app = express();
const PORT = 5000;
if(process.env.PORT){
    PORT = process.env.PORT;
}

// Data Storage
const gameData = {};

// Routes
app.get('/api/game/:userId', (req, res) => {
    const { userId } = req.params.userId;
    if (!gameData[userId]) {
        gameData[userId] = {
            clicks: 0,
            clickPower: 1,
            autoClickers: 0,
            lastSaved: new Date()
        };
    }
    res.json(gameData[userId]);
})

app.post('/api/game/:userId/click', (req, res) => {
  const { userId } = req.params.userId;
  if (!gameData[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  gameData[userId].clicks += gameData[userId].clickPower;
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
    if (gameData[userId].clicks >= cost) {
      gameData[userId].clicks -= cost;
      gameData[userId].clickPower += 1;
    } else {
      return res.status(400).json({ error: 'Not enough clicks' });
    }
  } else if (upgradeType === 'autoClicker') {
    const cost = (gameData[userId].autoClickers + 1) * 50;
    if (gameData[userId].clicks >= cost) {
      gameData[userId].clicks -= cost;
      gameData[userId].autoClickers += 1;
    } else {
      return res.status(400).json({ error: 'Not enough clicks' });
    }
  }
  
  gameData[userId].lastSaved = new Date();
  res.json(gameData[userId]);
});