import React, { useState } from "react";
import {conveniosData} from "../data/convenios";
import Tableconvenios from  "../Components/Tableconvenios";
import { calcularSemaforo } from "../utils/semaforo";
//import style from "../Styles/style.css"


/* Opcion de filtro */

const TABS_AMBITO = [
  { id: "todos",           label: "Todos" },
  { id: "nacional",        label: "Nacionales" },
  { id: "internacional",   label: "Internacionales" },
];

const TABS_SEMAFORO = [
  { id: "todos",       label: "Todos",      color: "#4a90c4" },
  { id: "verde",       label: "Vigentes",   color: "#16a34a" },
  { id: "por-vencer",  label: "Por vencer", color: "#d97706" },
  { id: "rojo",        label: "Finalizados",   color: "#dc2626" },
];

/*Extraer años unicos */
const obtenerAñosUnicos = () => {
  const años = new Set();
  conveniosData.forEach((c) => {
    const año = new Date(c.inicio).getFullYear();
    años.add(año);
  });
  return Array.from(años).sort((a, b) => b - a);
};

const TABS_AÑOS = [
  { id: "todos", label: "Todos los años" },
  ...obtenerAñosUnicos().map((año) => ({
    id: año.toString(),
    label: año.toString(),
  })),
];

/*Extraer tipos unicos de convenios */
const obtenerTiposUnicos = () => {
  const tipos = new Set();
  conveniosData.forEach((c) => {
    if (c.tipo) {
      tipos.add(c.tipo);
    }
  });
  return Array.from(tipos).sort();
};

const TABS_TIPO = [
  { id: "todos", label: "Todos los tipos" },
  ...obtenerTiposUnicos().map((tipo) => ({
    id: tipo.toLowerCase().replace(/\s+/g, '-'),
    label: tipo,
  })),
];

/*SECCION PRINCIPAL - PRUEBA */

export default function Convenios() {
  const [filtroAmbito,    setFiltroAmbito]    = useState("todos");
  const [filtroSemaforo,  setFiltroSemaforo]  = useState("todos");
  const [filtroAño,       setFiltroAño]       = useState("todos");
  const [filtroTipo,      setFiltroTipo]      = useState("todos");
  const [busqueda,        setBusqueda]        = useState("");
  const conveniosFiltrados = conveniosData.filter((c) => {
    const ambitoNormalizado = c.ambito?.toLowerCase();
    const porAmbito =
      filtroAmbito === "todos" || ambitoNormalizado === filtroAmbito;
    const semaforoColor = calcularSemaforo(c.fin).color;
    const porSemaforo =
      filtroSemaforo === "todos" ||
      (filtroSemaforo === "por-vencer" && ["naranja", "amarillo"].includes(semaforoColor)) ||
      semaforoColor === filtroSemaforo;
    const porBusqueda =busqueda === "" || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.resolucion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const año = new Date(c.inicio).getFullYear();
    const porAño =
      filtroAño === "todos" || año.toString() === filtroAño;
    
    const tipoNormalizado = c.tipo?.toLowerCase().replace(/\s+/g, '-');
    const porTipo =
      filtroTipo === "todos" || tipoNormalizado === filtroTipo;
    
    return porAmbito && porSemaforo && porBusqueda && porAño && porTipo;
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
            Convenios con instituciones públicas y privadas, nacionales e internacionales, suscritos por el titular del pliego
          </p>

        </div>

      </div>


      {/* ─── Leyenda ─────────────────────────────────────────────── */}

      <div className="leyenda">

        <span className="leyenda-titulo">
          Semáforo:
        </span>

        {[
          { color: "#16a34a", label: "Vigente" },
          { color: "#d97706", label: "Por vencer (menos de un mes)" },
          { color: "#f59e0b", label: "Por vencer (menos de 2 meses)"}, //nuevo
          { color: "#dc2626", label: "Finalizados" },
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


      {/* ----- Filtros -------- */}

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


        {/* Filtro tipo de convenio */}

        <div className="filtro-select">

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="select-año"
          >
            {TABS_TIPO.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

        </div>


        {/* Filtro año */}

        <div className="filtro-select">

          <select
            value={filtroAño}
            onChange={(e) => setFiltroAño(e.target.value)}
            className="select-año"
          >
            {TABS_AÑOS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

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

        <Tableconvenios convenios={conveniosFiltrados} />

      </div>

    </div>

  );
}