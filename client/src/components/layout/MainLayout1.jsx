// src/components/layout/MainLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const getItem = (label, key, icon) => ({ key, icon, label });
const items = [
  getItem('Dashboard', 'dashboard', <AppstoreOutlined />),
  getItem('Skills', 'skills', <BarChartOutlined />),
  getItem('Profile', 'profile', <UserOutlined />),
];
const titleMap = {
  '/':'Dashboard',
  '/dashboard': 'Dashboard',
  '/skills': 'Skills',
  '/profile': 'Profile',
};

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const handleMenuClick = ({ key }) => {
    navigate(key); 
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
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

      {/* Main Content */}
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
            height: 'calc(100vh - 64px)', // 100vh - Header 高度
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
