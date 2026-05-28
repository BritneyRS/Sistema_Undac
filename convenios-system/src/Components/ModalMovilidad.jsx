import React, { useState, useEffect } from "react";
//import style from "../Styles/style.css"

// Valores vacíos por defecto para el formulario
const VACIO = {
  nombres_apellidos: "",
  codigo: "",
  semestre: "",
  celular: "",
  efp_undac: "",
  universidad_origen: "Universidad Nacional Daniel Alcides Carrión",
  ciudad_origen: "Pasco",
  universidad_destino: "",
  ciudad_destino: "",
  tipo: "saliente",
  estado: "activo",
  apoyo_economico: "",
  periodo: "",
  observaciones: "",
};

// Opciones de semestre
const SEMESTRES = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

// Opciones de EFP
const EFP_OPCIONES = [
  "E.F.P. De Administración - Pasco",
  "E.F.P. De Economía - Pasco",
  "E.F.P. De Contabilidad - Pasco",
  "E.F.P. De Ciencia de la Comunicación",
  "E.F.P. De Derecho y Ciencias Políticas",
  "E.F.P. De Ingeniería de Sistemas y Computación - Pasco",
  "E.F.P. De Ingeniería de Minas - Pasco",
  "E.F.P. De Ingeniería Civil - Pasco",
  "E.F.P. De Agronomía - Yanahuanca",
  "E.F.P. De Odontología - Pasco",
  "E.F.P. De Enfermería - Pasco",
  "E.F.P. De Educación Secundaria Especialidad de Historia, Ciencias Sociales y Turismo",
  "E.F.P. De Educación Secundaria Especialidad de Filosofía y Psicología Educativa",
  "Otra",
];

export default function ModalMovilidad({
  registro,
  onGuardar,
  onCerrar,
}) {

  const [form, setForm] = useState(VACIO);
  const [efpPersonal, setEfp] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {

    if (registro) {

      setForm({ ...VACIO, ...registro });

      if (!EFP_OPCIONES.slice(0, -1).includes(registro.efp_undac)) {

        setEfp(registro.efp_undac || "");

        setForm(prev => ({
          ...prev,
          efp_undac: "Otra"
        }));

      }

    } else {

      setForm(VACIO);
      setEfp("");

    }

  }, [registro]);

  // ==============================
  // HANDLERS
  // ==============================

  function cambiar(e) {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (errores[name]) {

      setErrores(prev => ({
        ...prev,
        [name]: ""
      }));

    }

  }

  function validar() {

    const err = {};

    if (!form.nombres_apellidos.trim()) {
      err.nombres_apellidos = "Obligatorio";
    }

    if (!form.semestre) {
      err.semestre = "Obligatorio";
    }

    if (!form.efp_undac) {
      err.efp_undac = "Obligatorio";
    }

    if (!form.universidad_destino.trim()) {
      err.universidad_destino = "Obligatorio";
    }

    if (!form.ciudad_destino.trim()) {
      err.ciudad_destino = "Obligatorio";
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
      ...form,
      efp_undac:
        form.efp_undac === "Otra"
          ? efpPersonal
          : form.efp_undac,
    };

    setTimeout(() => {

      onGuardar(datosFinales);

      setGuardando(false);

    }, 400);

  }

  const esEdicion = !!(registro?.id);
