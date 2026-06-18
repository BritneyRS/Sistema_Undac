import React, { useState, useEffect, useCallback, useRef } from "react";
import TableMovilidades from "../Components/TableMovilidades";
import ModalMovilidad from "../Components/ModalMovilidad";
import { exportarMovilidad } from "../utils/exportar";
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

const obtenerPeriodosUnicos = (datos) => {
  const periodos = new Set();

  datos.forEach((m) => {
    if (m.periodo) {
      periodos.add(m.periodo);
    }
  });

  return Array.from(periodos).sort();
};

const obtenerCiudadesDestinoUnicas = (datos) => {
  const ciudades = new Set();

  datos.forEach((m) => {
    if (m.ciudaddestino) {
      ciudades.add(m.ciudaddestino);
    }
  });

  return Array.from(ciudades).sort();
};

const obtenerBecasUnicas = (datos) => {
  const becas = new Set();

  datos.forEach((m) => {
    if (m.beca) {
      becas.add(m.beca);
    }
  });

  return Array.from(becas).sort();
};

export default function Movilidades({ usuario }) {

  const esAdmin = usuario?.rol === "admin";

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroSemestre, setFiltroSemestre] =
    useState("todos");

  const [filtroPeriodo, setFiltroPeriodo] =
    useState(["todos"]);

  const [periodoDropdownAbierto, setPeriodoDropdownAbierto] =
    useState(false);

  const filtroPeriodoRef = useRef(null);

  const [filtroCiudadDestino, setFiltroCiudadDestino] =
    useState("todos");

  const [filtroBeca, setFiltroBeca] =
    useState("todos");

  const [filtroEscuela, setFiltroEscuela] =
    useState("todos");

  const [filtroEstado, setFiltroEstado] =
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

  useEffect(() => {
    const manejarClickFuera = (event) => {
      if (
        filtroPeriodoRef.current &&
        !filtroPeriodoRef.current.contains(event.target)
      ) {
        setPeriodoDropdownAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClickFuera);

    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, []);

  function obtenerLabelPeriodoSeleccionado() {
    if (filtroPeriodo.includes("todos") || filtroPeriodo.length === 0) {
      return "Todos los periodos";
    }

    return filtroPeriodo.join(", ");
  }

  function onCambioPeriodo(valor) {
    if (valor === "todos") {
      setFiltroPeriodo(["todos"]);
      return;
    }

    const seleccionActual = filtroPeriodo.includes("todos")
      ? []
      : [...filtroPeriodo];

    if (seleccionActual.includes(valor)) {
      const nuevaSeleccion = seleccionActual.filter(
        (item) => item !== valor
      );

      setFiltroPeriodo(
        nuevaSeleccion.length === 0 ? ["todos"] : nuevaSeleccion
      );
    } else {
      setFiltroPeriodo([...seleccionActual, valor]);
    }
  }

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

  const TABS_PERIODO = [
    {
      id: "todos",
      label: "Todos los periodos",
    },

    ...obtenerPeriodosUnicos(datos).map((p) => ({
      id: p,
      label: p,
    })),
  ];

  const TABS_CIUDAD_DESTINO = [
    {
      id: "todos",
      label: "Todas las ciudades destino",
    },

    ...obtenerCiudadesDestinoUnicas(datos).map((c) => ({
      id: c,
      label: c,
    })),
  ];

  const TABS_BECA = [
    {
      id: "todos",
      label: "Todas las becas",
    },

    ...obtenerBecasUnicas(datos).map((b) => ({
      id: b,
      label: b,
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
  const TABS_ESTADO = [
    {
      id: "todos",
      label: "Todos los estados",
    },
    ...["activo", "pendiente", "finalizado", "desistido"].map((e) => ({
      id: e,
      label: e,
    })),
  ];

  function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")                  // separa las tildes
    .replace(/[\u0300-\u036f]/g, "")   // elimina las tildes
    .toUpperCase()
    .replace(/,/g, "")
    .trim()
    .split(/\s+/)
    .sort()
    .join(" ");
}

  // ─── Filtrado ──────────────────────────────────
  const movilidadesFiltradas = datos.filter((m) => {

    const term = normalizarTexto(busqueda);
    const resolucion = normalizarTexto(m.numeroresolucion);


    const porBusqueda =
      busqueda === "" ||

      normalizarTexto(m.nombres)
      .includes(term)
      

      normalizarTexto(m.universidaddestino)
      .includes(term)

      resolucion.includes(term);
      

    const porSemestre =
      filtroSemestre === "todos" ||
      m.semestre === filtroSemestre;

    const porPeriodo =
      filtroPeriodo.includes("todos") ||
      filtroPeriodo.length === 0 ||
      filtroPeriodo.includes(m.periodo);

    const porCiudadDestino =
      filtroCiudadDestino === "todos" ||
      m.ciudaddestino === filtroCiudadDestino;

    const porBeca =
      filtroBeca === "todos" ||
      m.beca === filtroBeca;

    const porEscuela =
      filtroEscuela === "todos" ||
      m.escuela === filtroEscuela;

    const porEstado =
      filtroEstado === "todos" ||
      m.estado === filtroEstado;

    return (
      porBusqueda &&
      porSemestre &&
      porPeriodo &&
      porCiudadDestino &&
      porBeca &&
      porEscuela &&
      porEstado
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

  async function guardarMovilidad(form, archivo = null) {

    try {

      if (movilidadEditar) {

        await movilidadesAPI.actualizar(
          movilidadEditar.id,
          form,
          archivo
        );

        mostrarToast(
          "Movilidad actualizada correctamente."
        );

      } else {

        await movilidadesAPI.crear(form, archivo);

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
            Movilidad Estudiantil
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
              exportarMovilidad(
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
              exportarMovilidad(
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

        {/* Filtro periodo */}
        <div className="filtro-select" ref={filtroPeriodoRef}>

          <button
            type="button"
            className="select-año multi-select-trigger"
            onClick={() =>
              setPeriodoDropdownAbierto(!periodoDropdownAbierto)
            }
          >
            <span>{obtenerLabelPeriodoSeleccionado()}</span>
            <span className="multi-select-arrow">▾</span>
          </button>

          {periodoDropdownAbierto && (
            <div className="multi-select-menu">
              {TABS_PERIODO.map((t) => (
                <label
                  key={t.id}
                  className="multi-select-item"
                >
                  <input
                    type="checkbox"
                    value={t.id}
                    checked={
                      filtroPeriodo.includes(t.id) ||
                      (t.id === "todos" && filtroPeriodo.includes("todos"))
                    }
                    onChange={() => onCambioPeriodo(t.id)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          )}

        </div>

        {/* Filtro ciudad destino */}
        <div className="filtro-select">

          <select
            value={filtroCiudadDestino}
            onChange={(e) =>
              setFiltroCiudadDestino(e.target.value)
            }
            className="select-año"
          >

            {TABS_CIUDAD_DESTINO.map((t) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.label}
              </option>
            ))}

          </select>

        </div>

        {/* Filtro beca */}
        <div className="filtro-select">

          <select
            value={filtroBeca}
            onChange={(e) =>
              setFiltroBeca(e.target.value)
            }
            className="select-año"
          >

            {TABS_BECA.map((t) => (
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
        {/* Filtro estado */}
        <div className="filtro-select">

          <select
            value={filtroEstado}
            onChange={(e) =>
              setFiltroEstado(e.target.value)
            }
            className="select-año"
          >

            {TABS_ESTADO.map((t) => (
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
          registro={movilidadEditar}
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