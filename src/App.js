//import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, { useState } from "react";
import Sidebar from "./Components/Sidebar";
import Inicio from "./page/inicio";
import Convenios from "./page/convenios";
import Style from "./Styles/style.css";
import Topbar from "./Components/Topbar";

export default function App() {

  // Estado actual
  const [paginaActual, setPaginaActual] = useState("inicio");

  // Renderizar páginas
  function renderizarPagina() {
    switch (paginaActual) {
      case "convenios":
        return <Convenios />
      case "inicio":
      default:
        return <Inicio />;
    }
  }

  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar
        paginaActual={paginaActual}
        onNavegar={setPaginaActual}
      />

      {/* Parte derecha */}
      <div className="columna">

        <Topbar />

        <main className="contenido">
          {renderizarPagina()}
        </main>

      </div>

    </div>
  );
}