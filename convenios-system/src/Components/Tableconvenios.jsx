import React, { useState } from "react";
import SemaforoP from "./SemaforoP";
import { formatearFecha } from "../utils/semaforo";
import { FaEdit, FaTrash, FaDownload, FaEye } from "react-icons/fa";
import { conveniosAPI } from "../utils/api";
import style from "../Styles/style.css";

const OPORTUNIDADES = [
  { key: "practicas",       label: "Prácticas" },
  { key: "investigaciones", label: "Investigaciones" },
  { key: "proyeccion",      label: "Proyección social" },
  { key: "capacitacion",    label: "Capacitación" },
  { key: "laboral",         label: "Oportunidad laboral" },
  { key: "movilidad",       label: "Movilidad" },
  { key: "pasantia",        label: "Pasantías" },
];

function TipoBadge({ tipo }) {
  const mapa = {
    "CONVENIO MARCO":      { bg: "#eff6ff", color: "#1d4ed8", label: "Convenio Marco" },
    "CONVENIO ESPECÍFICO": { bg: "#fffbeb", color: "#aa4b0f", label: "Específico" },
  };
  const e = mapa[tipo?.toUpperCase()] || { bg: "#f3f4f6", color: "#374151", label: tipo };
  return (
    <span className="tipo-badge" style={{ background: e.bg, color: e.color }}>
      {e.label}
    </span>
  );
}

function AmbitoBadge({ ambito }) {
  const es =
    ambito === "Nacional"
      ? { bg: "#f0fdf4", color: "#15803d", label: "Nacional" }
      : { bg: "#fff7ed", color: "#c2410c", label: "Internacional" };
  return (
    <span className="ambito-badge" style={{ background: es.bg, color: es.color }}>
      {es.label}
    </span>
  );
}

function OportunidadCell({ convenio, onVerOtros }) {
  const activas = OPORTUNIDADES.filter((o) => convenio[o.key]);
  const otros = convenio.otros || convenio.Otros;
  return (
    <div className="oportunidad-container">
      {activas.map((o) => (
        <span key={o.key} className="op-tag">{o.label}</span>
      ))}
      {otros && (
        <span onClick={() => onVerOtros(convenio.id)} className="op-tag op-otros" style={{ cursor: "pointer" }}>
          Otros
        </span>
      )}
      {activas.length === 0 && !otros && (
        <span className="sin-registro">—</span>
      )}
    </div>
  );
}

function ModalOtros({ valorActual, onCerrar }) {
  return (
    <div className="modal-bg">
      <div className="modal-caja">
        <p className="modal-titulo">Tipo de oportunidad:</p>
        <div className="modal-texto">{valorActual}</div>
        <div className="modal-btns">
          <button className="btn-cerrar" onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function Tableconvenios({ convenios: conveniosProp, esAdmin, onEditar, onEliminar }) {
  const [datos, setDatos] = useState(conveniosProp);
  const [modalId, setModalId] = useState(null);

  React.useEffect(() => {
    setDatos(conveniosProp);
  }, [conveniosProp]);

  const convenioModal = datos.find((c) => c.id === modalId);

  const columnas = [
    "N°", "Nombre del convenio", "Convenio", "Tipo de oportunidad",
    "Tipo de convenio", "Inicio", "Fin", "Duración", "Resolución",
    "Semáforo", "Resultados obtenidos", "Documento",
    ...(esAdmin ? ["Acciones"] : []),
  ];

  if (datos.length === 0) {
    return <div className="vacio">No hay convenios para mostrar.</div>;
  }

  return (
    <>
      <div className="wrapper">
        <table className="tabla">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col} className="th">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "tr-par" : "tr-impar"}>
                <td className="td td-numero">{i + 1}</td>
                <td className="td">{c.nombre}</td>
                <td className="td"><AmbitoBadge ambito={c.ambito} /></td>
                <td className="td">
                  <OportunidadCell convenio={c} onVerOtros={setModalId} />
                </td>
                <td className="td"><TipoBadge tipo={c.tipo} /></td>
                <td className="td td-fecha">{formatearFecha(c.inicio)}</td>
                <td className="td td-fecha">{formatearFecha(c.fin)}</td>
                <td className="td td-fecha">{c.duracion}</td>
                <td className="td td-resolucion">{c.resolucion}</td>
                <td className="td"><SemaforoP fechaFin={c.fin} /></td>
                <td className="td td-resultados">
                  {c.resultados || c.Resultados || <span className="sin-registro">Sin registro</span>}
                </td>
                {/*Documento*/}
                <td className="td-do">
                  {c.documento_nombre ? (
                    
                    <div className="docpre">
                      <button
                        type="button"
                        className="con-btn-doc btn-previsualizar"
                        onClick={() => conveniosAPI.previsualizarDocumento(c.id)}
                        title="ver"
                      >
                        <FaEye className="icono-documento" />
                        
                      </button>
                      <button
                        type="button"
                        className="con-btn-doc"
                        onClick={() => conveniosAPI.descargarDocumento(c.id, c.documento_nombre)}
                        title={c.documento_nombre}
                      >
                        <FaDownload />
                        <span className="nombre-documento">
                          {c.documento_nombre}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <span className="sin-registro">Sin archivo</span>
                  )}
                </td>
                {esAdmin && (
                  <td className="td td-acciones">
                    <button className="btn-accion btn-editar" onClick={() => onEditar(c)} title="Editar">
                      <FaEdit />
                    </button>
                    <button className="btn-accion btn-eliminar-icon" onClick={() => onEliminar(c.id)} title="Eliminar">
                      <FaTrash />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalId !== null && convenioModal && (
        <ModalOtros
          valorActual={convenioModal.otros || convenioModal.Otros}
          onCerrar={() => setModalId(null)}
        />
      )}
    </>
  );
}
