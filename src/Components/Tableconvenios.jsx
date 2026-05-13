import React, { useState } from "react";
import SemaforoP from "./SemaforoP";
import { formatearFecha } from "../utils/semaforo";
import style from "../Styles/style.css";

const OPORTUNIDADES = [
  { key: "practicas",       label: "Prácticas" },
  { key: "investigaciones", label: "Investigaciones" },
  { key: "proyeccion",      label: "Proyección social" },
  { key: "capacitacion",    label: "Capacitación" },
  { key: "laboral",         label: "Oportunidad laboral" },
  { key: "movilidad",       label: "Movilidad" },
  { key: "pasantia",       label: "Pasantías" },
];
/* SECCION TIPO */
function TipoBadge({ tipo }) {

  const mapa = {

    "CONVENIO MARCO": {bg: "#eff6ff",color: "#1d4ed8",label: "Marco"},

    "CONVENIO ESPECÍFICO": {
      bg: "#fffbeb",
      color: "#92400e",
      label: "Específico",
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
    ambito === "Nacional"
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
function OportunidadCell({ convenio, onVerOtros }) {

  const activas = OPORTUNIDADES.filter(
    (o) => convenio[o.key]
  );

  const otros = convenio.otros || convenio.Otros;

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

      {otros && (

        <span
          onClick={() => onVerOtros(convenio.id)}
          className="op-tag op-otros"
          style={{ cursor: "pointer" }}
        >
          Otros
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
  valorActual,
  onCerrar,
}) {

  return (
    <div className="modal-bg">

      <div className="modal-caja">

        <p className="modal-titulo">
          Tipo de oportunidad: 
        </p>

        <div className="modal-texto">
          {valorActual}
        </div>

        <div className="modal-btns">

          <button
            className="btn-cerrar"
            onClick={onCerrar}
          >
            Cerrar
          </button>

        </div>

      </div>

    </div>
  );
}

// ─── Componente principal ───────────────────────────────

export default function Tableconvenios({
  convenios: conveniosProp,
}) {

  const [datos, setDatos] =
    useState(conveniosProp);

  const [modalId, setModalId] =
    useState(null);


  React.useEffect(() => {

    setDatos(conveniosProp);

  }, [conveniosProp]);


  function abrirModal(id) {
    setModalId(id);
  }

  function cerrarModal() {
    setModalId(null);
  }

  const convenioEditando =
    datos.find((c) => c.id === modalId);


  if (datos.length === 0) {

    return (
      <div className="vacio">
        No hay convenios para mostrar.
      </div>
    );

  }


  return (

    <>

      <div className="wrapper">

        <table className="tabla">

          <thead>

            <tr>

              {[
                "N°",
                "Nombre del convenio",
                "Ámbito",
                "Tipo de oportunidad",
                "Tipo de convenio",
                "Inicio",
                "Fin",
                "Duración",
                "Resolución",
                "Semáforo",
                "Resultados obtenidos",
              ].map((col) => (

                <th
                  key={col}
                  className="th"
                >
                  {col}
                </th>

              ))}

            </tr>

          </thead>


          <tbody>

            {datos.map((c, i) => (

              <tr
                key={c.id}
                className={
                  i % 2 === 0
                    ? "tr-par"
                    : "tr-impar"
                }
              >

                <td className="td td-numero">
                  {i + 1}
                </td>

                <td className="td">
                  {c.nombre}
                </td>

                <td className="td">
                  <AmbitoBadge ambito={c.ambito} />
                </td>

                <td className="td">
                  <OportunidadCell
                    convenio={c}
                    onVerOtros={abrirModal}
                  />
                </td>

                <td className="td">
                  <TipoBadge tipo={c.tipo} />
                </td>

                <td className="td td-fecha">
                  {formatearFecha(c.inicio)}
                </td>

                <td className="td td-fecha">
                  {formatearFecha(c.fin)}
                </td>

                <td className="td td-fecha">
                  {c.duracion}
                </td>

                <td className="td td-resolucion">
                  {c.resolucion}
                </td>

                <td className="td">
                  <SemaforoP fechaFin={c.fin} />
                </td>

                <td className="td td-resultados">

                  {c.Resultados || (

                    <span className="sin-registro">
                      Sin registro
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {modalId !== null &&
        convenioEditando && (

          <ModalOtros
            valorActual={convenioEditando.otros || convenioEditando.Otros}
            onCerrar={cerrarModal}
          />

      )}

    </>

  );
}