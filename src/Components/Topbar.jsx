// src/components/Topbar.jsx
import React from 'react';
import './Topbar.css';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" title="Menú">☰</button>
        <span className="topbar-title">SISTEMA</span>
      </div>
      <div className="topbar-right">
        <div className="user-avatar">A</div>
        <span className="user-name">Administrador</span>
        <span className="user-chevron">▾</span>
      </div>
    </header>
  );
}