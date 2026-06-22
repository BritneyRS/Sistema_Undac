import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
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
    "Ámbito", // <-- MODIFICADO: Agregada cabecera de la columna
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

              {/* ── MODIFICADO: Nueva celda para el Ámbito (Nacional o Internacional) ── */}
              <td className="td" style={{ textAlign: "center" }}>
                <span
                  className={`badge ${m.es_internacional ? 'badge-internacional' : 'badge-nacional'}`}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                    backgroundColor: m.es_internacional ? "#e8f5e9" : "#e3f2fd",
                    color: m.es_internacional ? "#1b5e20" : "#0d47a1",
                  }}
                >
                  {m.es_internacional ? 'Internacional' : 'Nacional'}
                </span>
              </td>

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

              {/* ── OBSERVACIÓN ── */}
              <td className="td" style={{ maxWidth: 180 }}>
                {m.observacion ? (
                  <span
                    title={m.observacion}
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    {m.observacion}
                  </span>
                ) : (
                  <span className="sin-registro">-</span>
                )}
              </td>

              {/* ── DOCUMENTOS ── */}
              <td className="td" style={{ textAlign: "center" }}>
                {m.documento_nombre || m.documento2_nombre ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {[
                      { nombre: m.documento_nombre, indice: 1 },
                      { nombre: m.documento2_nombre, indice: 2 },
                    ]
                      .filter((doc) => doc.nombre)
                      .map((doc) => (
                        <button
                          key={doc.indice}
                          type="button"
                          onClick={() =>
                            movilidadesAPI.descargarDocumento(
                              m.id,
                              doc.nombre,
                              doc.indice
                            )
                          }
                          title={doc.nombre}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#796921",
                            fontSize: 12,
                            textDecoration: "none",
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          <FaDownload style={{ flexShrink: 0 }} />
                          <span
                            style={{
                              maxWidth: 120,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {doc.nombre}
                          </span>
                        </button>
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