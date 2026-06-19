
export function calcularSemaforo(fechaFin) {
  const hoy = new Date();
  const fin = new Date(fechaFin);
  const difMs = fin - hoy;
  const difDias = Math.ceil(difMs / (1000 * 60 * 60 * 24)); //math.floor avisa un dia antes

  if (difDias < 0) {
    return {
      color: "rojo",
      hex: "#dc2626",
      bg: "#fee2e2",
      texto: "Finalizado",
      dias: difDias,
    };
  }

  if (difDias <= 30) {
    // menos de un mes
    return {
      color: "naranja",
      hex: "#d97706",
      bg: "#fef3c7",
      texto: `${difDias} días restantes`,
      dias: difDias,
    };
  }

  if (difDias <= 60) {
    // menos de dos meses
    return {
      color: "amarillo",
      hex: "#b3b00c",
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
  const fecha = typeof fechaISO === "string" ? new Date(fechaISO) : fechaISO;
  if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) return "—";

  const d = String(fecha.getDate()).padStart(2, "0");
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const y = fecha.getFullYear();

  return `${d}/${m}/${y}`;
}
