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

// ─── EFP: mapa carrera → filiales completas ──────────────────
const EFP_RAW = [
  "E.F.P. De Derecho y Ciencias Políticas - Pasco",
  "E.F.P. De Derecho y Ciencias Políticas - Puerto Bermudez",
  "E.F.P. De Ciencias de la Comunicación - Pasco",
  "E.F.P. De Ciencias de la Comunicación - La Merced",
  "E.F.P. De Administración - Pasco",
  "E.F.P. De Administración - Oxapampa",
  "E.F.P. De Medicina Humana - Pasco",
  "E.F.P. De Ingenieira de minas - Pasco",
  "E.F.P. De Odontología - Pasco",
  "E.F.P. De Industrias Alimentarias - La Merced",
  "E.F.P. De Zootecnia - Pasco",
  "E.F.P. De Zootecnia - Oxapampa",
  "E.F.P. De Agronomia - Pasco",
  "E.F.P. De Agronomia - Oxapampa",
  "E.F.P. De Agronomia - Yanahuanca",
  "E.F.P. De Agronomia - Paucartambo",
  "E.F.P. De Agronomia - La Merced",
  "E.F.P. De Economía - Pasco",
  "E.F.P. De Contabilidad - Pasco",
  "E.F.P. De Contabilidad - Constitucion",
  "E.F.P. De Enfermería - Pasco",
  "E.F.P. De Enfermería - Tarma",
  "E.F.P. De Obstetricia - Pasco",
  "E.F.P. De Obstetricia - Tarma",
  "E.F.P. De Ingeniería Civil - Pasco",
  "E.F.P. De Ingeniería Ambiental - Oxapampa",
  "E.F.P. De Ingeniería Ambiental - Pasco",
  "E.F.P. De Ingeniería de Sitemas y Computación - Pasco",
  "E.F.P. De Ingeniería Geológica - Pasco",
  "E.F.P. De Ingeniería Metalúrgica - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Tecnología, Informática y telecomunicaciones - Yanahuanca",
  "E.F.P. De Educación Secundaria Especialidad de Tecnología, Informática y telecomunicaciones - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Lenguas Extranjeras Inglés y Francés - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Ciencias Sociales, Filosofía y Psicología Educativa - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Biologia y Química - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Matematica y Física - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Historia, Ciencias Sociales y Turismo - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Comuniccación y Literatura - Pasco",
  "E.F.P. De Educación Primaria - Oxapampa",
  "E.F.P. De Educación Primaria - Yanahuanca",
  "E.F.P. De Educación Primaria - Pasco",
  "E.F.P. De Educación Inicial - Pasco",
];
 
// carrera → [filiales]
const EFP_CARRERA_MAP = EFP_RAW.reduce((acc, full) => {
  const sep     = full.indexOf(" - ");
  const carrera = sep !== -1 ? full.substring(0, sep).trim() : full.trim();
  if (!acc[carrera]) acc[carrera] = [];
  acc[carrera].push(full);
  return acc;
}, {});
 
// Todas las carreras únicas (con o sin filiales), en orden
const TODAS_CARRERAS = Object.keys(EFP_CARRERA_MAP).sort();

