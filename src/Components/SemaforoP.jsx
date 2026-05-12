import React from "react";
import Style from "./Styles/style.css";
import { calcularSemaforo } from "../utils/semaforo";


export default function SemaforoP({ fechaFin }) {

  const s = calcularSemaforo(fechaFin);

  return (
    <div className="semaforo-contenedor">

      {/* Punto */}
      <span
        className="semaforo-punto"
        style={{
          background: s.hex,
          boxShadow: `0 0 0 3px ${s.hex}33`,
        }}
      />

      {/* Texto */}
      <span
        className="semaforo-texto"
        style={{
          color: s.hex,
          background: s.bg,
          border: `1px solid ${s.hex}44`,
        }}
      >
        {s.texto}
      </span>

    </div>
  );
}