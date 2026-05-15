
export function calcularSemaforo(fechaFin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [anio, mes, dia] = fechaFin.split("-");
  const fin = new Date(Number(anio), Number(mes) - 1, Number(dia));
  fin.setHours(0, 0, 0, 0);

  const difMs = fin - hoy;
  const difDias = Math.round(difMs / (1000 * 60 * 60 * 24));

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
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}