const obtenerSemestresUnicos = (datos) => {
  const semestres = new Set();
  datos.forEach((m) => {
    if (m.semestre) {
      semestres.add(m.semestre);
    }
  });
  return Array.from(semestres).sort().reverse();
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

//----------componente inicial----------------
export default function Movilidades({ usuario }) {

  const esAdmin = usuario?.rol === "admin";

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroSemestre, setFiltroSemestre] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState(["todos"]);
  const [periodoDropdownAbierto, setPeriodoDropdownAbierto] = useState(false);
  const filtroPeriodoRef = useRef(null);

  const [filtroCiudadDestino, setFiltroCiudadDestino] = useState("todos");
  const [filtroBeca, setFiltroBeca] = useState("todos");
  const [filtroCarrera, setFiltroCarrera] = useState("todos");
  const [filtroFiliales, setFiltroFiliales] = useState(["todos"]);
  const [filialesDropdownAbierto, setFilialesDropdownAbierto] = useState(false);
  const filialesRef = useRef(null);
 
  const [filtroEstado, setFiltroEstado] = useState("todos"); 
  const [filtroAmbito, setFiltroAmbito] = useState("todos"); // <-- NUEVO: Estado para el filtro nacional/internacional

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [movilidadEditar, setMovilidadEditar] = useState(null);
  const [confirmarElim, setConfirmarElim] = useState(null);
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

  // Al cambiar carrera → resetear filiales
  useEffect(() => {
    setFiltroFiliales(["todos"]);
    setFilialesDropdownAbierto(false);
  }, [filtroCarrera]);

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

  // ─── Multi-select filiales ────────────────────────────────
  const tieneFiliales = filtroCarrera !== "todos" &&
    (EFP_CARRERA_MAP[filtroCarrera]?.length || 0) > 1;
 
  const sedesCarreraSeleccionada = tieneFiliales
    ? EFP_CARRERA_MAP[filtroCarrera].map((full) => {
        const s = full.indexOf(" - ");
        return { full, sede: s !== -1 ? full.substring(s + 3) : full };
      })
    : [];
 
  function obtenerLabelFilialesSeleccionadas() {
    if (filtroFiliales.includes("todos") || filtroFiliales.length === 0)
      return "Todas las filiales";
    return filtroFiliales
      .map((f) => { const s = f.indexOf(" - "); return s !== -1 ? f.substring(s + 3) : f; })
      .join(", ");
  }
 
  function onCambioFilial(valor) {
    if (valor === "todos") { setFiltroFiliales(["todos"]); return; }
    const actual = filtroFiliales.includes("todos") ? [] : [...filtroFiliales];
    if (actual.includes(valor)) {
      const nueva = actual.filter((i) => i !== valor);
      setFiltroFiliales(nueva.length === 0 ? ["todos"] : nueva);
    } else {
      setFiltroFiliales([...actual, valor]);
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
    { id: "todos", label: "Todos los semestres" },
    ...obtenerSemestresUnicos(datos).map((s) => ({ id: s, label: s })),
  ];

  const TABS_PERIODO = [
    { id: "todos", label: "Todos los periodos" },
    ...obtenerPeriodosUnicos(datos).map((p) => ({ id: p, label: p })),
  ];

  const TABS_CIUDAD_DESTINO = [
    { id: "todos", label: "Todas las ciudades destino" },
    ...obtenerCiudadesDestinoUnicas(datos).map((c) => ({ id: c, label: c })),
  ];

  const TABS_BECA = [
    { id: "todos", label: "Beca" },
    ...obtenerBecasUnicas(datos).map((b) => ({ id: b, label: b })),
  ];

  const TABS_ESTADO = [
    { id: "todos", label: "Todos los estados" },
    ...["activo", "pendiente", "finalizado", "desistido"].map((e) => ({ id: e, label: e })),
  ];

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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
      normalizarTexto(m.nombres).includes(term) ||
      normalizarTexto(m.universidaddestino).includes(term) ||
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

    // ── Filtro unificado escuela/carrera + filiales ──────────
    let porEscuela = true;
    if (filtroCarrera !== "todos") {
      if (!tieneFiliales) {
        porEscuela = m.escuela && m.escuela.startsWith(filtroCarrera);
      } else if (filtroFiliales.includes("todos") || filtroFiliales.length === 0) {
        porEscuela = m.escuela && m.escuela.startsWith(filtroCarrera);
      } else {
        porEscuela = filtroFiliales.includes(m.escuela);
      }
    }

    const porEstado =
      filtroEstado === "todos" ||
      m.estado === filtroEstado;

    // <-- NUEVO: Filtrado lógico por ámbito nacional o internacional
    const porAmbito =
      filtroAmbito === "todos" ||
      (filtroAmbito === "internacional" && m.es_internacional === true) ||
      (filtroAmbito === "nacional" && !m.es_internacional);

    return (
      porBusqueda &&
      porSemestre &&
      porPeriodo &&
      porCiudadDestino &&
      porBeca &&
      porEstado &&
      porEscuela &&
      porAmbito // <-- NUEVO: Inyección de la condición del filtro
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

  async function guardarMovilidad(form, archivo1 = null, archivo2 = null) {
    try {
      if (movilidadEditar) {
        await movilidadesAPI.actualizar(
          movilidadEditar.id,
          form,
          archivo1,
          archivo2
        );
        mostrarToast(
          "Movilidad actualizada correctamente."
        );
      } else {
        await movilidadesAPI.crear(form, archivo1, archivo2);
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
      <div className="header header-movilidad">
        <div>
          <h2 className="titulo">
            Movilidad Estudiantil
          </h2>
          <p className="subtitulo">
            Estudiantes de pregrado por facultad y escuela que realizan movilidad estudiantil academica en universidades nacionales o extranjeras
          </p>
        </div>

        <div className="header-botones">
          {esAdmin && (
            <button
              className="btn-nuevo"
              onClick={abrirNuevo}
            >
              <FaPlus style={{ marginRight: 6 }} />
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
            <FaFileExcel style={{ marginRight: 6 }} />
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
            <FaFilePdf style={{ marginRight: 6 }} />
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

        {/* ── Escuela / Carrera (filtro único) ── */}
        <div className="filtro-select">
          <select
            value={filtroCarrera}
            onChange={(e) => setFiltroCarrera(e.target.value)}
            className="select-año"
          >
            <option value="todos">Todas las escuelas</option>
            {TODAS_CARRERAS.map((c) => (
              <option key={c} value={c}>
                {c.replace("E.F.P. De ", "")}
              </option>
            ))}
          </select>
        </div>
 
        {/* ── Filiales ── */}
        {tieneFiliales && (
          <div
              ref={filialesRef}
              className={`filtro-select ${tieneFiliales ? "filtro-filiales" : ""}`}
            >
            <button
              type="button"
              className="select-año multi-select-trigger"
              onClick={() => setFilialesDropdownAbierto(!filialesDropdownAbierto)}
            >
              <span>{obtenerLabelFilialesSeleccionadas()}</span>
              <span className="multi-select-arrow">▾</span>
            </button>
            {filialesDropdownAbierto && (
              <div className="multi-select-menu">
                <label className="multi-select-item">
                  <input type="checkbox" value="todos"
                    checked={filtroFiliales.includes("todos")}
                    onChange={() => onCambioFilial("todos")} />
                  <span>Todas las filiales</span>
                </label>
                {sedesCarreraSeleccionada.map(({ full, sede }) => (
                  <label key={full} className="multi-select-item">
                    <input type="checkbox" value={full}
                      checked={filtroFiliales.includes(full)}
                      onChange={() => onCambioFilial(full)} />
                    <span>{sede}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

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

        {/* ── NUEVO: Filtro ámbito (Nacional / Internacional) ── */}
        <div className="filtro-select">
          <select
            value={filtroAmbito}
            onChange={(e) => setFiltroAmbito(e.target.value)}
            className="select-año"
          >
            <option value="todos">Todos los ámbitos</option>
            <option value="nacional">Nacional</option>
            <option value="internacional">Internacional</option>
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
        <p className="cargando-movilidades">
          Cargando movilidades...
        </p>
      )}

      {error && (
        <p className="error-movilidades">
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
          <div className="modal-caja modal-eliminar">
            <p className="modal-titulo">
              ¿Eliminar movilidad?
            </p>

            <p className="texto-eliminar">
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