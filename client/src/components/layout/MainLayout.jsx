// src/components/layout/MainLayout.jsx
import React from 'react';
import '../../styles/layout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">LOGO</div>
        <ul className="menu">
          <li>Dashboard</li>
          <li>Skills</li>
          <li>Profile</li>
        </ul>
      </aside>

      <div className="main">
        <header className="header">Header</header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
