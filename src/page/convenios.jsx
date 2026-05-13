import React, { useState } from "react";
import {conveniosData} from "../data/convenios";
import Tableconvenios from  "../Components/Tableconvenios";
import { calcularSemaforo } from "../utils/semaforo";
import style from "../Styles/style.css"

/*Opcion de filtro */

const TABS_AMBITO = [
  { id: "todos",           label: "Todos" },
  { id: "nacional",        label: "Nacionales" },
  { id: "internacional",   label: "Internacionales" },
];

const TABS_SEMAFORO = [
  { id: "todos",    label: "Todos",      color: "#4a90c4" },
  { id: "verde",    label: "Vigentes",   color: "#16a34a" },
  { id: "amarillo", label: "Por vencer", color: "#d97706" },
  { id: "rojo",     label: "Vencidos",   color: "#dc2626" },
];

/*COMPONENTE PRINCIPAL PRUEBA */

export default function Convenios() {
  const [filtroAmbito,    setFiltroAmbito]    = useState("todos");
  const [filtroSemaforo,  setFiltroSemaforo]  = useState("todos");
  const [busqueda,        setBusqueda]        = useState("");
  const conveniosFiltrados = conveniosData.filter((c) => {
    const porAmbito    = filtroAmbito   === "todos" || c.ambito === filtroAmbito;
    const porSemaforo  = filtroSemaforo === "todos" || calcularSemaforo(c.fin).color === filtroSemaforo;
    const porBusqueda  = busqueda === "" || c.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return porAmbito && porSemaforo && porBusqueda;
  });
  return (

    <div>

      {/* ─── Encabezado ───────────────────────────────────────────── */}

      <div className="header">

        <div>

          <h2 className="titulo">
            Gestión de Convenios
          </h2>

          <p className="subtitulo">
            Año 2019 — Universidad Nacional Daniel Alcides Carrión
          </p>

        </div>

      </div>


      {/* ─── Leyenda ─────────────────────────────────────────────── */}

      <div className="leyenda">

        <span className="leyenda-titulo">
          Semáforo:
        </span>

        {[
          { color: "#16a34a", label: "Vigente (más de 6 meses)" },
          { color: "#d97706", label: "Por vencer (menos de 6 meses)" },
          { color: "#dc2626", label: "Vencido" },
        ].map((l) => (

          <div
            key={l.label}
            className="leyenda-item"
          >

            <span
              className="leyenda-punto"
              style={{ background: l.color }}
            />

            {l.label}

          </div>

        ))}

      </div>


      {/* ─── Filtros ─────────────────────────────────────────────── */}

      <div className="filtros-row">

        {/* Filtro ámbito */}

        <div className="tab-group">

          {TABS_AMBITO.map((t) => (

            <button
              key={t.id}
              onClick={() => setFiltroAmbito(t.id)}
              className={
                filtroAmbito === t.id
                  ? "tab tab-activo"
                  : "tab"
              }
            >
              {t.label}
            </button>

          ))}

        </div>


        {/* Filtro semáforo */}

        <div className="tab-group">

          {TABS_SEMAFORO.map((t) => (

            <button
              key={t.id}
              onClick={() => setFiltroSemaforo(t.id)}
              className={
                filtroSemaforo === t.id
                  ? "tab tab-activo"
                  : "tab"
              }
              style={
                filtroSemaforo === t.id
                  ? {
                      background: t.color,
                      borderColor: t.color,
                    }
                  : {}
              }
            >
              {t.label}
            </button>

          ))}

        </div>


        {/* Buscador */}

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador"
        />


        {/* Contador */}

        <span className="contador">

          {conveniosFiltrados.length} registro(s)

        </span>

      </div>


      {/* ─── Tabla ───────────────────────────────────────────────── */}

      <div className="tabla-card">

        <div className="tabla-header">

          <span className="tabla-header-titulo">
            Convenios suscritos por el titular del pliego
          </span>

        </div>

        <Tableconvenios convenios={conveniosFiltrados} />

      </div>

    </div>

  );
}