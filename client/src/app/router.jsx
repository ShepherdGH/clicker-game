import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout1';
import Dashboard from '../pages/Dashboard';
import Skills from '../pages/Skills';
import Blank from '../pages/Blank';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <div>❌ Router error</div>,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'skills', element: <Skills /> },
      { path: 'profile', element: <Blank /> }, // 可以先用 Blank 占位
    ],
  },
]);

export default router;