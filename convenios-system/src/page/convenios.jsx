
import React, { useState, useEffect, useCallback } from "react";
import Tableconvenios from "../Components/Tableconvenios";
import ModalConvenio  from "../Components/ModalConvenio";
import { calcularSemaforo } from "../utils/semaforo";
import { exportar }         from "../utils/exportar";
import { conveniosAPI }     from "../utils/api";
import { FaPlus, FaFileExcel, FaFilePdf } from "react-icons/fa";

const TABS_AMBITO = [
  { id: "todos",         label: "Todos" },
  { id: "nacional",      label: "Nacionales" },
  { id: "internacional", label: "Internacionales" },
];

const TABS_SEMAFORO = [
  { id: "todos",      label: "Todos",       color: "#4a90c4" },
  { id: "verde",      label: "Vigentes",    color: "#16a34a" },
  { id: "por-vencer", label: "Por vencer",  color: "#d97706" },
  { id: "rojo",       label: "Finalizados", color: "#dc2626" },
];

const TABS_OPORTUNIDADES = [
  { id: "todos", label: "Todas las oportunidades" },
  { id: "practicas", label: "Prácticas" },
  { id: "investigaciones", label: "Investigaciones" },
  { id: "proyeccion", label: "Proyección social" },
  { id: "capacitacion", label: "Capacitación" },
  { id: "laboral", label: "Oportunidad laboral" },
  { id: "movilidad", label: "Movilidad" },
  { id: "pasantia", label: "Pasantías" },
  { id: "otros", label: "Otros" },
];

const obtenerAñosUnicos = (datos) => {
  const años = new Set();
  datos.forEach((c) => años.add(new Date(c.inicio).getFullYear()));
  return Array.from(años).sort((a, b) => b - a);
};

