import React, { useState } from "react";
import style from "../Styles/style.css";
import TableConvenios from "../Components/Tableconvenios";
import { conveniosData } from "../data/convenios";
import { calcularSemaforo } from "../utils/semaforo";


const TABS_AMBITO = [
  { id: "todos", label: "Todos" },
  { id: "nacional", label: "Nacionales" },
  { id: "internacional", label: "Internacionales" },
];

const TABS_SEMAFORO = [
  { id: "todos", label: "Todos", color: "#374151" },
  { id: "verde", label: "Vigentes", color: "#16a34a" },
  { id: "amarillo", label: "Por vencer", color: "#d97706" },
  { id: "rojo", label: "Vencidos", color: "#dc2626" },
];

export default function Convenios() {

  const [filtroAmbito, setFiltroAmbito] = useState("todos");
  const [filtroSemaforo, setFiltroSemaforo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const conveniosFiltrados = conveniosData.filter((c) => {

    const porAmbito =
      filtroAmbito === "todos" ||
      c.ambito === filtroAmbito;

    const porSemaforo =
      filtroSemaforo === "todos" ||
      calcularSemaforo(c.fin).color === filtroSemaforo;

    const porBusqueda =
      busqueda === "" ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase());

    return porAmbito && porSemaforo && porBusqueda;
  });

  return (
    <div className="convenios-contenedor">

      {/* Header */}
      <div className="convenios-header">

        <div>

          <h2 className="convenios-titulo">
            Gestión de Convenios
          </h2>

          <p className="convenios-subtitulo">
            Año 2019 — Universidad Nacional Daniel Alcides Carrión
          </p>

        </div>

      </div>

      {/* Leyenda */}
      <div className="leyenda">

        <span className="leyenda-titulo">
          Semáforo:
        </span>

        {[
          {
            color: "#16a34a",
            label: "Vigente (más de 6 meses)",
          },

          {
            color: "#d97706",
            label: "Por vencer (menos de 6 meses)",
          },

          {
            color: "#dc2626",
            label: "Vencido",
          },
        ].map((l) => (

          <div
            key={l.label}
            className="leyenda-item"
          >

            <span
              className="leyenda-punto"
              style={{ background: l.color }}
            />

            <span>{l.label}</span>

          </div>

        ))}

      </div>

      {/* Filtros */}
      <div className="filtros-row">

        {/* Tabs ámbito */}
        <div className="tab-group">

          {TABS_AMBITO.map((t) => (

            <button
              key={t.id}
              onClick={() => setFiltroAmbito(t.id)}
              className={`tab ${
                filtroAmbito === t.id ? "tab-activo" : ""
              }`}
            >
              {t.label}
            </button>

          ))}

        </div>

        {/* Tabs semáforo */}
        <div className="tab-group">

          {TABS_SEMAFORO.map((t) => (

            <button
              key={t.id}
              onClick={() => setFiltroSemaforo(t.id)}
              className={`tab ${
                filtroSemaforo === t.id ? "tab-activo" : ""
              }`}
              style={
                filtroSemaforo === t.id
                  ? { background: t.color }
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
          placeholder="Buscar convenio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador"
        />

      </div>

      {/* Tabla */}
      <div className="tabla-card">

        <div className="tabla-header">

          <span className="tabla-header-titulo">
            Convenios suscritos
          </span>

          <span className="tabla-header-count">
            {conveniosFiltrados.length} registro(s)
          </span>

        </div>

        <TableConvenios convenios={conveniosFiltrados} />

      </div>

    </div>
  );
}