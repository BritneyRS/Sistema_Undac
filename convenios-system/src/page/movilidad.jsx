import React, { useState, useEffect, useCallback } from "react";
import TableMovilidades from "../Components/TableMovilidades";
import ModalMovilidad from "../Components/ModalMovilidad";
import { calcularSemaforo } from "../utils/semaforo";
import { exportar } from "../utils/exportar";
import { movilidadAPI } from "../utils/api";
import { FaPlus, FaFileExcel, FaFilePdf } from "react-icons/fa";

const TABS_DIRECCION = [
  { id: "todos", label: "Todos" },
  { id: "saliente", label: "Salientes" },
  { id: "entrante", label: "Entrantes" },
];

const TABS_SEMAFORO = [
  { id: "todos", label: "Todos", color: "#4a90c4" },
  { id: "verde", label: "En Curso", color: "#16a34a" },
  { id: "por-vencer", label: "Por Culminar", color: "#d97706" },
  { id: "rojo", label: "Culminados", color: "#dc2626" },
];

const obtenerAñosUnicos = (datos) => {
  const años = new Set();

  datos.forEach((m) => {
    if (m.fechaInicio) {
      años.add(new Date(m.fechaInicio).getFullYear());
    }
  });

  return Array.from(años).sort((a, b) => b - a);
};

const obtenerFinanciamientosUnicos = (datos) => {
  const tipos = new Set();

  datos.forEach((m) => {
    if (m.financiamiento) {
      tipos.add(m.financiamiento);
    }
  });

  return Array.from(tipos).sort();
};

