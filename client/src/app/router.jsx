import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout1';
import Dashboard from '../pages/Dashboard';
import Skills from '../pages/Skills';
import Store from '../pages/Store';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute'; // Import the ProtectedRoute

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    // All routes nested under this element are now protected
    element: <ProtectedRoute />,
    errorElement: <div>Router error</div>,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'skills', element: <Skills /> },
          { path: 'store', element: <Store /> },
        ],
      },
    ],
  },
]);

export default router;
