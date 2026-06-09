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

  // Función para extraer el año del período (ej: "2026-A" → "2026")
  const extraerAno = (periodo) => {
    if (!periodo) return "Sin período";
    const ano = periodo.split("-")[0];
    return ano || "Sin período";
  };

  // Agrupar datos por año
  const agruparPorAno = (datos) => {
    const grupos = {};
    datos.forEach((item) => {
      const ano = extraerAno(item.periodo);
      if (!grupos[ano]) {
        grupos[ano] = [];
      }
      grupos[ano].push(item);
    });
    // Retornar años ordenados de forma descendente
    return Object.keys(grupos)
      .sort((a, b) => {
        if (a === "Sin período") return 1;
        if (b === "Sin período") return -1;
        return parseInt(b) - parseInt(a);
      })
      .reduce((acc, ano) => {
        acc[ano] = grupos[ano];
        return acc;
      }, {});
  };

  const datosAgrupados = agruparPorAno(datos);
  const anosTotales = Object.keys(datosAgrupados);

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
      {anosTotales.map((ano) => (
        <div key={ano} className="grupo-ano">
          <div className="encabezado-ano">
            <h3>Año: {ano}</h3>
            <span className="cantidad-registros">
              ({datosAgrupados[ano].length} {datosAgrupados[ano].length === 1 ? "registro" : "registros"})
            </span>
          </div>
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
              {datosAgrupados[ano].map((m, i) => (
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
      ))}
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
