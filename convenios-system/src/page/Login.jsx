import React, { useState } from "react";
import logo from "../Image/undac_logo.png";
import { authAPI } from "../utils/api";

export default function Login({ onLogin }) {
  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleLogin() {
    setError("");
    if (!usuario.trim() || !password) {
      setError("Ingresa usuario y contraseña.");
      return;
    }
    setCargando(true);
    try {
      const data = await authAPI.login(usuario.trim(), password);
      // Guardar el token en localStorage
      localStorage.setItem("token", data.token);
      onLogin(data.usuario);
    } catch (err) {
      setError(err.message || "Usuario o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
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
      </div>
    </div>
  );
}
