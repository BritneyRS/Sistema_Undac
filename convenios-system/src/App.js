import React, { useState, useEffect } from "react";
import Sidebar  from "./Components/Sidebar";
import Inicio   from "./page/inicio";
import Convenios from "./page/convenios";
import Login    from "./page/Login";
import Topbar   from "./Components/Topbar";
import { authAPI } from "./utils/api";
import "./Styles/style.css";

export default function App() {
  const [usuario,      setUsuario]      = useState(null);
  const [paginaActual, setPaginaActual] = useState("inicio");
  const [verificando,  setVerificando]  = useState(true); // muestra loader al inicio

  // Al cargar la app, verificar si ya hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI.me()
        .then((data) => setUsuario(data.usuario))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setVerificando(false));
    } else {
      setVerificando(false);
    }
  }, []);

  function handleLogin(user) {
    setUsuario(user);
    setPaginaActual("inicio");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUsuario(null);
    setPaginaActual("inicio");
  }

  if (verificando) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <p style={{ color: "#6b7280", fontSize: 16 }}>Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Login onLogin={handleLogin} />;
  }

  function renderizarPagina() {
    switch (paginaActual) {
      case "convenios": return <Convenios usuario={usuario} />;
      case "inicio":
      default:          return <Inicio />;
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