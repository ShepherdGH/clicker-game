// App.jsx
import React, { useState, useEffect, useRef, useContext, createContext } from 'react';
// Assuming you have a 'services/api.js' that handles setting the JWT token for requests
import api from './services/api'; 
import './App.css';

// --- Auth Context Setup (Dummy for Demonstration) ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwtToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwtToken', token);
      api.setAuthToken(token); // Set token in API service
    } else {
      localStorage.removeItem('jwtToken');
      api.setAuthToken(null);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
// --- End Auth Context Setup ---


function GameComponent() {
  const { user, token, logout } = useContext(AuthContext);

  const [gameState, setGameState] = useState({
    clicks: 0,
    clickPower: 1,
    autoClickers: 0
  });
  const [loading, setLoading] = useState(true);
  // useRef is used to hold the last time the clicks were updated (for client-side income)
  const lastUpdateRef = useRef(Date.now()); 

  // 1. Initial Load (Load game data only once)
  const loadGameData = async () => {
    if (!token) return;
    try {
      const data = await api.getGameData(); // API call without userId in URL
      setGameState(data);
      lastUpdateRef.current = Date.now(); // Reset update time after load
      setLoading(false);
    } catch (error) {
      console.error('Error loading game data:', error);
      if (error.response?.status === 401) {
        logout(); // Logout on expired token
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGameData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  // 2. Client-side Auto-Click and Periodic Save Loop
  useEffect(() => {
    if (loading || !token) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeElapsed = (now - lastUpdateRef.current) / 1000; // time in seconds
      lastUpdateRef.current = now;

      // Apply auto-clicks for elapsed time
      setGameState(prev => {
        const income = prev.autoClickers * timeElapsed;
        if (income > 0) {
            // Use Math.max to prevent negative clicks if floating point math is weird
            return { ...prev, clicks: Math.max(0, prev.clicks + income) };
        }
        return prev;
      });

      // NOTE: We rely on the server's 60-second save interval for data persistence.
      // We removed the constant loadGameData() for better performance.

    }, 1000); // Tick and update clicks every second

    return () => clearInterval(interval);
  }, [loading, token]); // Rerun if loading state changes or token changes

  // --- Handlers ---

  const handleClick = async () => {
    // Optimistic update on client for immediate feedback
    setGameState(prev => ({ 
        ...prev, 
        clicks: prev.clicks + prev.clickPower 
    }));
    
    try {
      // Send click to server and refresh state (to check for server sync)
      const data = await api.click();
      setGameState(data);
    } catch (error) {
      console.error('Error clicking:', error);
      // Re-sync on failure
      loadGameData();
    }
  };

  const handleUpgrade = async (upgradeType) => {
    try {
      const data = await api.buyUpgrade(upgradeType);
      setGameState(data);
    } catch (error) {
      alert('Not enough clicks!');
      loadGameData(); // Re-sync in case client state was wrong
    }
  };

  const getUpgradeCost = (upgradeType) => {
    if (upgradeType === 'clickPower') {
      return gameState.clickPower * 10;
    } else if (upgradeType === 'autoClicker') {
      return (gameState.autoClickers + 1) * 50;
    }
    return 0;
  };

  if (!token) {
    // Replace with a proper Login/Register form in a real app
    return <AuthForm />;
  }

  if (loading) {
    return <div className="loading">Loading Game Data...</div>;
  }

  // Use Math.floor for display to keep it clean
  const displayClicks = Math.floor(gameState.clicks);

  return (
    <div className="App">
      <div className="header-bar">
        <span>Logged in as: **{user.username}**</span>
        <button onClick={logout} className="logout-button">Logout</button>
      </div>

      <h1>Clicker Game</h1>
      
      <div className="game-stats">
        <h2>Clicks: {displayClicks}</h2>
        <p>Click Power: **{gameState.clickPower}**</p>
        <p>Auto Clickers: **{Math.floor(gameState.autoClickers)}**</p>
        {gameState.autoClickers > 0 && (
          <p className="auto-income">Income: **+{gameState.autoClickers.toFixed(2)}** clicks/second (client-side)</p>
        )}
      </div>

      <button className="click-button" onClick={handleClick}>
        CLICK ME! (+{gameState.clickPower})
      </button>

      <div className="upgrades">
        <h3>Upgrades</h3>
        
        <div className="upgrade-card">
          <h4>Upgrade Click Power</h4>
          <p>Current: {gameState.clickPower}</p>
          <p>Cost: {getUpgradeCost('clickPower')} clicks</p>
          <button 
            onClick={() => handleUpgrade('clickPower')}
            disabled={displayClicks < getUpgradeCost('clickPower')}
          >
            Buy (+1 click power)
          </button>
        </div>

        <div className="upgrade-card">
          <h4>Buy Auto Clicker</h4>
          <p>Current: {Math.floor(gameState.autoClickers)}</p>
          <p>Cost: {getUpgradeCost('autoClicker')} clicks</p>
          <button 
            onClick={() => handleUpgrade('autoClicker')}
            disabled={displayClicks < getUpgradeCost('autoClicker')}
          >
            Buy (+1 click/second)
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Login/Register Form
const AuthForm = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      // NOTE: This assumes api.js has login/register methods
      const response = await api[endpoint](username, password);
      login(response.token, response.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">{isLogin ? 'Log In' : 'Sign Up'}</button>
      </form>
      <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
      </p>
    </div>
  );
};


function App() {
  // Wrap the main application in the AuthProvider
  return (
    <AuthProvider>
      <GameComponent />
    </AuthProvider>
  );
}

export default App;