import React, { useState } from "react";
import logo from "../Image/undac_logo.png";

const USUARIOS = [
  { usuario: "admin", password: "admin123", rol: "admin", nombre: "Administrador" },
];

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function handleLogin() {
    setError("");
    setCargando(true);
    setTimeout(() => {
      const encontrado = USUARIOS.find(
        (u) => u.usuario === usuario.trim() && u.password === password
      );
      if (encontrado) {
        onLogin(encontrado);
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
      setCargando(false);
    }, 500);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="UNDAC Logo" className="login-logo" />
          <h1 className="login-titulo">UNDAC</h1>
          <p className="login-subtitulo">Sistema de Gestión de Convenios</p>
        </div>

        <div className="login-form">
          <div className="login-campo">
            <label className="login-label">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyDown={handleKeyDown}
              className="login-input"
              placeholder="Ingrese su usuario"
              autoFocus
            />
          </div>

          <div className="login-campo">
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="login-input"
              placeholder="Ingrese su contraseña"
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={cargando}
            className="login-btn"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </div>

        <div className="login-hints">
          <p className="login-hint-titulo">Credenciales de acceso:</p>
          <div className="login-hint-item">
            <span className="login-hint-rol admin-badge">Admin</span>
            <span className="login-hint-cred">admin / admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
