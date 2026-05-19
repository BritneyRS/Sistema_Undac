import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calcularSemaforo, formatearFecha } from "./semaforo";

const valorSiNo = (valor) => (valor ? "Sí" : "No");

const crearDatosExportExcel = (convenios) =>
  convenios.map((c, index) => ({
    "ID": index + 1,
    "Nombre": c.nombre || "",
    "Ámbito": c.ambito || "",
    "Tipo": c.tipo || "",
    "Inicio": formatearFecha(c.inicio),
    "Fin": formatearFecha(c.fin),
    "Duración": c.duracion || "",
    "Resolución": c.resolucion || "",
    "Prácticas": valorSiNo(c.practicas),
    "Investigaciones": valorSiNo(c.investigaciones),
    "Proyección": valorSiNo(c.proyeccion),
    "Capacitación": valorSiNo(c.capacitacion),
    "Laboral": valorSiNo(c.laboral),
    "Pasantía": valorSiNo(c.pasantia),
    "Movilidad": valorSiNo(c.movilidad),
    "Otros": c.Otros || c.otros || "",
    "Resultados": c.Resultados || "",
  }));

const crearDatosExportPDF = (convenios) =>
  convenios.map((c, index) => ({
    "N°": index + 1,
    "Nombre del convenio": c.nombre || "",
    "Ámbito": c.ambito || "",
    "Tipo de convenio": c.tipo || "",
    "Inicio": formatearFecha(c.inicio),
    "Fin": formatearFecha(c.fin),
    "Duración": c.duracion || "",
    "Resolución": c.resolucion || "",
    "Semáforo": calcularSemaforo(c.fin).texto,
    "Resultados obtenidos": c.Resultados || "",
  }));

export const exportar = (convenios, formato = "excel") => {
  if (formato === "pdf") {
    const doc = new jsPDF();
    const columnas = [
      "N°",
      "Nombre",
      "Ámbito",
      "Tipo de convenio",
      "Inicio",
      "Fin",
      "Duración",
      "Resolución",
      "Semáforo",
      "Resultados",
    ];

    const filas = crearDatosExportPDF(convenios).map((fila) => [
      fila["N°"],
      fila["Nombre del convenio"],
      fila["Ámbito"],
      fila["Tipo de convenio"],
      fila["Inicio"],
      fila["Fin"],
      fila["Duración"],
      fila["Resolución"],
      fila["Semáforo"],
      fila["Resultados obtenidos"],
    ]);

    doc.text("Convenios", 14, 16);
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 22,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [74, 144, 196], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 } },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          doc.text(
            `Página ${data.pageNumber}`,
            doc.internal.pageSize.getWidth() - 20,
            doc.internal.pageSize.getHeight() - 10
          );
        }
      },
    });
    doc.save("convenios.pdf");
    return;
  }

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(crearDatosExportExcel(convenios));
  XLSX.utils.book_append_sheet(libro, hoja, "Convenios");
  XLSX.writeFile(libro, "convenios.xlsx");
};
