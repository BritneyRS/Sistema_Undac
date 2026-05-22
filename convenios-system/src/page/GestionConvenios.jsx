import React, { useState } from "react";
import { conveniosData as datosIniciales } from "../data/convenios";
import { calcularSemaforo, formatearFecha } from "../utils/semaforo";

const OPORTUNIDADES = [
  { key: "practicas", label: "Prácticas" },
  { key: "investigaciones", label: "Investigaciones" },
  { key: "proyeccion", label: "Proyección social" },
  { key: "capacitacion", label: "Capacitación" },
  { key: "laboral", label: "Oportunidad laboral" },
  { key: "movilidad", label: "Movilidad" },
  { key: "pasantia", label: "Pasantías" },
];

const CONVENIO_VACIO = {
  nombre: "",
  ambito: "Nacional",
  tipo: "Convenio marco",
  inicio: "",
  fin: "",
  duracion: "",
  resolucion: "",
  Resultados: "",
  Otros: "",
  practicas: false,
  investigaciones: false,
  proyeccion: false,
  capacitacion: false,
  laboral: false,
  movilidad: false,
  pasantia: false,
};

function ModalForm({ convenio, onGuardar, onCerrar, titulo }) {
  const [form, setForm] = useState(convenio);

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function handleGuardar() {
    if (!form.nombre.trim() || !form.inicio || !form.fin) {
      alert("Por favor completa los campos obligatorios: nombre, fecha inicio y fecha fin.");
      return;
    }
    onGuardar(form);
  }

  return (
    <div className="modal-bg">
      <div className="modal-caja modal-grande">
        <div className="modal-encabezado">
          <p className="modal-titulo">{titulo}</p>
          <button className="modal-x" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-scroll">

          {/* Nombre */}
          <div className="crud-field">
            <label className="crud-label">Nombre del convenio <span className="crud-req">*</span></label>
            <textarea
              className="modal-textarea"
              rows={3}
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Nombre completo del convenio..."
            />
          </div>

          <div className="crud-row-2">
            {/* Ámbito */}
            <div className="crud-field">
              <label className="crud-label">Ámbito</label>
              <select className="crud-select" value={form.ambito} onChange={(e) => handleChange("ambito", e.target.value)}>
                <option>Nacional</option>
                <option>Internacional</option>
              </select>
            </div>

            {/* Tipo */}
            <div className="crud-field">
              <label className="crud-label">Tipo</label>
              <select className="crud-select" value={form.tipo} onChange={(e) => handleChange("tipo", e.target.value)}>
                <option>Convenio marco</option>
                <option>Convenio especifico</option>
              </select>
            </div>
          </div>

          <div className="crud-row-3">
            {/* Inicio */}
            <div className="crud-field">
              <label className="crud-label">Fecha inicio <span className="crud-req">*</span></label>
              <input type="date" className="crud-input" value={form.inicio} onChange={(e) => handleChange("inicio", e.target.value)} />
            </div>
            {/* Fin */}
            <div className="crud-field">
              <label className="crud-label">Fecha fin <span className="crud-req">*</span></label>
              <input type="date" className="crud-input" value={form.fin} onChange={(e) => handleChange("fin", e.target.value)} />
            </div>
            {/* Duración */}
            <div className="crud-field">
              <label className="crud-label">Duración</label>
              <input type="text" className="crud-input" value={form.duracion} onChange={(e) => handleChange("duracion", e.target.value)} placeholder="ej: 5 años" />
            </div>
          </div>

          {/* Resolución */}
          <div className="crud-field">
            <label className="crud-label">Resolución</label>
            <input type="text" className="crud-input" value={form.resolucion} onChange={(e) => handleChange("resolucion", e.target.value)} placeholder="N° 0000-2024-UNDAC-CU" />
          </div>

          {/* Oportunidades */}
          <div className="crud-field">
            <label className="crud-label">Tipo de oportunidades</label>
            <div className="crud-checks">
              {OPORTUNIDADES.map((op) => (
                <label key={op.key} className="crud-check-label">
                  <input
                    type="checkbox"
                    checked={!!form[op.key]}
                    onChange={(e) => handleChange(op.key, e.target.checked)}
                  />
                  {op.label}
                </label>
              ))}
            </div>
          </div>

          {/* Otros */}
          <div className="crud-field">
            <label className="crud-label">Otros (oportunidades)</label>
            <input type="text" className="crud-input" value={form.Otros} onChange={(e) => handleChange("Otros", e.target.value)} placeholder="ej: intercambio cultural" />
          </div>

          {/* Resultados */}
          <div className="crud-field">
            <label className="crud-label">Resultados obtenidos</label>
            <textarea className="modal-textarea" rows={3} value={form.Resultados} onChange={(e) => handleChange("Resultados", e.target.value)} placeholder="Descripción de resultados..." />
          </div>

        </div>

        <div className="modal-btns">
          <button className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmar({ mensaje, onConfirmar, onCancelar }) {
  return (
    <div className="modal-bg">
      <div className="modal-caja" style={{ width: 340 }}>
        <p className="modal-titulo">Confirmar eliminación</p>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>{mensaje}</p>
        <div className="modal-btns">
          <button className="btn-cancelar" onClick={onCancelar}>Cancelar</button>
          <button className="btn-eliminar" onClick={onConfirmar}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function GestionConvenios() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(null); // null | { tipo: "nuevo" | "editar" | "eliminar", convenio }
  const [toast, setToast] = useState(null);

  const datosFiltrados = datos.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.resolucion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  function mostrarToast(msg, tipo = "ok") {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  }

  function handleNuevo() {
    setModal({ tipo: "nuevo", convenio: { ...CONVENIO_VACIO } });
  }

  function handleEditar(convenio) {
    setModal({ tipo: "editar", convenio: { ...convenio } });
  }

  function handleEliminar(convenio) {
    setModal({ tipo: "eliminar", convenio });
  }

  function handleGuardarNuevo(form) {
    const nuevoId = datos.length > 0 ? Math.max(...datos.map((d) => d.id)) + 1 : 1;
    setDatos((prev) => [...prev, { ...form, id: nuevoId }]);
    setModal(null);
    mostrarToast("Convenio agregado correctamente.");
  }

  function handleGuardarEdicion(form) {
    setDatos((prev) => prev.map((c) => (c.id === form.id ? form : c)));
    setModal(null);
    mostrarToast("Convenio actualizado correctamente.");
  }

  function handleConfirmarEliminar() {
    setDatos((prev) => prev.filter((c) => c.id !== modal.convenio.id));
    setModal(null);
    mostrarToast("Convenio eliminado.", "warn");
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 className="titulo">Gestión CRUD de Convenios</h2>
          <p className="subtitulo">Agrega, edita o elimina convenios del sistema</p>
        </div>
        <button className="btn-nuevo" onClick={handleNuevo}>
          + Nuevo convenio
        </button>
      </div>

      {/* Buscador y contador */}
      <div className="filtros-row" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o resolución..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="buscador"
          style={{ minWidth: 280 }}
        />
        <span className="contador">{datosFiltrados.length} registro(s)</span>
      </div>

      {/* Tabla */}
      <div className="tabla-card">
        <div className="wrapper">
          <table className="tabla">
            <thead>
              <tr>
                {['N°', 'Nombre del convenio', 'Ámbito', 'Tipo', 'Inicio', 'Fin', 'Estado', 'Resolución', 'Resultados obtenidos', 'Acciones'].map((col) => (
                  <th key={col} className="th">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} className="vacio">No hay convenios para mostrar.</td>
                </tr>
              ) : (
                datosFiltrados.map((c, i) => {
                  const semaforo = calcularSemaforo(c.fin);
                  return (
                    <tr key={c.id} className={i % 2 === 0 ? "tr-par" : "tr-impar"}>
                      <td className="td td-numero">{i + 1}</td>
                      <td className="td" style={{ maxWidth: 220 }}>{c.nombre}</td>
                      <td className="td">
                        <span className="ambito-badge" style={{
                          background: c.ambito === "Nacional" ? "#f0fdf4" : "#fff7ed",
                          color: c.ambito === "Nacional" ? "#15803d" : "#c2410c",
                        }}>{c.ambito}</span>
                      </td>
                      <td className="td">
                        <span className="tipo-badge" style={{ background: "#eff6ff", color: "#1d4ed8" }}>{c.tipo}</span>
                      </td>
                      <td className="td td-fecha">{formatearFecha(c.inicio)}</td>
                      <td className="td td-fecha">{formatearFecha(c.fin)}</td>
                      <td className="td">
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: semaforo.bg,
                          color: semaforo.hex,
                          whiteSpace: "nowrap",
                        }}>{semaforo.texto}</span>
                      </td>
                      <td className="td td-resolucion">{c.resolucion}</td>
                      <td className="td td-resultados">
                        {c.resultados || c.Resultados || <span className="sin-registro">Sin registro</span>}
                      </td>
                      <td className="td">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-accion btn-editar" onClick={() => handleEditar(c)}>Editar</button>
                          <button className="btn-accion btn-eliminar-sm" onClick={() => handleEliminar(c)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {modal?.tipo === "nuevo" && (
        <ModalForm
          titulo="Nuevo convenio"
          convenio={modal.convenio}
          onGuardar={handleGuardarNuevo}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "editar" && (
        <ModalForm
          titulo="Editar convenio"
          convenio={modal.convenio}
          onGuardar={handleGuardarEdicion}
          onCerrar={() => setModal(null)}
        />
      )}
      {modal?.tipo === "eliminar" && (
        <ModalConfirmar
          mensaje={`¿Seguro que deseas eliminar "${modal.convenio.nombre.substring(0, 60)}..."?`}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.tipo}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
