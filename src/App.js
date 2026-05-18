import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import Inicio from "./page/inicio";
import Convenios from "./page/convenios";
import Login from "./page/Login";
import Topbar from "./Components/Topbar";
import "./Styles/style.css";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [paginaActual, setPaginaActual] = useState("inicio");

  function handleLogin(user) {
    setUsuario(user);
    setPaginaActual("inicio");
  }

  function handleLogout() {
    setUsuario(null);
    setPaginaActual("inicio");
  }

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  function renderizarPagina() {
    switch (paginaActual) {
      case "convenios":
        return <Convenios usuario={usuario} />;
      case "inicio":
      default:
        return <Inicio />;
    }
  }

  return (
    <div className="layout">
      <Sidebar
        paginaActual={paginaActual}
        onNavegar={setPaginaActual}
        usuario={usuario}
      />
      <div className="columna">
        <Topbar usuario={usuario} onLogout={handleLogout} />
        <main className="contenido">
          {renderizarPagina()}
        </main>
      </div>
    </div>
  );
}
