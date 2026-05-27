import React from "react";
import logo from "../Image/undac_logo.png";
//import style from "../Styles/style.css"
//import { Link } from "react-router-dom"
import {FaHome} from "react-icons/fa"
import { FaBookOpen } from "react-icons/fa6";
import { TbBusFilled } from "react-icons/tb";
const navItems = [
  { id: "inicio", label: "Inicio", icon: <FaHome/> },
  { id: "convenios", label: "Convenios", icon: <FaBookOpen/> },
  { id: "movilidad", label: "Movilidad", icon: <TbBusFilled/> },
];

export default function Sidebar({ paginaActual, onNavegar }) {
  return (
    <aside className="sidebar">
      
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logo} alt="Logo de la universidad" ></img>
        </div>

        <span className="brand-name">UNDAC</span>
      </div>

      {/* Navegación */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const activo = paginaActual === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onNavegar(item.id)}
              className={`nav-item ${activo ? "nav-item-activo" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

    </aside>
  );
}
 
 

