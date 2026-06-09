import React, { useEffect, useState } from "react";

// Valores vacíos por defecto para el formulario
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
  numero_expediente: "",
  numero_resolucion: "",
  numerosiaf: "",
};

// Opciones de semestre
const SEMESTRES = ["IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// Opciones de EFP / Escuela (raw) — se parsea a carreras y sedes
const EFP_OPCIONES_RAW = [
  "E.F.P. Derecho y Ciencias Políticas - Pasco",
  "E.F.P. Derecho y Ciencias Políticas - Puerto Bermudez",
  "E.F.P. Ciencias de la Comunicación - La merced",
  "E.F.P. Ciencias de la Comunicación - Pasco",
  "E.F.P. De Administración - Oxapampa",
  "E.F.P. De Administración - Pasco",
  "E.F.P. De Medicina Humana - Pasco",
  "E.F.P. Ingenieira de minas - Pasco",
  "E.F.P. De Medicina Humana- Pasco",
  "E.F.P. De Odontología - Pasco",
  "E.F.P. De Industrias Alimentarias - La Merced",
  "E.F.P. De Zootecnia - Pasco",
  "E.F.P. De Zootecnia - Pasco",
  "E.F.P. De Agronomia- Oxapampa",
  "E.F.P. De Agronomia- Yanahuanca",
  "E.F.P. De Agronomia- Paucartambo",
  "E.F.P. De Agronomia- La Merced",
  "E.F.P. De Agronomia- La Merced",
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
  "Otra",
];

// Parsear raw a estructura { full, carrera, sede }
const EFP_PARSED = EFP_OPCIONES_RAW.map((s) => {
  const parts = s.split(" - ");
  return {
    full: s,
    carrera: parts[0].trim(),
    sede: parts[1] ? parts[1].trim() : "",
  };
});

// Lista de cadenas completas para compatibilidad con registros existentes
const EFP_OPCIONES = EFP_PARSED.map((p) => p.full);

// Lista única de carreras (sin sedes) y mapa carrera -> sedes
const CARRERAS = Array.from(new Set(EFP_PARSED.map((p) => p.carrera))).filter(Boolean);
if (!CARRERAS.includes("Otra")) CARRERAS.push("Otra");

const SEDES_MAP = EFP_PARSED.reduce((acc, p) => {
  acc[p.carrera] = acc[p.carrera] || new Set();
  if (p.sede) acc[p.carrera].add(p.sede);
  return acc;
}, {});

export default function ModalMovilidad({
  registro,
  movilidad,
  onGuardar,
  onCerrar,
}) {
  const registroActual = registro ?? movilidad;
  const [form, setForm] = useState(VACIO);
  const [escuelaPersonal, setEscuelaPersonal] = useState("");
  const [selectedCareer, setSelectedCareer] = useState("");
  const [selectedSede, setSelectedSede] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

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
        numero_expediente: registroActual.numeroexpediente || "",
        numero_resolucion: registroActual.numeroresolucion || "",
        numerosiaf: registroActual.numerosiaf || "",
      });

      // Si la escuela coincide con alguna de las opciones completas, extraer carrera y sede
      const matched = EFP_PARSED.find((p) => p.full === registroActual.escuela)
        || EFP_PARSED.find((p) => p.carrera === registroActual.escuela);

      if (matched) {
        setSelectedCareer(matched.carrera || "");
        setSelectedSede(matched.sede || "");
        setEscuelaPersonal("");
        setForm((prev) => ({
          ...prev,
          escuela: matched.full,
        }));
      } else if (!EFP_OPCIONES.slice(0, -1).includes(registroActual.escuela)) {
        setEscuelaPersonal(registroActual.escuela || "");
        setSelectedCareer("Otra");
        setSelectedSede("");
        setForm((prev) => ({
          ...prev,
          escuela: "Otra",
        }));
      } else {
        setEscuelaPersonal("");
      }
    } else {
      setForm(VACIO);
      setEscuelaPersonal("");
    }
  }, [registroActual]);

  function cambiar(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "beca" && value === "no" ? { tipo_beca: "" } : {}),
    }));

    if (errores[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "beca" && value === "no") {
      setErrores((prev) => ({
        ...prev,
        tipo_beca: "",
      }));
    }
  }

  function cambiarCarrera(e) {
    const value = e.target.value;
    setSelectedCareer(value);
    setEscuelaPersonal("");
    if (errores.escuela) setErrores((prev) => ({ ...prev, escuela: "" }));

    if (value === "") {
      setSelectedSede("");
      setForm((prev) => ({ ...prev, escuela: "" }));
      return;
    }

    if (value === "Otra") {
      setSelectedSede("");
      setForm((prev) => ({ ...prev, escuela: "Otra" }));
      return;
    }

    const sedes = SEDES_MAP[value] ? Array.from(SEDES_MAP[value]) : [];
    const sede = sedes.length ? sedes[0] : "";
    setSelectedSede(sede);
    const combined = value + (sede ? " - " + sede : "");
    setForm((prev) => ({ ...prev, escuela: combined }));
  }

  function cambiarSede(e) {
    const sede = e.target.value;
    setSelectedSede(sede);
    if (errores.escuela) setErrores((prev) => ({ ...prev, escuela: "" }));
    const combined = selectedCareer + (sede ? " - " + sede : "");
    setForm((prev) => ({ ...prev, escuela: combined }));
  }

  function validar() {
    const err = {};

    if (!form.nombres.trim()) {
      err.nombres = "Obligatorio";
    }

    if (!form.semestre) {
      err.semestre = "Obligatorio";
    }

    if (!form.escuela) {
      err.escuela = "Obligatorio";
    }

    if (!form.universidad_destino.trim()) {
      err.universidad_destino = "Obligatorio";
    }

    if (!form.ciudad_destino.trim()) {
      err.ciudad_destino = "Obligatorio";
    }

    if (form.beca === "si" && !form.tipo_beca.trim()) {
      err.tipo_beca = "Obligatorio";
    }

    return err;
  }

  function enviar(e) {
    e.preventDefault();

    const err = validar();

    if (Object.keys(err).length > 0) {
      setErrores(err);
      return;
    }

    setGuardando(true);

    const datosFinales = {
      nombres: form.nombres.trim(),
      semestre: form.semestre,
      celular: form.celular || null,
      escuela: form.escuela === "Otra" ? escuelaPersonal.trim() : form.escuela,
      periodo: form.periodo || null,
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
    };

    setTimeout(() => {
      onGuardar(datosFinales);
      setGuardando(false);
    }, 400);
  }

  const esEdicion = !!registroActual?.id;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div>
            <p className="modal-title">
              {esEdicion ? "Editar registro de movilidad" : "Nuevo registro"}
            </p>
          </div>
        </div>
        

        <form onSubmit={enviar} className="modal-body">
          <Seccion titulo="Datos del estudiante" clase="section-blue" />

          <div className="grid-2">
            <Campo label="Nombres y Apellidos *" error={errores.nombres}>
              <input
                className={`form-input ${errores.nombres ? "error" : ""}`}
                name="nombres"
                value={form.nombres}
                onChange={cambiar}
                placeholder="Nombres y apellidos completos"
              />
            </Campo>

            <Campo label="Semestre *" error={errores.semestre}>
              <select
                className={`form-input ${errores.semestre ? "error" : ""}`}
                name="semestre"
                value={form.semestre}
                onChange={cambiar}
              >
                <option value="">— Seleccionar —</option>
                {SEMESTRES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="grid-3">
            <Campo label="N° Celular">
              <input
                className="form-input"
                name="celular"
                value={form.celular}
                onChange={cambiar}
                maxLength={9}
              />
            </Campo>

            <Campo label="Período (Ej: 2026-A)">
              <input
                className="form-input"
                name="periodo"
                value={form.periodo}
                onChange={cambiar}
              />
            </Campo>
          </div>

          <Campo
            label="E.F.P. UNDAC (Escuela de Formación Profesional) *"
            error={errores.escuela}
          >
            <select
              className={`form-input ${errores.escuela ? "error" : ""}`}
              name="escuela_carrera"
              value={selectedCareer}
              onChange={cambiarCarrera}
            >
              <option value="">— Seleccionar escuela —</option>
              {CARRERAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Campo>

          {selectedCareer && selectedCareer !== "Otra" && SEDES_MAP[selectedCareer] && (
            <Campo label="Sede">
              <select
                className="form-input"
                name="escuela_sede"
                value={selectedSede}
                onChange={cambiarSede}
              >
                <option value="">— Seleccionar sede —</option>
                {Array.from(SEDES_MAP[selectedCareer]).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
              <input
                className="form-input"
                name="universidad_origen"
                value={form.universidad_origen}
                onChange={cambiar}
              />
            </Campo>

            <Campo label="Ciudad">
              <input
                className="form-input"
                name="ciudad_origen"
                value={form.ciudad_origen}
                onChange={cambiar}
              />
            </Campo>
          </div>

          <Seccion titulo="Universidad de Destino" clase="section-green" />

          <div className="grid-2">
            <Campo
              label="Nombre de la Universidad *"
              error={errores.universidad_destino}
            >
              <input
                className={`form-input ${errores.universidad_destino ? "error" : ""}`}
                name="universidad_destino"
                value={form.universidad_destino}
                onChange={cambiar}
              />
            </Campo>

            <Campo label="Ciudad *" error={errores.ciudad_destino}>
              <input
                className={`form-input ${errores.ciudad_destino ? "error" : ""}`}
                name="ciudad_destino"
                value={form.ciudad_destino}
                onChange={cambiar}
              />
            </Campo>
          </div>

          <Seccion titulo="Movilidad y financiamiento" clase="section-orange" />

          <div className="grid-3">
            <Campo label="Estado">
              <select
                className="form-input"
                name="estado"
                value={form.estado}
                onChange={cambiar}
              >
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="finalizado">Finalizado</option>
                <option value="Desistido">Desistido</option>
              </select>
            </Campo>

            <Campo label="Apoyo económico (S/)">
              <input
                className="form-input"
                type="number"
                name="apoyo_economico"
                value={form.apoyo_economico}
                onChange={cambiar}
                min={0}
              />
            </Campo>
          </div>

          <Seccion titulo="Beca" clase="section-blue" />

          <div className="grid-2">
            <Campo label="¿Tiene beca? *">
              <select
                className="form-input"
                name="beca"
                value={form.beca}
                onChange={cambiar}
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </Campo>

            {form.beca === "si" && (
              <Campo label="Tipo de beca" error={errores.tipo_beca}>
                <input
                  className={`form-input ${errores.tipo_beca ? "error" : ""}`}
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
              <input
                className="form-input"
                name="numero_expediente"
                value={form.numero_expediente}
                onChange={cambiar}
              />
            </Campo>

            <Campo label="N° de resolución">
              <input
                className="form-input"
                name="numero_resolucion"
                value={form.numero_resolucion}
                onChange={cambiar}
              />
            </Campo>

            <Campo label="N° de SIAF">
              <input
                className="form-input"
                name="numerosiaf"
                value={form.numerosiaf}
                onChange={cambiar}
              />
            </Campo>
          </div>
          

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

// ========================================
// COMPONENTE SECCION
// ========================================

function Seccion({ titulo, clase }) {
  return <p className={`section-title ${clase}`}>{titulo}</p>;
}

// ========================================
// COMPONENTE CAMPO
// ========================================

function Campo({ label, error, children }) {
  return (
    <div className="form-group">
      <label className={`form-label ${error ? "error" : ""}`}>{label}</label>

      {children}

      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
