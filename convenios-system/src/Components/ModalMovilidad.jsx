import React, { useEffect, useState, useRef } from "react";
import { movilidadesAPI } from "../utils/api";


const VACIO = {
  nombres: "",
  semestre: "",
  celular: "",
  escuela: "",
  universidad_origen: "Universidad Nacional Daniel Alcides Carrión",
  ciudad_origen: "Pasco",
  universidad_destino: "",
  ciudad_destino: "",
  estado: "activo",
  apoyo_economico: "",
  beca: "no",
  tipo_beca: "",
  periodo: "",
  intercambio: "1",
  numero_expediente: "",
  numero_resolucion: "",
  numerosiaf: "",
  observacion: "",
  movilidad: 1,
  es_internacional: false, // <-- MODIFICADO: Agregado valor inicial
};

const SEMESTRES = ["IV","V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const EFP_OPCIONES_RAW = [
  "E.F.P. De Derecho y Ciencias Políticas - Pasco",
  "E.F.P. De Derecho y Ciencias Políticas - Puerto Bermudez",
  "E.F.P. De Ciencias de la Comunicación - Pasco",
  "E.F.P. De Ciencias de la Comunicación - La Merced",
  "E.F.P. De Administración - Pasco",
  "E.F.P. De Administración - Oxapampa",
  "E.F.P. De Medicina Humana - Pasco",
  "E.F.P. De Ingeniería de minas - Pasco",
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
  "E.F.P. De Educación Secundaria Especialidad de Comunicación y Literatura - Pasco",
  "E.F.P. De Educación Primaria - Oxapampa",
  "E.F.P. De Educación Primaria - Yanahuanca",
  "E.F.P. De Educación Primaria - Pasco",
  "E.F.P. De Educación Inicial - Pasco",
];

const EFP_PARSED = EFP_OPCIONES_RAW.map((s) => {
  const parts = s.split(" - ");
  return { full: s, carrera: parts[0].trim(), sede: parts[1] ? parts[1].trim() : "" };
});

const EFP_OPCIONES = EFP_PARSED.map((p) => p.full);
const CARRERAS = Array.from(new Set(EFP_PARSED.map((p) => p.carrera))).filter(Boolean);

const SEDES_MAP = EFP_PARSED.reduce((acc, p) => {
  acc[p.carrera] = acc[p.carrera] || new Set();
  if (p.sede) acc[p.carrera].add(p.sede);
  return acc;
}, {});

// ──────────────────────────────────────────────────────────────
// TIPOS DE ARCHIVO PERMITIDOS (para mostrar al usuario)
// ──────────────────────────────────────────────────────────────
const TIPOS_PERMITIDOS = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
const MAX_MB = 10;

