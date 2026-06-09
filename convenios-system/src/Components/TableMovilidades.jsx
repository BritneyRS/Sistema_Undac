import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TableMovilidades({
  movilidades: movilidadesProp,
  esAdmin,
  onEditar,
  onEliminar,
}) {

  // Función para convertir período a número comparable
  // "2025-B" -> 202502, "2025-A" -> 202501
  // "2024-B" -> 202402, "2024-A" -> 202401
  const convertirPeriodoANumero = (periodo) => {
    if (!periodo) return 0;
    const partes = periodo.split("-");
    const ano = partes[0] || "0";
    const letra = partes[1]?.toUpperCase() || "A";
    const numeroLetra = letra === "B" ? 2 : 1;
    return parseInt(ano + numeroLetra);
  };

  // Función para ordenar datos por período de forma descendente
  const ordenarPorPeriodo = (datos) => {
    return [...datos].sort((a, b) => {
      const numA = convertirPeriodoANumero(a.periodo);
      const numB = convertirPeriodoANumero(b.periodo);
      return numB - numA; // Descendente (más recientes primero)
    });
  };

  const [datos, setDatos] = useState(() => ordenarPorPeriodo(movilidadesProp));

  useEffect(() => {
    setDatos(ordenarPorPeriodo(movilidadesProp));
  }, [movilidadesProp]);

  const columnas = [
    "N°",
    "Nombres y apellidos",
    "Semestre",
    "Celular",
    "Escuela de Formación Profesional",
    "Período",
    "Universidad origen",
    "Ciudad origen",
    "Universidad destino",
    "Ciudad destino",
    "Apoyo económico",
    "Beca",
    "Tipo de beca",
    "Estado",
    "Expediente",
    "Resolución",
    "SIAF",
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

              <td className="td td-numero">{i + 1}</td>

              <td className="td">{m.nombres}</td>

              <td className="td">{m.semestre}</td>

              <td className="td">{m.celular || "-"}</td>

              <td className="td">{m.escuela || "-"}</td>

              <td className="td">{m.periodo || "-"}</td>

              <td className="td">{m.universidadorigen}</td>

              <td className="td">{m.ciudadorigen}</td>

              <td className="td">{m.universidaddestino}</td>

              <td className="td">{m.ciudaddestino}</td>

              <td className="td">
                {m.apoyoeconomico
                  ? `S/ ${m.apoyoeconomico}`
                  : <span className="sin-registro">Sin registro</span>}
              </td>

              <td className="td">{m.beca || "-"}</td>

              <td className="td">{m.tipobeca || "-"}</td>

              <td className="td">
                <EstadoBadge estado={m.estado} />
              </td>

              <td className="td">{m.numeroexpediente || "-"}</td>

              <td className="td">{m.numeroresolucion || "-"}</td>

              <td className="td">{m.numerosiaf || "-"}</td>

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

function EstadoBadge({ estado }) {
  
  const valor = (estado || "");
  

  const clases = {
    activo: "estado-badge estado-activo",
    pendiente: "estado-badge estado-pendiente",
    finalizado: "estado-badge estado-finalizado",
    desistido: "estado-badge estado-desistido",
  };

  const texto = estado || "-";

  return (
    <span className={clases[valor] || "estado-badge"}>
      {texto}
    </span>
  );
}
