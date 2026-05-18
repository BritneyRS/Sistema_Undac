import React, { useState } from "react";
import { conveniosData as datosIniciales } from "../data/convenios";
import Tableconvenios from "../Components/Tableconvenios";
import ModalConvenio from "../Components/ModalConvenio";
import { calcularSemaforo } from "../utils/semaforo";
import { FaPlus } from "react-icons/fa";

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

export default function Convenios({ usuario }) {
  const esAdmin = usuario?.rol === "admin";

  const [datos, setDatos] = useState(datosIniciales);
  const [filtroAmbito,   setFiltroAmbito]   = useState("todos");
  const [filtroSemaforo, setFiltroSemaforo] = useState("todos");
  const [filtroAño,      setFiltroAño]      = useState("todos");
  const [filtroTipo,     setFiltroTipo]     = useState("todos");
  const [busqueda,       setBusqueda]       = useState("");

  // Modal CRUD
  const [modalAbierto,    setModalAbierto]    = useState(false);
  const [convenioEditar,  setConvenioEditar]  = useState(null); // null = nuevo
  const [confirmarElim,   setConfirmarElim]   = useState(null); // id a eliminar

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
    const ambitoNorm = c.ambito?.toLowerCase();
    const porAmbito = filtroAmbito === "todos" || ambitoNorm === filtroAmbito;
    const semaforoColor = calcularSemaforo(c.fin).color;
    const porSemaforo =
      filtroSemaforo === "todos" ||
      (filtroSemaforo === "por-vencer" && ["naranja", "amarillo"].includes(semaforoColor)) ||
      semaforoColor === filtroSemaforo;
    const porBusqueda =
      busqueda === "" ||
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.resolucion?.toLowerCase().includes(busqueda.toLowerCase());
    const año = new Date(c.inicio).getFullYear();
    const porAño = filtroAño === "todos" || año.toString() === filtroAño;
    const tipoNorm = c.tipo?.toLowerCase().replace(/\s+/g, "-");
    const porTipo = filtroTipo === "todos" || tipoNorm === filtroTipo;
    return porAmbito && porSemaforo && porBusqueda && porAño && porTipo;
  });

  // ─── CRUD handlers ───────────────────────────────────────
  function abrirNuevo() {
    setConvenioEditar(null);
    setModalAbierto(true);
  }

  function abrirEditar(convenio) {
    setConvenioEditar(convenio);
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setConvenioEditar(null);
  }

  function guardarConvenio(form) {
    if (convenioEditar) {
      // Editar
      setDatos((prev) =>
        prev.map((c) => (c.id === convenioEditar.id ? { ...form, id: c.id } : c))
      );
    } else {
      // Nuevo
      const nuevoId = Math.max(...datos.map((c) => c.id), 0) + 1;
      setDatos((prev) => [...prev, { ...form, id: nuevoId }]);
    }
    cerrarModal();
  }

  function pedirEliminar(id) {
    setConfirmarElim(id);
  }

  function confirmarEliminar() {
    setDatos((prev) => prev.filter((c) => c.id !== confirmarElim));
    setConfirmarElim(null);
  }

  return (
    <div>
      {/* ─── Encabezado ─────────────────────────────────────── */}
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="titulo">Gestión de Convenios</h2>
          <p className="subtitulo">
            Convenios con instituciones públicas y privadas, nacionales e internacionales
          </p>
        </div>

        {esAdmin && (
          <button className="btn-nuevo" onClick={abrirNuevo}>
            <FaPlus style={{ marginRight: 6 }} />
            Nuevo convenio
          </button>
        )}
      </div>

      {/* ─── Leyenda ─────────────────────────────────────────── */}
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

      {/* ─── Filtros ─────────────────────────────────────────── */}
      <div className="filtros-row">
        <div className="tab-group">
          {TABS_AMBITO.map((t) => (
            <button
              key={t.id}
              onClick={() => setFiltroAmbito(t.id)}
              className={filtroAmbito === t.id ? "tab tab-activo" : "tab"}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="tab-group">
          {TABS_SEMAFORO.map((t) => (
            <button
              key={t.id}
              onClick={() => setFiltroSemaforo(t.id)}
              className={filtroSemaforo === t.id ? "tab tab-activo" : "tab"}
              style={filtroSemaforo === t.id ? { background: t.color, borderColor: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="filtro-select">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="select-año"
          >
            {TABS_TIPO.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="filtro-select">
          <select
            value={filtroAño}
            onChange={(e) => setFiltroAño(e.target.value)}
            className="select-año"
          >
            {TABS_AÑOS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador"
        />

        <span className="contador">{conveniosFiltrados.length} registro(s)</span>
      </div>

      {/* ─── Tabla ───────────────────────────────────────────── */}
      <div className="tabla-card">
        <Tableconvenios
          convenios={conveniosFiltrados}
          esAdmin={esAdmin}
          onEditar={abrirEditar}
          onEliminar={pedirEliminar}
        />
      </div>

      {/* ─── Modal CRUD ──────────────────────────────────────── */}
      {modalAbierto && (
        <ModalConvenio
          convenio={convenioEditar}
          onGuardar={guardarConvenio}
          onCerrar={cerrarModal}
        />
      )}

      {/* ─── Modal confirmar eliminación ─────────────────────── */}
      {confirmarElim !== null && (
        <div className="modal-bg">
          <div className="modal-caja" style={{ maxWidth: 380 }}>
            <p className="modal-titulo">¿Eliminar convenio?</p>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-btns">
              <button className="btn-cancelar" onClick={() => setConfirmarElim(null)}>
                Cancelar
              </button>
              <button className="btn-eliminar" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
