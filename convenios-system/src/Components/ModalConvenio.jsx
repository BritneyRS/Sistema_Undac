import React, { useState, useEffect, useRef } from "react";
import { conveniosAPI } from "../utils/api";

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

const TIPOS_PERMITIDOS = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
const MAX_MB = 100;

export default function ModalConvenio({ convenio, onGuardar, onCerrar }) {
  const [form, setForm] = useState(vacioConvenio);
  const [advertencia, setAdvertencia] = useState("");
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [archivoError, setArchivoError] = useState("");
  const [documentoEliminado, setDocumentoEliminado] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (convenio) {
      setForm({
        ...vacioConvenio,
        ...convenio,
        inicio: convenio?.inicio ? convenio.inicio.toString().split("T")[0] : "",
        fin: convenio?.fin ? convenio.fin.toString().split("T")[0] : "",
        resultados: convenio?.resultados ?? convenio?.Resultados ?? "",
        otros: convenio?.otros ?? convenio?.Otros ?? "",
      });
    } else {
      setForm(vacioConvenio);
    }

    setAdvertencia("");
    setArchivoNuevo(null);
    setArchivoError("");
    setDocumentoEliminado(false);
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

  function cambiarArchivo(e) {
    const file = e.target.files?.[0] || null;
    setArchivoError("");
    setDocumentoEliminado(false);

    if (!file) {
      setArchivoNuevo(null);
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      setArchivoError(`El archivo supera el límite de ${MAX_MB} MB.`);
      e.target.value = "";
      setArchivoNuevo(null);
      return;
    }

    setArchivoNuevo(file);
  }

  function quitarArchivo() {
    setArchivoNuevo(null);
    setArchivoError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function quitarDocumentoExistente() {
    setDocumentoEliminado(true);
    setArchivoError("");
    setArchivoNuevo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function guardar() {
    const camposFaltantes = [];

    if (!form.nombre.trim()) {
      camposFaltantes.push("Nombre del convenio");
    }
    if (!form.inicio) {
      camposFaltantes.push("Fecha de inicio");
    }
    if (!form.fin) {
      camposFaltantes.push("Fecha de fin");
    }

    if (camposFaltantes.length > 0) {
      setAdvertencia(`Por favor completa los siguientes campos: ${camposFaltantes.join(", ")}.`);
      return;
    }

    setAdvertencia("");
    onGuardar(form, archivoNuevo, documentoEliminado);
  }

  const esEdicion = !!convenio;
  const documentoExistente = convenio?.documento_nombre || null;

  return (
    <div className="modal-bg">
      <div className="modal-caja modal-grande">
        <button className="modal-close" onClick={onCerrar}>✕</button>
        <p className="modal-titulo">{esEdicion ? "Editar Convenio" : "Nuevo Convenio"}</p>

        {advertencia && <p className="login-error">{advertencia}</p>}

        <div className="modal-grid">
          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Nombre del convenio *</label>
            <textarea
              className="modal-textarea"
              rows={2}
              value={form.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
          </div>

          <div className="modal-campo">
            <label className="modal-label">Ámbito *</label>
            <select className="modal-select" value={form.ambito} onChange={(e) => cambiar("ambito", e.target.value)}>
              <option value="Nacional">Nacional</option>
              <option value="Internacional">Internacional</option>
            </select>
          </div>

          <div className="modal-campo">
            <label className="modal-label">Tipo de convenio *</label>
            <select className="modal-select" value={form.tipo} onChange={(e) => cambiar("tipo", e.target.value)}>
              <option value="Convenio marco">Convenio Marco</option>
              <option value="Convenio especifico">Convenio Específico</option>
            </select>
          </div>

          <div className="modal-campo">
            <label className="modal-label">Fecha de inicio *</label>
            <input type="date" className="modal-input" value={form.inicio} onChange={(e) => cambiar("inicio", e.target.value)} />
          </div>

          <div className="modal-campo">
            <label className="modal-label">Fecha de fin *</label>
            <input type="date" className="modal-input" value={form.fin} onChange={(e) => cambiar("fin", e.target.value)} />
          </div>

          <div className="modal-campo">
            <label className="modal-label">Duración</label>
            <input type="text" className="modal-input" value={form.duracion} onChange={(e) => cambiar("duracion", e.target.value)} placeholder="Ej: 5 años" />
          </div>

          <div className="modal-campo">
            <label className="modal-label">Resolución</label>
            <input type="text" className="modal-input" value={form.resolucion} onChange={(e) => cambiar("resolucion", e.target.value)} placeholder="Ej: N° 0001-2024-UNDAC-CU" />
          </div>

          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Tipo de oportunidades</label>
            <div className="modal-checks">
              {OPORTUNIDADES.map((op) => (
                <label key={op.key} className="modal-check-item">
                  <input type="checkbox" checked={!!form[op.key]} onChange={() => toggleOp(op.key)} />
                  <span>{op.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Otros (descripción de oportunidad)</label>
            <input type="text" className="modal-input" value={form.otros || form.Otros || ""} onChange={(e) => cambiar("otros", e.target.value)} placeholder="Ej: intercambio cultural" />
          </div>

          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Resultados obtenidos</label>
            <textarea className="modal-textarea" rows={3} value={form.resultados || form.Resultados || ""} onChange={(e) => cambiar("resultados", e.target.value)} placeholder="Describa los resultados obtenidos..." />
          </div>

          <div className="modal-campo modal-campo-full">
            <label className="modal-label">Documento adjunto (PDF, Word, imagen — máx. {MAX_MB} MB)</label>
            <input ref={fileInputRef} type="file" accept={TIPOS_PERMITIDOS} onChange={cambiarArchivo} className="modal-input" />

            {esEdicion && documentoExistente && !archivoNuevo && !documentoEliminado && (
              <div className="alerta-archivo alerta-existente" style={{ marginTop: 8 }}>
                <span>📄</span>
                <span className="nombre-archivo-texto">{documentoExistente}</span>
                <button type="button" className="btn-archivo btn-descargar" onClick={() => conveniosAPI.previsualizarDocumento(convenio.id)}>
                  Previsualizar
                </button>
                <button type="button" className="btn-archivo btn-descargar" onClick={() => conveniosAPI.descargarDocumento(convenio.id, documentoExistente)}>
                  Descargar
                </button>
                <button type="button" className="btn-archivo btn-eliminar-2" onClick={quitarDocumentoExistente} title="Eliminar archivo">
                  Eliminar
                </button>
              </div>
            )}

            {esEdicion && documentoEliminado && (
              <div className="alerta-archivo alerta-eliminado" style={{ marginTop: 8 }}>
                <span>Documento marcado para eliminación.</span>
              </div>
            )}

            {archivoNuevo && (
              <div className="alerta-archivo alerta-nuevo" style={{ marginTop: 8 }}>
                <span>📎</span>
                <span className="nombre-archivo-texto azul">{archivoNuevo.name}</span>
                <button type="button" className="btn-quitar-nuevo" onClick={quitarArchivo} title="Quitar archivo">✕</button>
              </div>
            )}

            {archivoError && <p className="error-archivo-texto">{archivoError}</p>}
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
