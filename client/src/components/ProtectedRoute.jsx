import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useGame } from '../context/GameProvider';

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useGame();

  // A simple check to see if we are in the process of authenticating.
  // This prevents a flicker of the login page while the token is being checked on app load.
  const isAuthenticating = !user && localStorage.getItem('token');

  if (isAuthenticating) {
    // You can replace this with a more sophisticated loading spinner
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect them to the login page.
    // The `replace` prop ensures the user can't press the back button to return to the protected route.
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the nested content (e.g., the MainLayout).
  return <Outlet />;
};

export default ProtectedRoute;
