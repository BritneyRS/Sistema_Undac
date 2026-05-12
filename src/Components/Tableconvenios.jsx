import React, { useState } from "react";
import SemaforoP from "./SemaforoP";
import { formatearFecha } from "../utils/semaforo";
import style from "../Styles/style.css";

/* SECCION TIPO */
function TipoBadge({ tipo }) {

  const mapa = {

    "CONVENIO MARCO": {
      bg: "#eff6ff",
      color: "#1d4ed8",
      label: "Marco",
    },

    "CONVENIO ESPECÍFICO": {
      bg: "#fffbeb",
      color: "#92400e",
      label: "Específico",
    },

    MEMORANDO: {
      bg: "#f5f3ff",
      color: "#6d28d9",
      label: "Memorando",
    },

  };

  const e = mapa[tipo] || {
    bg: "#f3f4f6",
    color: "#374151",
    label: tipo,
  };

  return (
    <span
      className="tipo-badge"
      style={{
        background: e.bg,
        color: e.color,
      }}
    >
      {e.label}
    </span>
  );
}
/*SECCION AMBITO*/
function AmbitoBadge({ ambito }) {

  const es =
    ambito === "nacional"
      ? {
          bg: "#f0fdf4",
          color: "#15803d",
          label: "Nacional",
        }
      : {
          bg: "#fff7ed",
          color: "#c2410c",
          label: "Internacional",
        };

  return (
    <span
      className="ambito-badge"
      style={{
        background: es.bg,
        color: es.color,
      }}
    >
      {es.label}
    </span>
  );
}
/*SECCION OPORTUNIDAD*/
function OportunidadCell({ convenio, onEditarOtros }) {

  const activas = OPORTUNIDADES.filter(
    (o) => convenio[o.key]
  );

  return (
    <div className="oportunidad-container">

      {activas.map((o) => (

        <span
          key={o.key}
          className="op-tag"
        >
          {o.label}
        </span>

      ))}

      {convenio.otros ? (

        <span
          title={convenio.otros}
          onClick={() => onEditarOtros(convenio.id)}
          className="op-tag op-otros"
        >
          Otros ✎
        </span>

      ) : (

        <span
          onClick={() => onEditarOtros(convenio.id)}
          className="op-tag op-agregar"
        >
          + Otros
        </span>

      )}

      {activas.length === 0 && !convenio.otros && (
        <span className="sin-registro">
          —
        </span>
      )}

    </div>
  );
}
/*SECCION MODAL*/
function ModalOtros({
  convenioId,
  valorActual,
  onGuardar,
  onCerrar,
}) {

  const [texto, setTexto] = useState(valorActual || "");

  return (
    <div className="modal-bg">

      <div className="modal-caja">

        <p className="modal-titulo">
          Campo "Otros" — tipo de oportunidad
        </p>

        <label className="modal-label">
          Describe el tipo de oportunidad adicional
        </label>

        <textarea
          className="modal-textarea"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: Intercambio cultural..."
          rows={4}
          autoFocus
        />

        <div className="modal-btns">

          <button
            className="btn-cancelar"
            onClick={onCerrar}
          >
            Cancelar
          </button>

          <button
            className="btn-guardar"
            onClick={() =>
              onGuardar(convenioId, texto.trim())
            }
          >
            Guardar
          </button>

        </div>

      </div>

    </div>
  );
}