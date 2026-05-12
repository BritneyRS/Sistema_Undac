import React from "react";
//import semaforop from "./SemaforoP";
import { formatearFecha } from "../utils/semaforo";
import "../Styles/style.css"

//import { conveniosData } from "../data/convenios";

function TipoBadge({ tipo }) {

  const estilos = {

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

  };

  const e = estilos[tipo] || {
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

export default function TableConvenios({ convenios }) {

  if (convenios.length === 0) {

    return (
      <div className="tabla-vacia">
        No hay convenios para mostrar.
      </div>
    );
  }

  return (
    <div className="tabla-wrapper">

      <table className="tabla-convenios">

        <thead>

          <tr>

            {[
              "N°",
              "Nombre del Convenio",
              "Tipo",
              "Ámbito",
              "Inicio",
              "Fin",
              "Duración",
              "Resolución",
              "Semáforo",
            ].map((col) => (

              <th
                key={col}
                className="tabla-th"
              >
                {col}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {convenios.map((c, i) => (

            <tr
              key={c.id}
              className={i % 2 === 0 ? "fila-par" : "fila-impar"}
            >

              <td className="tabla-td numero-columna">
                {i + 1}
              </td>

              <td className="tabla-td nombre-columna">
                {c.nombre}
              </td>

              <td className="tabla-td">
                <TipoBadge tipo={c.tipo} />
              </td>

              <td className="tabla-td ambito-columna">
                {c.ambito}
              </td>

              <td className="tabla-td fecha-columna">
                {formatearFecha(c.inicio)}
              </td>

              <td className="tabla-td fecha-columna">
                {formatearFecha(c.fin)}
              </td>

              <td className="tabla-td fecha-columna">
                {c.duracion}
              </td>

              <td className="tabla-td resolucion-columna">
                {c.resolucion}
              </td>

              <td className="tabla-td">
                <calcularSemaforo fechaFin={c.fin} />
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}