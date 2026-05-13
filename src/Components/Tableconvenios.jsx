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
  { key: "movilidad",       label: "Movilidad y pasantías" },
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

  function guardarOtros(id, texto) {

    setDatos((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, otros: texto }
          : c
      )
    );

    cerrarModal();
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
                "Año",
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
                    onEditarOtros={abrirModal}
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

                  {c.resultados || (

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
            convenioId={modalId}
            valorActual={convenioEditando.otros}
            onGuardar={guardarOtros}
            onCerrar={cerrarModal}
          />

      )}

    </>

  );
}