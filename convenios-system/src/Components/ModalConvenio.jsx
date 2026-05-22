import React, { useState, useEffect } from "react";

const OPORTUNIDADES = [
  { key: "practicas",       label: "Prácticas" },
  { key: "investigaciones", label: "Investigaciones" },
  { key: "proyeccion",      label: "Proyección social" },
  { key: "capacitacion",    label: "Capacitación" },
  { key: "laboral",         label: "Oportunidad laboral" },
  { key: "movilidad",       label: "Movilidad" },
  { key: "pasantia",        label: "Pasantías" },
];

const vacioConvenio = {
  nombre: "",
  ambito: "Nacional",
  tipo: "Convenio marco",
  inicio: "",
  fin: "",
  duracion: "",
  resolucion: "",
  resultados: "",
  Resultados: "",
  otros: "",
  Otros: "",
  practicas: false,
  investigaciones: false,
  proyeccion: false,
  capacitacion: false,
  laboral: false,
  movilidad: false,
  pasantia: false,
};

export default function ModalConvenio({ convenio, onGuardar, onCerrar }) {
  const [form, setForm] = useState(vacioConvenio);

  useEffect(() => {
    if (convenio) {
      setForm({
        ...vacioConvenio,
        ...convenio,
        resultados: convenio?.resultados ?? convenio?.Resultados ?? "",
        otros: convenio?.otros ?? convenio?.Otros ?? "",
      });
    } else {
      setForm(vacioConvenio);
    }
  }, [convenio]);

  function cambiar(campo, valor) {
    const cambios = { [campo]: valor };
    if (campo === "resultados") cambios.Resultados = valor;
    if (campo === "Resultados") cambios.resultados = valor;
    if (campo === "otros") cambios.Otros = valor;
    if (campo === "Otros") cambios.otros = valor;
    setForm((prev) => ({ ...prev, ...cambios }));
  }

  function toggleOp(key) {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function guardar() {
    if (!form.nombre.trim()) { alert("El nombre es obligatorio."); return; }
    if (!form.inicio) { alert("La fecha de inicio es obligatoria."); return; }
    if (!form.fin) { alert("La fecha de fin es obligatoria."); return; }
    onGuardar(form);
  }

  const esEdicion = !!convenio;

  return (
    <div className="modal-bg">
      <div className="modal-caja modal-grande">
        <p className="modal-titulo">
          {esEdicion ? "Editar Convenio" : "Nuevo Convenio"}
        </p>

        <div className="modal-grid">
          {/* Nombre */}
          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Nombre del convenio *</label>
            <textarea
              className="modal-textarea"
              rows={2}
              value={form.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
          </div>

          {/* Ámbito */}
          <div className="modal-campo">
            <label className="modal-label">Ámbito *</label>
            <select
              className="modal-select"
              value={form.ambito}
              onChange={(e) => cambiar("ambito", e.target.value)}
            >
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>

          {/* Tipo */}
          <div className="modal-campo">
            <label className="modal-label">Tipo de convenio *</label>
            <select
              className="modal-select"
              value={form.tipo}
              onChange={(e) => cambiar("tipo", e.target.value)}
            >
              <option value="Convenio marco">Convenio Marco</option>
              <option value="Convenio especifico">Convenio Específico</option>
            </select>
          </div>

          {/* Inicio */}
          <div className="modal-campo">
            <label className="modal-label">Fecha de inicio *</label>
            <input
              type="date"
              className="modal-input"
              value={form.inicio}
              onChange={(e) => cambiar("inicio", e.target.value)}
            />
          </div>

          {/* Fin */}
          <div className="modal-campo">
            <label className="modal-label">Fecha de fin *</label>
            <input
              type="date"
              className="modal-input"
              value={form.fin}
              onChange={(e) => cambiar("fin", e.target.value)}
            />
          </div>

          {/* Duración */}
          <div className="modal-campo">
            <label className="modal-label">Duración</label>
            <input
              type="text"
              className="modal-input"
              value={form.duracion}
              onChange={(e) => cambiar("duracion", e.target.value)}
              placeholder="Ej: 5 años"
            />
          </div>

          {/* Resolución */}
          <div className="modal-campo">
            <label className="modal-label">Resolución</label>
            <input
              type="text"
              className="modal-input"
              value={form.resolucion}
              onChange={(e) => cambiar("resolucion", e.target.value)}
              placeholder="Ej: N° 0001-2024-UNDAC-CU"
            />
          </div>

          {/* Oportunidades */}
          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Tipo de oportunidades</label>
            <div className="modal-checks">
              {OPORTUNIDADES.map((op) => (
                <label key={op.key} className="modal-check-item">
                  <input
                    type="checkbox"
                    checked={!!form[op.key]}
                    onChange={() => toggleOp(op.key)}
                  />
                  <span>{op.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Otros */}
          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Otros (descripción de oportunidad)</label>
            <input
              type="text"
              className="modal-input"
              value={form.otros || form.Otros || ""}
              onChange={(e) => cambiar("otros", e.target.value)}
              placeholder="Ej: intercambio cultural"
            />
          </div>

          {/* Resultados */}
          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Resultados obtenidos</label>
            <textarea
              className="modal-textarea"
              rows={3}
              value={form.resultados || form.Resultados || ""}
              onChange={(e) => cambiar("resultados", e.target.value)}
              placeholder="Describa los resultados obtenidos..."
            />
          </div>
        </div>

        <div className="modal-btns">
          <button className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
          <button className="btn-guardar" onClick={guardar}>
            {esEdicion ? "Guardar cambios" : "Agregar convenio"}
          </button>
        </div>
      </div>
    </div>
  );
}
