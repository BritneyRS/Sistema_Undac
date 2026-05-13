
export function calcularSemaforo(fechaFin) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const difMs = fin - hoy;
  const difDias = Math.floor(difMs / (1000 * 60 * 60 * 24));

  if (difDias < 0) {
    return {
      color: "rojo",
      hex: "#dc2626",
      bg: "#fee2e2",
      texto: "Vencido",
      dias: difDias,
    };
  }

  if (difDias <= 30) {
    // menos de un mes
    return {
      color: "amarillo",
      hex: "#d97706",
      bg: "#fef3c7",
      texto: `${difDias} días restantes`,
      dias: difDias,
    };
  }

  const meses = Math.round(difDias / 30);
  return {
    color: "verde",
    hex: "#16a34a",
    bg: "#dcfce7",
    texto: `${meses} meses restantes`,
    dias: difDias,
  };
}

export function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}
