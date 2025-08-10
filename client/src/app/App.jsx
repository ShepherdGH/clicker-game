import React from 'react';
import GameProvider from '../context/GameProvider';
import MainLayout from '../components/layout/MainLayout1';
import { RouterProvider } from 'react-router-dom';
import router from './router';

const App = () => {
  return (
    <GameProvider>
      {<RouterProvider router={router} />}
    </GameProvider>
  );
};

export default App;
