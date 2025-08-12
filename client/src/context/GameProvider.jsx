import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({ inventory: {}, tools: {}, area: {} });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setIsAuthenticated(true);
        api.setAuthToken(token); // Configure api to use the token
        loadGameData();
      } catch (e) {
        console.error('Invalid token', e);
        logout();
      }
    } else {
        // Handle non-authenticated state, maybe load anonymous data or do nothing
        setGameState({ inventory: {}, tools: {}, area: {} });
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    api.setAuthToken(null);
  };

  const loadGameData = async () => {
    try {
      const data = await api.getGameData();
      setGameState(data);
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  const handleClick = async (resourceType) => {
    try {
      const data = await api.click(resourceType);
      setGameState(data);
    } catch (error) {
      console.error('Error clicking:', error);
    }
  };

  const handleSell = async (resourceType, quantity) => {
    try {
      const data = await api.sell(resourceType, quantity);
      setGameState(data);
    } catch (error) {
      console.error('Error selling resource:', error);
    }
  };

  return (
    <GameContext.Provider value={{
      gameState,
      isAuthenticated,
      user,
      login,
      logout,
      handleClick,
      handleSell
    }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;