export default function ModalMovilidad({ registro, movilidad, onGuardar, onCerrar }) {
  const registroActual = registro ?? movilidad;
  const [form, setForm] = useState(VACIO);
  const [escuelaPersonal, setEscuelaPersonal] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedSede, setSelectedSede] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [advertencia, setAdvertencia] = useState("");

  // ── Estado para documentos adjuntos ────────────────────────
  const [archivoNuevo1, setArchivoNuevo1] = useState(null);
  const [archivoError1, setArchivoError1] = useState("");
  const [documentoEliminado1, setDocumentoEliminado1] = useState(false);
  const fileInputRef1 = useRef(null);

  const [archivoNuevo2, setArchivoNuevo2] = useState(null);
  const [archivoError2, setArchivoError2] = useState("");
  const [documentoEliminado2, setDocumentoEliminado2] = useState(false);
  const fileInputRef2 = useRef(null);

  useEffect(() => {
    if (registroActual) {
      setForm({
        ...VACIO,
        nombres: registroActual.nombres || "",
        semestre: registroActual.semestre || "",
        celular: registroActual.celular || "",
        escuela: registroActual.escuela || "",
        universidad_origen: registroActual.universidadorigen || VACIO.universidad_origen,
        ciudad_origen: registroActual.ciudadorigen || VACIO.ciudad_origen,
        universidad_destino: registroActual.universidaddestino || "",
        ciudad_destino: registroActual.ciudaddestino || "",
        estado: registroActual.estado || "activo",
        apoyo_economico: registroActual.apoyoeconomico || "",
        beca: registroActual.beca || "no",
        tipo_beca: registroActual.tipobeca || "",
        periodo: registroActual.periodo || "",
        intercambio: registroActual.intercambio || "1",
        numero_expediente: registroActual.numeroexpediente || "",
        numero_resolucion: registroActual.numeroresolucion || "",
        numerosiaf: registroActual.numerosiaf || "",
        observacion: registroActual.observacion || "",
        movilidad: registroActual.movilidad || 1,
        es_internacional: registroActual.es_internacional ?? false, // <-- MODIFICADO: Recuperar de DB
      });

      const matched =
        EFP_PARSED.find((p) => p.full === registroActual.escuela) ||
        EFP_PARSED.find((p) => p.carrera === registroActual.escuela);

      if (matched) {
        setSelectedCareer(matched.carrera || "");
        setSelectedSede(matched.sede || "");
        setEscuelaPersonal("");
        setForm((prev) => ({ ...prev, escuela: matched.full }));
      } else if (!EFP_OPCIONES.slice(0, -1).includes(registroActual.escuela)) {
        setEscuelaPersonal(registroActual.escuela || "");
        setSelectedCareer("Otra");
        setSelectedSede("");
        setForm((prev) => ({ ...prev, escuela: "Otra" }));
      } else {
        setEscuelaPersonal("");
      }
    } else {
      setForm(VACIO);
      setEscuelaPersonal("");
    }
    setAdvertencia("");
    setArchivoNuevo1(null);
    setArchivoError1("");
    setDocumentoEliminado1(false);
    setArchivoNuevo2(null);
    setArchivoError2("");
    setDocumentoEliminado2(false);
  }, [registroActual]);

  function cambiar(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "beca" && value === "no" ? { tipo_beca: "" } : {}),
    }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
    if (name === "beca" && value === "no") setErrores((prev) => ({ ...prev, tipo_beca: "" }));
    if (advertencia) setAdvertencia("");
  }

  function cambiarCarrera(e) {
    const value = e.target.value;
    setSelectedCareer(value);
    setEscuelaPersonal("");
    if (errores.escuela) setErrores((prev) => ({ ...prev, escuela: "" }));
    if (value === "") { setSelectedSede(""); setForm((prev) => ({ ...prev, escuela: "" })); return; }
    if (value === "Otra") { setSelectedSede(""); setForm((prev) => ({ ...prev, escuela: "Otra" })); return; }
    const sedes = SEDES_MAP[value] ? Array.from(SEDES_MAP[value]) : [];
    const sede = sedes.length ? sedes[0] : "";
    setSelectedSede(sede);
    setForm((prev) => ({ ...prev, escuela: value + (sede ? " - " + sede : "") }));
  }

  // Manejo de cambio de Sede
  function cambiarSede(e) {
    const sede = e.target.value;
    setSelectedSede(sede);
    if (errores.escuela) setErrores((prev) => ({ ...prev, escuela: "" }));
    setForm((prev) => ({ ...prev, escuela: selectedCareer + (sede ? " - " + sede : "") }));
  }

  // ── Manejo de archivo ───────────────────────────────────────
  function cambiarArchivo1(e) {
    const file = e.target.files[0];
    setArchivoError1("");
    setDocumentoEliminado1(false);
    if (!file) { setArchivoNuevo1(null); return; }
    if (file.size > MAX_MB * 1024 * 1024) {
      setArchivoError1(`El archivo supera el límite de ${MAX_MB} MB.`);
      e.target.value = "";
      setArchivoNuevo1(null);
      return;
    }
    setArchivoNuevo1(file);
  }

  function cambiarArchivo2(e) {
    const file = e.target.files[0];
    setArchivoError2("");
    setDocumentoEliminado2(false);
    if (!file) { setArchivoNuevo2(null); return; }
    if (file.size > MAX_MB * 1024 * 1024) {
      setArchivoError2(`El archivo supera el límite de ${MAX_MB} MB.`);
      e.target.value = "";
      setArchivoNuevo2(null);
      return;
    }
    setArchivoNuevo2(file);
  }

  function quitarArchivo1() {
    setArchivoNuevo1(null);
    setArchivoError1("");
    if (fileInputRef1.current) fileInputRef1.current.value = "";
  }

  function quitarArchivo2() {
    setArchivoNuevo2(null);
    setArchivoError2("");
    if (fileInputRef2.current) fileInputRef2.current.value = "";
  }

  function quitarDocumentoExistente1() {
    setDocumentoEliminado1(true);
    setArchivoError1("");
    setArchivoNuevo1(null);
    if (fileInputRef1.current) fileInputRef1.current.value = "";
  }

  function quitarDocumentoExistente2() {
    setDocumentoEliminado2(true);
    setArchivoError2("");
    setArchivoNuevo2(null);
    if (fileInputRef2.current) fileInputRef2.current.value = "";
  }

  function validar() {
    const err = {};
    if (!form.nombres.trim()) err.nombres = "Obligatorio";
    if (!form.semestre) err.semestre = "Obligatorio";
    if (!form.escuela) err.escuela = "Obligatorio";
    if (!form.universidad_destino.trim()) err.universidad_destino = "Obligatorio";
    if (!form.ciudad_destino.trim()) err.ciudad_destino = "Obligatorio";
    if (form.beca === "si" && !form.tipo_beca.trim()) err.tipo_beca = "Obligatorio";
    return err;
  }

  function enviar(e) {
    e.preventDefault();
    const err = validar();
    if (Object.keys(err).length > 0) {
      setErrores(err);
      const campos = [];
      if (err.nombres) campos.push("Nombres y Apellidos");
      if (err.semestre) campos.push("Semestre");
      if (err.escuela) campos.push("E.F.P. UNDAC");
      if (err.universidad_destino) campos.push("Universidad de destino");
      if (err.ciudad_destino) campos.push("Ciudad de destino");
      if (err.tipo_beca) campos.push("Tipo de beca");
      setAdvertencia(`Por favor completa los siguientes campos: ${campos.join(", ")}.`);
      return;
    }
    setAdvertencia("");
    setGuardando(true);

    const datosFinales = {
      nombres: form.nombres.trim(),
      semestre: form.semestre,
      celular: form.celular || null,
      escuela: form.escuela === "Otra" ? escuelaPersonal.trim() : form.escuela,
      periodo: form.periodo || null,
      intercambio: form.intercambio || "1",
      universidadorigen: form.universidad_origen || null,
      ciudadorigen: form.ciudad_origen || null,
      universidaddestino: form.universidad_destino || null,
      ciudaddestino: form.ciudad_destino || null,
      apoyoeconomico: form.apoyo_economico || null,
      beca: form.beca,
      tipobeca: form.beca === "si" ? form.tipo_beca.trim() : null,
      estado: form.estado,
      numeroexpediente: form.numero_expediente || null,
      numeroresolucion: form.numero_resolucion || null,
      numerosiaf: form.numerosiaf || null,
      observacion: form.observacion.trim() || null,
      borrar_documento: documentoEliminado1 && !archivoNuevo1 ? "true" : undefined,
      borrar_documento2: documentoEliminado2 && !archivoNuevo2 ? "true" : undefined,
      movilidad: form.movilidad,
      es_internacional: form.es_internacional === "true" || form.es_internacional === true, // <-- MODIFICADO: Envío seguro del valor
    };

    setTimeout(() => {
      onGuardar(datosFinales, archivoNuevo1, archivoNuevo2);
      setGuardando(false);
    }, 400);
  }

  const esEdicion = !!registroActual?.id;
  const documentoExistente = registroActual?.documento_nombre || null;
  const documento2Existente = registroActual?.documento2_nombre || null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button
            className="modal-close"
            onClick={onCerrar}
          >
            ✕
          </button>
        <div className="modal-header">
          <div>
            <p className="modal-title">
              {esEdicion ? "Editar registro de movilidad" : "Nuevo registro"}
            </p>
          </div>
        </div>
        {advertencia && <p className="login-error">{advertencia}</p>}

        <form onSubmit={enviar} className="modal-body">
          <Seccion titulo="Datos del estudiante" clase="section-blue" />

          <div className="grid-2">
            <Campo label="Apellidos y Nombres *">
              <input
                className="form-input"
                name="nombres"
                value={form.nombres}
                onChange={cambiar}
                placeholder="APELLIDOS, nombres completos"
              />
            </Campo>

            <Campo label="Semestre *">
              <select className="form-input" name="semestre" value={form.semestre} onChange={cambiar}>
                <option value="">— Seleccionar —</option>
                {SEMESTRES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
          </div>

          <div className="grid-3">
            <Campo label="N° Celular">
              <input className="form-input" name="celular" value={form.celular} onChange={cambiar} maxLength={9} />
            </Campo>

            <Campo label="Período (Ej: 2026-A)">
              <input className="form-input" name="periodo" value={form.periodo} onChange={cambiar} />
            </Campo>
          </div>

          <Campo label="E.F.P. UNDAC (Escuela de Formación Profesional) *">
            <select className="form-input" name="escuela_carrera" value={selectedCareer} onChange={cambiarCarrera}>
              <option value="">— Seleccionar escuela —</option>
              {CARRERAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Campo>

          {selectedCareer && selectedCareer !== "Otra" && SEDES_MAP[selectedCareer] && (
            <Campo label="Sede">
              <select className="form-input" name="escuela_sede" value={selectedSede} onChange={cambiarSede}>
                <option value="">— Seleccionar sede —</option>
                {Array.from(SEDES_MAP[selectedCareer]).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
          )}

          {form.escuela === "Otra" && (
            <Campo label="Escribe el nombre de la EFP">
              <input
                className="form-input"
                value={escuelaPersonal}
                onChange={(e) => setEscuelaPersonal(e.target.value)}
                placeholder="E.F.P. De ..."
              />
            </Campo>
          )}

          <Seccion titulo="Universidad de Origen" clase="section-indigo" />

          <div className="grid-2">
            <Campo label="Nombre de la Universidad">
              <input className="form-input" name="universidad_origen" value={form.universidad_origen} onChange={cambiar} />
            </Campo>
            <Campo label="Ciudad">
              <input className="form-input" name="ciudad_origen" value={form.ciudad_origen} onChange={cambiar} />
            </Campo>
          </div>

          <Seccion titulo="Universidad de Destino" clase="section-green" />

          <div className="grid-2">
            <Campo label="Nombre de la Universidad *">
              <input className="form-input" name="universidad_destino" value={form.universidad_destino} onChange={cambiar} />
            </Campo>
            <Campo label="Ciudad *">
              <input className="form-input" name="ciudad_destino" value={form.ciudad_destino} onChange={cambiar} />
            </Campo>
          </div>
          {/* MODIFICADO: Agregada la selección de ámbito nacional/internacional en la 3ra columna del grid-3 */}
                      <Campo label="Ámbito de Movilidad">
                        <select 
                          className="form-input" 
                          name="es_internacional" 
                          value={String(form.es_internacional)} 
                          onChange={cambiar}
                        >
                          <option value="false">Nacional</option>
                          <option value="true">Internacional</option>
                        </select>
                      </Campo>
          <Seccion titulo="Movilidad y financiamiento" clase="section-orange" />

          <div className="grid-3">
            <Campo label="Estado">
              <select className="form-input" name="estado" value={form.estado} onChange={cambiar}>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="finalizado">Finalizado</option>
                <option value="desistido">Desistido</option>
              </select>
            </Campo>

            <Campo label="Apoyo económico (S/)">
              <input className="form-input" type="number" name="apoyo_economico" value={form.apoyo_economico} onChange={cambiar} min={0} />
            </Campo>

            
          </div>

          <Seccion titulo="Beca" clase="section-blue" />

          <div className="grid-2">
            <Campo label="¿Tiene beca? *">
              <select className="form-input" name="beca" value={form.beca} onChange={cambiar}>
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </Campo>

            {form.beca === "si" && (
              <Campo label="Tipo de beca">
                <input
                  className="form-input"
                  name="tipo_beca"
                  value={form.tipo_beca}
                  onChange={cambiar}
                  placeholder="Ej: Pronabec-Permanencia"
                />
              </Campo>
            )}
          </div>

          <Seccion titulo="Datos administrativos" clase="section-indigo" />

          <div className="grid-2">
            <Campo label="N° del expediente">
              <input className="form-input" name="numero_expediente" value={form.numero_expediente} onChange={cambiar} />
            </Campo>
            <Campo label="N° de resolución">
              <input className="form-input" name="numero_resolucion" value={form.numero_resolucion} onChange={cambiar} />
            </Campo>
            <Campo label="N° de SIAF">
              <input className="form-input" name="numerosiaf" value={form.numerosiaf} onChange={cambiar} />
            </Campo>
          </div>

          <Seccion titulo="Observaciones y documentos" clase="section-orange" />

          {/* Campo observación */}
          <Campo label="Observación">
            <textarea
              className="form-input"
              name="observacion"
              value={form.observacion}
              onChange={cambiar}
              rows={3}
              placeholder="Ingrese cualquier observación adicional sobre esta movilidad..."
              style={{ resize: "vertical", minHeight: 72 }}
            />
          </Campo>

          {/* Campo documento */}
          <Campo label={<strong>Adjuntar documentos (PDF, Word, imagen — máx. 10 MB cada uno)</strong>}>
            <div className="contenedor-documentos-global">
              
              {/* ================= GRUPO DOCUMENTO 1 ================= */}
              <div className="grupo-documento">
                <label className="form-label">Documento Expediente</label>
                
                <input
                  ref={fileInputRef1}
                  type="file"
                  accept={TIPOS_PERMITIDOS}
                  onChange={cambiarArchivo1}
                  className="form-input input-selector-archivo"
                />
                
                {/* Alerta Verde: Archivo Existente */}
                {esEdicion && documentoExistente && !archivoNuevo1 && !documentoEliminado1 && (
                  <div className="alerta-archivo alerta-existente">
                    <span>📄</span>
                    <span className="nombre-archivo-texto">{documentoExistente}</span>
                    <button type="button" className="btn-archivo btn-descargar" onClick={() => movilidadesAPI.descargarDocumento(registroActual.id, documentoExistente, 1)}>
                      Descargar
                    </button>
                    <button type="button" className="btn-archivo btn-eliminar-2" onClick={quitarDocumentoExistente1} title="Eliminar archivo">
                      Eliminar
                    </button>
                  </div>
                )}

                {/* Alerta Roja: Archivo Eliminado */}
                {esEdicion && documentoEliminado1 && (
                  <div className="alerta-archivo alerta-eliminado">
                    <span>Documento marcado para eliminación.</span>
                  </div>
                )}

                {/* Alerta Azul: Archivo Nuevo Cargado */}
                {archivoNuevo1 && (
                  <div className="alerta-archivo alerta-nuevo">
                    <span>📎</span>
                    <span className="nombre-archivo-texto azul">{archivoNuevo1.name}</span>
                    <button type="button" className="btn-quitar-nuevo" onClick={quitarArchivo1} title="Quitar archivo">✕</button>
                  </div>
                )}
                
                {archivoError1 && <p className="error-archivo-texto">{archivoError1}</p>}
              </div>

              {/* ================= GRUPO DOCUMENTO 2 ================= */}
              <div className="grupo-documento">
                <label className="form-label">Documento Informe</label>
                
                <input
                  ref={fileInputRef2}
                  type="file"
                  accept={TIPOS_PERMITIDOS}
                  onChange={cambiarArchivo2}
                  className="form-input input-selector-archivo"
                />

                {/* Alerta Verde: Archivo Existente */}
                {esEdicion && documento2Existente && !archivoNuevo2 && !documentoEliminado2 && (
                  <div className="alerta-archivo alerta-existente">
                    <span>📄</span>
                    <span className="nombre-archivo-texto">{documento2Existente}</span>
                    <button type="button" className="btn-archivo btn-descargar" onClick={() => movilidadesAPI.descargarDocumento(registroActual.id, documento2Existente, 2)}>
                      Descargar
                    </button>
                    <button type="button" className="btn-archivo btn-eliminar-2" onClick={quitarDocumentoExistente2} title="Eliminar archivo">
                      Eliminar
                    </button>
                  </div>
                )}

                {/* Alerta Roja: Archivo Eliminado */}
                {esEdicion && documentoEliminado2 && (
                  <div className="alerta-archivo alerta-eliminado">
                    <span>Documento informe marcado para eliminación.</span>
                  </div>
                )}

                {/* Alerta Azul: Archivo Nuevo Cargado */}
                {archivoNuevo2 && (
                  <div className="alerta-archivo alerta-nuevo">
                    <span>📎</span>
                    <span className="nombre-archivo-texto azul">{archivoNuevo2.name}</span>
                    <button type="button" className="btn-quitar-nuevo" onClick={quitarArchivo2} title="Quitar archivo">✕</button>
                  </div>
                )}
                
                {archivoError2 && <p className="error-archivo-texto">{archivoError2}</p>}
              </div>

              {/* Formatos aceptados */}
              <p className="formatos-leyenda">
                Formatos aceptados: PDF, DOC, DOCX, PNG, JPG · Máximo {MAX_MB} MB
              </p>
            </div>
          </Campo>

          <div className="modal-buttons">
            <button type="button" className="btn-cancel" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Seccion({ titulo, clase }) {
  return <p className={`section-title ${clase}`}>{titulo}</p>;
}

function Campo({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}