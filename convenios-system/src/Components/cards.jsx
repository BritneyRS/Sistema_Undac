import React from "react";
import { calcularSemaforo } from "../utils/semaforo";
import style from "../Styles/style.css";

export default function StatsCards({ convenios }) {

  const total = convenios.length;

  const verde = convenios.filter(
    (c) => calcularSemaforo(c.fin).color === "verde"
  ).length;

  const amarillo = convenios.filter(
    (c) => calcularSemaforo(c.fin).color === "amarillo"
  ).length;

  const rojo = convenios.filter(
    (c) => calcularSemaforo(c.fin).color === "rojo"
  ).length;

  const tarjetas = [

    {
      label: "Total convenios",
      valor: total,
      color: "#374151",
      bg: "#f9fafb",
    },

    {
      label: "Vigentes",
      valor: verde,
      color: "#16a34a",
      bg: "#dcfce7",
    },

    {
      label: "Por vencer (< 6 meses)",
      valor: amarillo,
      color: "#d97706",
      bg: "#fef3c7",
    },

    {
      label: "Vencidos / Críticos",
      valor: rojo,
      color: "#dc2626",
      bg: "#fee2e2",
    },

  ];

  return (
    <div className="stats-grid">

      {tarjetas.map((t, i) => (

        <div
          key={i}
          className="stats-tarjeta"
          style={{ background: t.bg }}
        >

          <p className="stats-label">
            {t.label}
          </p>

          <p
            className="stats-numero"
            style={{ color: t.color }}
          >
            {t.valor}
          </p>

        </div>

      ))}

    </div>
  );
}