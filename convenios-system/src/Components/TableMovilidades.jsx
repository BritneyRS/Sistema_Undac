import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaDownload, FaEye } from "react-icons/fa";
import { movilidadesAPI } from "../utils/api";


//const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export default function TableMovilidades({
  movilidades: movilidadesProp,
  esAdmin,
  onEditar,
  onEliminar,
}) {

  const convertirPeriodoANumero = (periodo) => {
    if (!periodo) return 0;
    const partes = periodo.split("-");
    const ano = partes[0] || "0";
    const letra = partes[1]?.toUpperCase() || "A";
    const numeroLetra = letra === "B" ? 2 : 1;
    return parseInt(ano + numeroLetra);
  };

  const ordenarPorPeriodo = useCallback((datos) => {
    return [...datos].sort((a, b) => {
      const numA = convertirPeriodoANumero(a.periodo);
      const numB = convertirPeriodoANumero(b.periodo);
      return numB - numA;
    });
  }, []);

  const [datos, setDatos] = useState(() => ordenarPorPeriodo(movilidadesProp));

  useEffect(() => {
    setDatos(ordenarPorPeriodo(movilidadesProp));
  }, [movilidadesProp, ordenarPorPeriodo]);

  const subtotalApoyoEconomico = datos.reduce((total, movilidad) => {
    const valor = Number(
      String(movilidad?.apoyoeconomico ?? "")
        .replace(/[^0-9.-]/g, "")
        .trim()
    );
    return total + (Number.isFinite(valor) ? valor : 0);
  }, 0);

  const columnas = [
    "N°",
    "Nombres y apellidos",
    "Semestre",
    "Intercambio",
    "Celular",
    "Escuela de Formación Profesional",
    "Período",
    "Universidad origen",
    "Ciudad origen",
    "Universidad destino",
    "Ciudad destino",
    "Ámbito", 
    "Apoyo económico",
    "Beca",
    "Tipo de beca",
    "Estado",
    "Expediente",
    "Resolución",
    "SIAF",
    "Observación",
    "Documentos",
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
    <div className="table-container">
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
                <td className="td">{m.intercambio ? capitalizeIntercambio(m.intercambio) : "-"}</td>
                <td className="td">{m.celular || "-"}</td>
                <td className="td">{m.escuela || "-"}</td>
                <td className="td">{m.periodo || "-"}</td>
                <td className="td">{m.universidadorigen}</td>
                <td className="td">{m.ciudadorigen}</td>
                <td className="td">{m.universidaddestino}</td>
                <td className="td">{m.ciudaddestino}</td>
                <td className="td td-centro">
                <span
                  className={`badge-ambito ${
                    m.es_internacional
                      ? "badge-internacional"
                      : "badge-nacional"
                  }`}
                >
                  {m.es_internacional ? "Internacional" : "Nacional"}
                </span>
              </td>
                <td className="td-eco">
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

              {/* ── OBSERVACIÓN ── */}
              <td className="td td-observacion">
                {m.observacion ? (
                  <span
                    title={m.observacion}
                    className="texto-observacion"
                  >
                    {m.observacion}
                  </span>
                ) : (
                  <span className="sin-registro">-</span>
                )}
              </td>

              {/* ── DOCUMENTOS ── */}
              <td className="td td-centro">
                {m.documento_nombre || m.documento2_nombre ? (
                  <div className="documentos-container">
                    {[
                      { nombre: m.documento_nombre, indice: 1 },
                      { nombre: m.documento2_nombre, indice: 2 },
                    ]
                      .filter((doc) => doc.nombre)
                      .map((doc) => (
                        <div key={doc.indice} className="documento-item">
                          <button
                            type="button"
                            className="btn-documento btn-previsualizar"
                            onClick={() =>
                              movilidadesAPI
                                .previsualizarDocumento(m.id, doc.indice)
                                .catch((err) => alert(err.message || "Error al previsualizar"))
                            }
                            title="Ver"
                          >
                            <FaEye className="icono-documento" />
                          </button>
                          <button
                            type="button"
                            className="btn-documento"
                            onClick={() =>
                              movilidadesAPI.descargarDocumento(
                                m.id,
                                doc.nombre,
                                doc.indice
                              )
                            }
                            title="Descargar documento"
                          >
                            <FaDownload className="icono-documento" />
                            <span className="nombre-documento">
                              {doc.nombre}
                            </span>
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <span className="sin-registro">-</span>
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

      <div className="subtotal-row-footer">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-valor">
          {formatearMoneda(subtotalApoyoEconomico)}
        </span>
      </div>
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

function capitalizeIntercambio(value) {
  if (!value) return "-";
  return String(value);
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(valor || 0);
}