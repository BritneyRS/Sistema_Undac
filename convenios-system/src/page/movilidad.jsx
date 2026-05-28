import React, { useState, useEffect, useCallback } from "react";
import TableMovilidades from "../Components/TableMovilidades";
import ModalMovilidad from "../Components/ModalMovilidad";
import { exportar } from "../utils/exportar";
import { movilidadesAPI } from "../utils/api";

import {
  FaPlus,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";

const obtenerSemestresUnicos = (datos) => {
  const semestres = new Set();

  datos.forEach((m) => {
    if (m.semestre) {
      semestres.add(m.semestre);
    }
  });

  return Array.from(semestres).sort().reverse();
};

const obtenerEscuelasUnicas = (datos) => {
  const escuelas = new Set();

  datos.forEach((m) => {
    if (m.escuela) {
      escuelas.add(m.escuela);
    }
  });

  return Array.from(escuelas).sort();
};

export default function Movilidades({ usuario }) {

  const esAdmin = usuario?.rol === "admin";

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroSemestre, setFiltroSemestre] =
    useState("todos");

  const [filtroEscuela, setFiltroEscuela] =
    useState("todos");

  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] =
    useState(false);

  const [movilidadEditar, setMovilidadEditar] =
    useState(null);

  const [confirmarElim, setConfirmarElim] =
    useState(null);

  const [toast, setToast] = useState(null);

  // ─── Cargar datos ───────────────────────────────
  const cargarDatos = useCallback(async () => {

  setCargando(true);
  setError(null);

  try {

    const filas = await movilidadesAPI.listar();

    console.log("DATOS:", filas);

    setDatos(filas);

  } catch (err) {

    console.error("ERROR:", err);

    setError(
      err.message ||
      "No se pudo conectar con el servidor."
    );

  } finally {

    setCargando(false);

  }

  }, []);
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);
  // ─── Toast ──────────────────────────────────────
  function mostrarToast(msg, tipo = "ok") {

    setToast({ msg, tipo });

    setTimeout(() => {

      setToast(null);

    }, 3000);
  }

  // ─── Filtros dinámicos ──────────────────────────
  const TABS_SEMESTRE = [
    {
      id: "todos",
      label: "Todos los semestres",
    },

    ...obtenerSemestresUnicos(datos).map((s) => ({
      id: s,
      label: s,
    })),
  ];

  const TABS_ESCUELA = [
    {
      id: "todos",
      label: "Todas las escuelas",
    },

    ...obtenerEscuelasUnicas(datos).map((e) => ({
      id: e,
      label: e,
    })),
  ];

  // ─── Filtrado ──────────────────────────────────
  const movilidadesFiltradas = datos.filter((m) => {

    const porBusqueda =
      busqueda === "" ||

      m.nombres
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||

      m.universidadOrigen
        ?.toLowerCase()
        .includes(busqueda.toLowerCase()) ||

      m.universidadDestino
        ?.toLowerCase()
        .includes(busqueda.toLowerCase());

    const porSemestre =
      filtroSemestre === "todos" ||
      m.semestre === filtroSemestre;

    const porEscuela =
      filtroEscuela === "todos" ||
      m.escuela === filtroEscuela;

    return (
      porBusqueda &&
      porSemestre &&
      porEscuela
    );

  });

  // ─── CRUD ──────────────────────────────────────
  function abrirNuevo() {

    setMovilidadEditar(null);

    setModalAbierto(true);
  }

  function abrirEditar(movilidad) {

    setMovilidadEditar(movilidad);

    setModalAbierto(true);
  }

  function cerrarModal() {

    setModalAbierto(false);

    setMovilidadEditar(null);
  }

  async function guardarMovilidad(form) {

    try {

      if (movilidadEditar) {

        await movilidadesAPI.actualizar(
          movilidadEditar.id,
          form
        );

        mostrarToast(
          "Movilidad actualizada correctamente."
        );

      } else {

        await movilidadesAPI.crear(form);

        mostrarToast(
          "Movilidad creada correctamente."
        );
      }

      cerrarModal();

      cargarDatos();

    } catch (err) {

      mostrarToast(
        err.message || "Error al guardar.",
        "warn"
      );
    }
  }

  async function confirmarEliminar() {

    try {

      await movilidadesAPI.eliminar(confirmarElim);

      mostrarToast("Movilidad eliminada.");

      setConfirmarElim(null);

      cargarDatos();

    } catch (err) {

      mostrarToast(
        err.message || "Error al eliminar.",
        "warn"
      );
    }
  }

  return (
    <div>

      {/* Encabezado */}
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >

        <div>

          <h2 className="titulo">
            Movilidad Estuadiantil
          </h2>

          <p className="subtitulo">
            Estudiantes de pregrado por facultad y escuela que realizan movilidad estudiantil academica en universidades nacionales o extranjeras
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >

          {esAdmin && (
            <button
              className="btn-nuevo"
              onClick={abrirNuevo}
            >

              <FaPlus
                style={{ marginRight: 6 }}
              />

              Nueva movilidad

            </button>
          )}

          <button
            className="btn-export btn-export-excel"
            onClick={() =>
              exportar(
                movilidadesFiltradas,
                "excel"
              )
            }
          >

            <FaFileExcel
              style={{ marginRight: 6 }}
            />

            Excel

          </button>

          <button
            className="btn-export btn-export-pdf"
            onClick={() =>
              exportar(
                movilidadesFiltradas,
                "pdf"
              )
            }
          >

            <FaFilePdf
              style={{ marginRight: 6 }}
            />

            PDF

          </button>

        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-row">

        {/* Filtro semestre */}
        <div className="filtro-select">

          <select
            value={filtroSemestre}
            onChange={(e) =>
              setFiltroSemestre(e.target.value)
            }
            className="select-año"
          >

            {TABS_SEMESTRE.map((t) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.label}
              </option>
            ))}

          </select>

        </div>

        {/* Filtro escuela */}
        <div className="filtro-select">

          <select
            value={filtroEscuela}
            onChange={(e) =>
              setFiltroEscuela(e.target.value)
            }
            className="select-año"
          >

            {TABS_ESCUELA.map((t) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.label}
              </option>
            ))}

          </select>

        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar estudiante o universidad..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          className="buscador"
        />

        <span className="contador">
          {movilidadesFiltradas.length}
          {" "}registro(s)
        </span>

      </div>

      {/* Estado */}
      {cargando && (
        <p
          style={{
            textAlign: "center",
            color: "#6b7280",
            padding: 32,
          }}
        >
          Cargando movilidades...
        </p>
      )}

      {error && (
        <p
          style={{
            textAlign: "center",
            color: "#dc2626",
            padding: 32,
          }}
        >
          {error}
        </p>
      )}

      {/* Tabla */}
      {!cargando && !error && (

        <div className="tabla-card">

          <TableMovilidades
            movilidades={movilidadesFiltradas}
            esAdmin={esAdmin}
            onEditar={abrirEditar}
            onEliminar={(id) =>
              setConfirmarElim(id)
            }
          />

        </div>

      )}

      {/* Modal CRUD */}
      {modalAbierto && (

        <ModalMovilidad
          movilidad={movilidadEditar}
          onGuardar={guardarMovilidad}
          onCerrar={cerrarModal}
        />

      )}

      {/* Modal eliminar */}
      {confirmarElim !== null && (

        <div className="modal-bg">

          <div
            className="modal-caja"
            style={{ maxWidth: 380 }}
          >

            <p className="modal-titulo">
              ¿Eliminar movilidad?
            </p>

            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginBottom: 16,
              }}
            >
              Esta acción no se puede deshacer.
            </p>

            <div className="modal-btns">

              <button
                className="btn-cancelar"
                onClick={() =>
                  setConfirmarElim(null)
                }
              >
                Cancelar
              </button>

              <button
                className="btn-eliminar"
                onClick={confirmarEliminar}
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>

      )}

      {/* Toast */}
      {toast && (
        <div
          className={
            "toast toast-" + toast.tipo
          }
        >
          {toast.msg}
        </div>
      )}

    </div>
  );
}