const obtenerTiposUnicos = (datos) => {
  const tipos = new Set();
  datos.forEach((c) => { if (c.tipo) tipos.add(c.tipo); });
  return Array.from(tipos).sort();
};
function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
export default function Convenios({ usuario }) {
  const esAdmin = usuario?.rol === "admin";

  const [datos,          setDatos]          = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [error,          setError]          = useState(null);
  const [filtroAmbito,   setFiltroAmbito]   = useState("todos");
  const [filtroSemaforo, setFiltroSemaforo] = useState("todos");
  const [filtroAño,      setFiltroAño]      = useState("todos");
  const [filtroTipo,     setFiltroTipo]     = useState("todos");
  const [filtroOportunidad, setFiltroOportunidad] = useState("todos");
  const [busqueda,       setBusqueda]       = useState("");
  const [modalAbierto,   setModalAbierto]   = useState(false);
  const [convenioEditar, setConvenioEditar] = useState(null);
  const [confirmarElim,  setConfirmarElim]  = useState(null);
  const [toast,          setToast]          = useState(null);

  // ─── Cargar datos desde el backend ───────────────────────
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const filas = await conveniosAPI.listar();
      setDatos(filas);
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  function mostrarToast(msg, tipo = "ok") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }

  // ─── Filtros locales (rápidos, sin ir al servidor) ───────
  const TABS_AÑOS = [
    { id: "todos", label: "Todos los años" },
    ...obtenerAñosUnicos(datos).map((a) => ({ id: a.toString(), label: a.toString() })),
  ];

  const TABS_TIPO = [
    { id: "todos", label: "Todos los tipos" },
    ...obtenerTiposUnicos(datos).map((t) => ({
      id: t.toLowerCase().replace(/\s+/g, "-"),
      label: t,
    })),
  ];

  const conveniosFiltrados = datos.filter((c) => {
    const ambitoNorm  = c.ambito?.toLowerCase();
    const porAmbito   = filtroAmbito === "todos" || ambitoNorm === filtroAmbito;
    const semaforoColor = calcularSemaforo(c.fin).color;
    const porSemaforo =
      filtroSemaforo === "todos" ||
      (filtroSemaforo === "por-vencer" && ["naranja", "amarillo"].includes(semaforoColor)) ||
      semaforoColor === filtroSemaforo;
    const termino = normalizarTexto(busqueda);

    const porBusqueda =
      busqueda === "" ||
      normalizarTexto(c.nombre).includes(termino) ||
      normalizarTexto(c.resolucion).includes(termino);
    const año    = new Date(c.inicio).getFullYear();
    const porAño = filtroAño === "todos" || año.toString() === filtroAño;
    const tipoNorm = c.tipo?.toLowerCase().replace(/\s+/g, "-");
    const porTipo  = filtroTipo === "todos" || tipoNorm === filtroTipo;
    // Oportunidad filter: soporta banderas booleanas y el campo 'otros'
    const porOportunidad = (() => {
      if (filtroOportunidad === "todos") return true;
      if (filtroOportunidad === "otros") {
        const val = (c.otros || c.Otros || "").toString().trim();
        return val !== "";
      }
      return !!c[filtroOportunidad];
    })();
    return porAmbito && porSemaforo && porBusqueda && porAño && porTipo && porOportunidad;
  });

  // ─── CRUD ────────────────────────────────────────────────
  function abrirNuevo()       { setConvenioEditar(null);     setModalAbierto(true); }
  function abrirEditar(conv)  { setConvenioEditar(conv);     setModalAbierto(true); }
  function cerrarModal()      { setModalAbierto(false);      setConvenioEditar(null); }

  async function guardarConvenio(form, archivo = null, borrarDocumento = false) {
    try {
      if (convenioEditar) {
        await conveniosAPI.actualizar(convenioEditar.id, form, archivo, borrarDocumento);
        mostrarToast("Convenio actualizado correctamente.");
      } else {
        await conveniosAPI.crear(form, archivo);
        mostrarToast("Convenio creado correctamente.");
      }
      cerrarModal();
      cargarDatos(); // recargar lista
    } catch (err) {
      mostrarToast(err.message || "Error al guardar.", "warn");
    }
  }

  async function confirmarEliminar() {
    try {
      await conveniosAPI.eliminar(confirmarElim);
      mostrarToast("Convenio eliminado.");
      setConfirmarElim(null);
      cargarDatos();
    } catch (err) {
      mostrarToast(err.message || "Error al eliminar.", "warn");
    }
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="titulo">Gestión de Convenios</h2>
          <p className="subtitulo">
            Convenios con instituciones públicas y privadas, nacionales e internacionales
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {esAdmin && (
            <button className="btn-nuevo" onClick={abrirNuevo}>
              <FaPlus style={{ marginRight: 6 }} />
              Nuevo convenio
            </button>
          )}
          <button className="btn-export btn-export-excel" onClick={() => exportar(conveniosFiltrados, "excel")}>
            <FaFileExcel style={{ marginRight: 6 }} /> Excel
          </button>
          <button className="btn-export btn-export-pdf" onClick={() => exportar(conveniosFiltrados, "pdf")}>
            <FaFilePdf style={{ marginRight: 6 }} /> PDF
          </button>
        </div>
      </div>

      {/* Leyenda semáforo */}
      <div className="leyenda">
        <span className="leyenda-titulo">Semáforo:</span>
        {[
          { color: "#16a34a", label: "Vigente" },
          { color: "#d97706", label: "Por vencer (menos de 1 mes)" },
          { color: "#f59e0b", label: "Por vencer (menos de 2 meses)" },
          { color: "#dc2626", label: "Finalizado" },
        ].map((l) => (
          <div key={l.label} className="leyenda-item">
            <span className="leyenda-punto" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="filtros-row">
        <div className="tab-group">
          {TABS_AMBITO.map((t) => (
            <button key={t.id} onClick={() => setFiltroAmbito(t.id)}
              className={filtroAmbito === t.id ? "tab tab-activo" : "tab"}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="tab-group">
          {TABS_SEMAFORO.map((t) => (
            <button key={t.id} onClick={() => setFiltroSemaforo(t.id)}
              className={filtroSemaforo === t.id ? "tab tab-activo" : "tab"}
              style={filtroSemaforo === t.id ? { background: t.color, borderColor: t.color } : {}}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="filtro-select">
          <select value={filtroOportunidad} onChange={(e) => setFiltroOportunidad(e.target.value)} className="select-año">
            {TABS_OPORTUNIDADES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="filtro-select">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="select-año">
            {TABS_TIPO.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="filtro-select">
          <select value={filtroAño} onChange={(e) => setFiltroAño(e.target.value)} className="select-año">
            {TABS_AÑOS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <input type="text" placeholder="Buscar por nombre..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="buscador" />
        <span className="contador">{conveniosFiltrados.length} registro(s)</span>
      </div>

      {/* Estado de carga / error */}
      {cargando && <p style={{ textAlign: "center", color: "#6b7280", padding: 32 }}>Cargando convenios...</p>}
      {error    && <p style={{ textAlign: "center", color: "#dc2626", padding: 32 }}>{error}</p>}

      {/* Tabla */}
      {!cargando && !error && (
        <div className="tabla-card">
          <Tableconvenios
            convenios={conveniosFiltrados}
            esAdmin={esAdmin}
            onEditar={abrirEditar}
            onEliminar={(id) => setConfirmarElim(id)}
          />
        </div>
      )}

      {/* Modal CRUD */}
      {modalAbierto && (
        <ModalConvenio
          convenio={convenioEditar}
          onGuardar={guardarConvenio}
          onCerrar={cerrarModal}
        />
      )}

      {/* Modal confirmar eliminación */}
      {confirmarElim !== null && (
        <div className="modal-bg">
          <div className="modal-caja" style={{ maxWidth: 380 }}>
            <p className="modal-titulo">¿Eliminar convenio?</p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-btns">
              <button className="btn-cancelar" onClick={() => setConfirmarElim(null)}>Cancelar</button>
              <button className="btn-eliminar" onClick={confirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast de notificación */}
      {toast && <div className={"toast toast-" + toast.tipo}>{toast.msg}</div>}
    </div>
  );
}
