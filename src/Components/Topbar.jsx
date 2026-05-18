import React, { useState } from "react";
import { FaGripLines, FaSignOutAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export default function Topbar({ usuario, onLogout }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const inicial = usuario?.nombre?.[0]?.toUpperCase() || "U";
  const esAdmin = usuario?.rol === "admin";

  return (
    <header className="topbar">
      <span className="topbar-titulo">
        <FaGripLines />  SISTEMA DE CONVENIOS
      </span>

      <div style={{ position: "relative" }}>
        <div
          className="topbar-usuario"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <div className="topbar-avatar" style={{ background: esAdmin ? "#4a90c4" : "#16a34a" }}>
            {inicial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span className="topbar-nombre">{usuario?.nombre}</span>
            <span style={{ fontSize: 10, color: esAdmin ? "#4a90c4" : "#16a34a", fontWeight: 600 }}>
              {esAdmin ? "Administrador" : "Convenios"}
            </span>
          </div>
          <IoMdArrowDropdown />
        </div>

        {menuAbierto && (
          <div className="topbar-dropdown">
            <button className="topbar-dropdown-item" onClick={() => { setMenuAbierto(false); onLogout(); }}>
              <FaSignOutAlt style={{ marginRight: 6 }} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
