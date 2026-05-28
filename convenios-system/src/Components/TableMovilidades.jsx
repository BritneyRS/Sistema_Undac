import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TableMovilidades({
  movilidades: movilidadesProp,
  esAdmin,
  onEditar,
  onEliminar,
}) {

  const [datos, setDatos] = useState(movilidadesProp);

  useEffect(() => {
    setDatos(movilidadesProp);
  }, [movilidadesProp]);

  const columnas = [
    "N°",
    "Nombres y apellidos",
    "Semestre",
    "N° de celular",
    "Escuela profesional",
    "Universidad de origen",
    "Ciudad de origen",
    "Universidad de destino",
    "Ciudad de destino",
    "Apoyo económico",
    ...(esAdmin ? ["Acciones"] : []),
  ];

  if (datos.length === 0) {
    return (
      <div className="vacio">
        No hay movilidades registradas.
      </div>
    );
  }

  return (
    <div className="wrapper">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col} className="th">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {datos.map((m, i) => (
            <tr
              key={m.id}
              className={i % 2 === 0 ? "tr-par" : "tr-impar"}
            >

              <td className="td td-numero">
                {i + 1}
              </td>

              <td className="td">
                {m.nombres}
              </td>

              <td className="td">
                {m.semestre}
              </td>

              <td className="td">
                {m.celular}
              </td>

              <td className="td">
                {m.escuela}
              </td>

              <td className="td">
                {m.universidadorigen}
              </td>

              <td className="td">
                {m.ciudadorigen}
              </td>

              <td className="td">
                {m.universidaddestino}
              </td>

              <td className="td">
                {m.ciudaddestino}
              </td>

              <td className="td">
                {m.apoyoeconomico || (
                  <span className="sin-registro">
                    Sin registro
                  </span>
                )}
              </td>

              {esAdmin && (
                <td className="td td-acciones">

                  <button
                    className="btn-accion btn-editar"
                    onClick={() => onEditar(m)}
                    title="Editar"
                  >
                    <FaEdit />
                  </button>

                  <button
                    className="btn-accion btn-eliminar-icon"
                    onClick={() => onEliminar(m.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>

                </td>
              )}

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}