// encabezado
  return (

    <div className="modal-overlay">

      <div className="modal-container">

        {/* HEADER */}

        <div className="modal-header">

          <div>

            <p className="modal-title">
              {
                esEdicion
                  ? "Editar registro de movilidad"
                  : "Nuevo registro"
              }
            </p>
          </div>

        </div>

        {/* BODY */}

        <form
          onSubmit={enviar}
          className="modal-body"
        >

          {/* DATOS */}

          <Seccion
            titulo="Datos del estudiante"
            clase="section-blue"
          />

          <div className="grid-2">

            <Campo
              label="Nombres y Apellidos *"
              error={errores.nombres_apellidos}
            >

              <input
                className={`form-input ${
                  errores.nombres_apellidos ? "error" : ""
                }`}
                name="nombres_apellidos"
                value={form.nombres_apellidos}
                onChange={cambiar}
                placeholder="Nombres y apellidos completos"
              />

            </Campo>
            <Campo
              label="Semestre *"
              error={errores.semestre}
            >

              <select
                className={`form-input ${
                  errores.semestre ? "error" : ""
                }`}
                name="semestre"
                value={form.semestre}
                onChange={cambiar}
              >

                <option value="">
                  — Seleccionar —
                </option>

                {SEMESTRES.map(s => (
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
                placeholder="987654321"
                maxLength={9}
              />

            </Campo>

            <Campo label="Período (Ej: 2026-A)">

              <input
                className="form-input"
                name="periodo"
                value={form.periodo}
                onChange={cambiar}
                placeholder="2026-A"
              />

            </Campo>

          </div>

          <Campo
            label="E.F.P. UNDAC (Escuela de Formación Profesional) *"
            error={errores.efp_undac}
          >

            <select
              className={`form-input ${
                errores.efp_undac ? "error" : ""
              }`}
              name="efp_undac"
              value={form.efp_undac}
              onChange={cambiar}
            >

              <option value="">
                — Seleccionar escuela —
              </option>

              {EFP_OPCIONES.map(e => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}

            </select>

          </Campo>

          {/* OTRA EFP */}

          {
            form.efp_undac === "Otra" && (

              <Campo label="Escribe el nombre de la EFP">

                <input
                  className="form-input"
                  value={efpPersonal}
                  onChange={e => setEfp(e.target.value)}
                  placeholder="E.F.P. De ..."
                />

              </Campo>

            )
          }

          {/* ORIGEN */}

          <Seccion
            titulo="Universidad de Origen"
            clase="section-indigo"
          />

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

          {/* DESTINO */}

          <Seccion
            titulo="Universidad de Destino"
            clase="section-green"
          />

          <div className="grid-2">

            <Campo
              label="Nombre de la Universidad *"
              error={errores.universidad_destino}
            >

              <input
                className={`form-input ${
                  errores.universidad_destino ? "error" : ""
                }`}
                name="universidad_destino"
                value={form.universidad_destino}
                onChange={cambiar}
                placeholder="Universidad Nacional del Centro del Perú"
              />

            </Campo>

            <Campo
              label="Ciudad *"
              error={errores.ciudad_destino}
            >

              <input
                className={`form-input ${
                  errores.ciudad_destino ? "error" : ""
                }`}
                name="ciudad_destino"
                value={form.ciudad_destino}
                onChange={cambiar}
                placeholder="Huancayo"
              />

            </Campo>

          </div>

          {/* MOVILIDAD */}

          <Seccion
            titulo="Movilidad y financiamiento"
            clase="section-orange"
          />

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
                <option value="cancelado">Cancelado</option>

              </select>

            </Campo>

            <Campo label="Apoyo económico (S/)">

              <input
                className="form-input"
                type="number"
                name="apoyo_economico"
                value={form.apoyo_economico}
                onChange={cambiar}
                placeholder="3000"
                min={0}
              />

            </Campo>

          </div>

          {/* BOTONES */}

          <div className="modal-buttons">

            <button
              type="button"
              className="btn-cancel"
              onClick={onCerrar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-save"
              disabled={guardando}
            >
              {
                guardando
                  ? "Guardando..."
                  : esEdicion
                    ? "Actualizar"
                    : "Registrar"
              }
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

  return (
    <p className={`section-title ${clase}`}>
      {titulo}
    </p>
  );

}

// ========================================
// COMPONENTE CAMPO
// ========================================

function Campo({
  label,
  error,
  children
}) {

  return (

    <div className="form-group">

      <label
        className={`form-label ${
          error ? "error" : ""
        }`}
      >
        {label}
      </label>

      {children}

      {
        error && (
          <span className="form-error">
            {error}
          </span>
        )
      }

    </div>

  );

}