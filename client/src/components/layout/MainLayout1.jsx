import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useGame } from '../../context/GameProvider'; // Import the context hook

const { Header, Sider, Content } = Layout;

const getItem = (label, key, icon, children) => ({ key, icon, label, children });

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer } } = theme.useToken();
  const { isAuthenticated, user, logout } = useGame(); // Get auth state

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  // Dynamically build menu items based on auth state
  const items = isAuthenticated ? [
    getItem('Dashboard', 'dashboard', <AppstoreOutlined />),
    getItem('Skills', 'skills', <BarChartOutlined />),
    getItem('Store', 'store', <UserOutlined />),
    getItem(user?.username, 'user-info', <UserOutlined />, [
        getItem('Logout', 'logout', <LogoutOutlined />)
    ]),
  ] : [
    getItem('Login', 'login', <LoginOutlined />),
    getItem('Register', 'register', <UserAddOutlined />),
  ];

  const titleMap = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/skills': 'Skills',
    '/store': 'Store',
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, color: 'white', textAlign: 'center' }}>
          LOGO
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          onClick={handleMenuClick}
          items={items}
        />
      </Sider>
      <Layout
        style={{
          width: collapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 200px)',
          transition: 'width 0.2s',
        }}
      >
        <Header style={{ padding: 0, background: colorBgContainer }}>
          {titleMap[location.pathname] || ''}
        </Header>
        <Content
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            padding: 24,
            background: colorBgContainer,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
