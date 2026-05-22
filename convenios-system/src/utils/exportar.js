import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearFecha } from "./semaforo";

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
    "Resultados": c.resultados || c.Resultados || "",
  }));

// Función para obtener oportunidades seleccionadas
const obtenerOportunidades = (convenio) => {
  const oportunidades = [];
  if (convenio.practicas) oportunidades.push("Prácticas");
  if (convenio.investigaciones) oportunidades.push("Investigaciones");
  if (convenio.proyeccion) oportunidades.push("Proyección social");
  if (convenio.capacitacion) oportunidades.push("Capacitación");
  if (convenio.laboral) oportunidades.push("Oportunidad laboral");
  if (convenio.movilidad) oportunidades.push("Movilidad");
  if (convenio.pasantia) oportunidades.push("Pasantías");
  const otros = (convenio.otros || convenio.Otros || "").toString().trim();
  if (otros) oportunidades.push(`${otros}`);
  return oportunidades.length > 0 ? oportunidades.join(", ") : "Ninguna";
};

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
    "Tipo de oportunidad": obtenerOportunidades(c),
    "Resultados obtenidos": c.resultados || c.Resultados || "",
  }));

export const exportar = (convenios, formato = "excel") => {
  if (formato === "pdf") {
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
   //const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    
    // Encabezado con logo y título
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text("SISTEMA DE GESTIÓN DE CONVENIOS", margin, 18);
    
    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, "normal");
    doc.text(`Reporte generado: ${new Date().toLocaleDateString("es-PE")} - Total de registros: ${convenios.length}`, margin, 25);
    
    // Línea separadora
    doc.setDrawColor(74, 144, 196);
    doc.setLineWidth(0.5);
    doc.line(margin, 27, pageWidth - margin, 27);

    const columnas = [
      { header: "N°", key: "num", width: 8 },
      { header: "Nombre del Convenio", key: "nombre", width: 30 },
      { header: "Convenio", key: "ambito", width: 100 },
      { header: "Tipo de Oportunidad", key: "oportunidad", width: 40 },
      { header: "Tipo de Convenio", key: "tipo", width: 16 },
      { header: "Inicio", key: "inicio", width: 13 },
      { header: "Fin", key: "fin", width: 13 },
      { header: "Duración", key: "duracion", width: 12 },
      { header: "Resolución", key: "resolucion", width: 16 },
      { header: "Resultados Obtenidos", key: "resultados", width: 30 },
    ];

    const filas = crearDatosExportPDF(convenios).map((fila, index) => [
      index + 1,
      fila["Nombre del convenio"],
      fila["Ámbito"],
      fila["Tipo de oportunidad"],
      fila["Tipo de convenio"],
      fila["Inicio"],
      fila["Fin"],
      fila["Duración"],
      fila["Resolución"],
      fila["Resultados obtenidos"],
    ]);

    autoTable(doc, {
      head: [columnas.map(col => col.header)],
      body: filas,
      startY: 30,
      margin: { left: margin, right: margin, top: 30, bottom: 15 },
      pageBreak: "auto",
      styles: { 
        fontSize: 9,
        cellPadding: 1,
        overflow: "linebreak",
        halign: "left",
        valign: "middle",
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
        font: "helvetica",
      },
      headStyles: { 
        fillColor: [74, 144, 196],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
        lineColor: [74, 144, 196],
        lineWidth: 0.5,
        fontSize: 8,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [40, 40, 40],
        lineColor: [220, 220, 220],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 40, halign: "left" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 30, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 18, halign: "center" },
        6: { cellWidth: 18, halign: "center" },
        7: { cellWidth: 15, halign: "center" },
        8: { cellWidth: 40, halign: "center" },
        9: { cellWidth: 65, halign: "left" },
      },
      didDrawPage: (data) => {
        // Pie de página
        const currentPageSize = doc.internal.pageSize;
        const pageCount = doc.getNumberOfPages();
        const pageNum = data.pageNumber;
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${pageNum} de ${pageCount}`,
          currentPageSize.getWidth() / 2,
          currentPageSize.getHeight() - 8,
          { align: "center" }
        );
        
        // Pie de página derecha con fecha
        doc.text(
          `${new Date().toLocaleTimeString("es-PE")}`,
          currentPageSize.getWidth() - margin - 5,
          currentPageSize.getHeight() - 8,
          { align: "right" }
        );
      },
    });
    
    doc.save(`convenios_${new Date().getTime()}.pdf`);
    return;
  }

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(crearDatosExportExcel(convenios));
  
  // Ajustar ancho de columnas en Excel
  const colWidths = [5, 35, 15, 20, 15, 15, 12, 20, 12, 15, 15, 15, 15, 15, 15, 20, 20];
  hoja["!cols"] = colWidths.map(width => ({ wch: width }));
  
  XLSX.utils.book_append_sheet(libro, hoja, "Convenios");
  XLSX.writeFile(libro, `convenios_${new Date().getTime()}.xlsx`);
};