export default function Movilidades({ usuario }) {
  const esAdmin = usuario?.rol === "admin";

  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtroDireccion, setFiltroDireccion] = useState("todos");
  const [filtroSemaforo, setFiltroSemaforo] = useState("todos");
  const [filtroAño, setFiltroAño] = useState("todos");
  const [filtroFinancia, setFiltroFinancia] = useState("todos");
  const [filtroParticipante, setFiltroParticipante] = useState("todos");

  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [movilidadEditar, setMovilidadEditar] = useState(null);

  const [confirmarElim, setConfirmarElim] = useState(null);

  const [toast, setToast] = useState(null);

  // ─────────────────────────────────────────────
  // Cargar datos
  // ─────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const filas = await movilidadAPI.listar();
      setDatos(filas);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ─────────────────────────────────────────────
  // Toast
  // ─────────────────────────────────────────────
  function mostrarToast(msg, tipo = "ok") {
    setToast({ msg, tipo });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  // ─────────────────────────────────────────────
  // Tabs dinámicos
  // ─────────────────────────────────────────────
  const TABS_AÑOS = [
    { id: "todos", label: "Todos los años" },
    ...obtenerAñosUnicos(datos).map((a) => ({
      id: a.toString(),
      label: a.toString(),
    })),
  ];

  const TABS_FINANCIAMIENTO = [
    { id: "todos", label: "Todos los financiamientos" },
    ...obtenerFinanciamientosUnicos(datos).map((f) => ({
      id: f.toLowerCase().replace(/\s+/g, "-"),
      label: f,
    })),
  ];

  // ─────────────────────────────────────────────
  // Filtrado
  // ─────────────────────────────────────────────
  const movilidadesFiltradas = datos.filter((m) => {
    // Dirección
    const dirNorm = m.direccion?.toLowerCase();

    const porDireccion =
      filtroDireccion === "todos" ||
      dirNorm === filtroDireccion;

    // Semáforo
    const semaforoColor = calcularSemaforo(m.fechaFin).color;

    const porSemaforo =
      filtroSemaforo === "todos" ||
      (filtroSemaforo === "por-vencer" &&
        ["naranja", "amarillo"].includes(semaforoColor)) ||
      semaforoColor === filtroSemaforo;

    // Búsqueda
    const textoBusqueda = busqueda.toLowerCase();

    const porBusqueda =
      busqueda === "" ||
      m.participante?.toLowerCase().includes(textoBusqueda) ||
      m.codigoDocumento?.toLowerCase().includes(textoBusqueda) ||
      m.institucionOrigen?.toLowerCase().includes(textoBusqueda) ||
      m.institucionDestino?.toLowerCase().includes(textoBusqueda);

    // Año
    const año = m.fechaInicio
      ? new Date(m.fechaInicio).getFullYear()
      : null;

    const porAño =
      filtroAño === "todos" ||
      año?.toString() === filtroAño;

    // Financiamiento
    const finNorm = m.financiamiento
      ?.toLowerCase()
      .replace(/\s+/g, "-");

    const porFinancia =
      filtroFinancia === "todos" ||
      finNorm === filtroFinancia;

    // Participante
    const porParticipante =
      filtroParticipante === "todos" ||
      m.tipoParticipante === filtroParticipante;

    return (
      porDireccion &&
      porSemaforo &&
      porBusqueda &&
      porAño &&
      porFinancia &&
      porParticipante
    );
  });

  // ─────────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────────
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
        await movilidadAPI.actualizar(movilidadEditar.id, form);

        mostrarToast(
          "Registro de movilidad actualizado."
        );
      } else {
        await movilidadAPI.crear(form);

        mostrarToast(
          "Registro de movilidad creado exitosamente."
        );
      }

      cerrarModal();
      cargarDatos();
    } catch (err) {
      console.error(err);

      mostrarToast(
        err.message || "Error al guardar.",
        "warn"
      );
    }
  }

  async function confirmarEliminar() {
    try {
      await movilidadAPI.eliminar(confirmarElim);

      mostrarToast("Registro eliminado.");

      setConfirmarElim(null);

      cargarDatos();
    } catch (err) {
      console.error(err);

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
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 className="titulo">
            Gestión de Movilidad Académica
          </h2>

          <p className="subtitulo">
            Control y seguimiento de intercambios de estudiantes
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
              <FaPlus style={{ marginRight: 6 }} />
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
            <FaFileExcel style={{ marginRight: 6 }} />
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
            <FaFilePdf style={{ marginRight: 6 }} />
            PDF
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="leyenda">
        <span className="leyenda-titulo">
          Estado del intercambio:
        </span>

        {[
          {
            color: "#16a34a",
            label: "En curso (Vigente)",
          },
          {
            color: "#d97706",
            label:
              "Por culminar (menos de 1 mes)",
          },
          {
            color: "#f59e0b",
            label:
              "Por culminar (menos de 2 meses)",
          },
          {
            color: "#dc2626",
            label: "Culminado",
          },
        ].map((l) => (
          <div
            key={l.label}
            className="leyenda-item"
          >
            <span
              className="leyenda-punto"
              style={{
                background: l.color,
              }}
            />

            {l.label}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filtros-row">
        {/* Dirección */}
        <div className="tab-group">
          {TABS_DIRECCION.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setFiltroDireccion(t.id)
              }
              className={
                filtroDireccion === t.id
                  ? "tab tab-activo"
                  : "tab"
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Semáforo */}
        <div className="tab-group">
          {TABS_SEMAFORO.map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setFiltroSemaforo(t.id)
              }
              className={
                filtroSemaforo === t.id
                  ? "tab tab-activo"
                  : "tab"
              }
            >
              <span
                className="tab-punto"
                style={{
                  background: t.color,
                  marginRight: 6,
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                }}
              />

              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div
        className="selectores-row"
        style={{
          display: "flex",
          gap: 10,
          margin: "15px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          className="input-busqueda"
          placeholder="Buscar por participante, documento o institución..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          style={{
            flex: 1,
            minWidth: "250px",
          }}
        />

        <select
          className="select-filtro"
          value={filtroAño}
          onChange={(e) =>
            setFiltroAño(e.target.value)
          }
        >
          {TABS_AÑOS.map((a) => (
            <option
              key={a.id}
              value={a.id}
            >
              {a.label}
            </option>
          ))}
        </select>

        <select
          className="select-filtro"
          value={filtroFinancia}
          onChange={(e) =>
            setFiltroFinancia(
              e.target.value
            )
          }
        >
          {TABS_FINANCIAMIENTO.map((f) => (
            <option
              key={f.id}
              value={f.id}
            >
              {f.label}
            </option>
          ))}
        </select>

        <select
          className="select-filtro"
          value={filtroParticipante}
          onChange={(e) =>
            setFiltroParticipante(
              e.target.value
            )
          }
        >
          <option value="todos">
            Todos los participantes
          </option>

          <option value="estudiante">
            Estudiante de Pregrado
          </option>

          <option value="posgrado">
            Estudiante de Posgrado
          </option>

          <option value="docente">
            Docente / Investigador
          </option>

          <option value="administrativo">
            Personal Administrativo
          </option>
        </select>
      </div>

      {/* Tabla */}
      {cargando ? (
        <p>
          Cargando registros de movilidad...
        </p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <TableMovilidades
          datos={movilidadesFiltradas}
          esAdmin={esAdmin}
          onEditar={abrirEditar}
          onEliminar={(id) =>
            setConfirmarElim(id)
          }
        />
      )}

      {/* Modal */}
      {modalAbierto && (
        <ModalMovilidad
          abierto={modalAbierto}
          onClose={cerrarModal}
          onGuardar={guardarMovilidad}
          movilidad={movilidadEditar}
        />
      )}

      {/* Confirmación eliminar */}
      {confirmarElim && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <h3>
              ¿Eliminar registro?
            </h3>

            <p>
              Esta acción no se puede
              deshacer.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
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
                onClick={
                  confirmarEliminar
                }
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast toast-${toast.tipo}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}