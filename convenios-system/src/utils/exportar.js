import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatearFecha } from "./semaforo";
import logoUndac from "../Image/undac_logo.png"; // Importación oficial del logo

const valorSiNo = (valor) => (valor ? "Sí" : "No");

/*const capitalizeIntercambio = (value) => {
  if (!value) return "-";
  return String(value);
};*/

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
  }));

// FUNCIONES PARA MOVILIDAD 

const crearDatosExportExcelMovilidad = (movilidades) =>
  movilidades.map((m, index) => ({
    "ID": index + 1,
    "Apellidos y Nombres": m.nombres || "",
    "Escuela": m.escuela || "",
    "Semestre": m.semestre || "",
    //"Intercambio": capitalizeIntercambio(m.intercambio),
    "Período": m.periodo || "",
    "Celular": m.celular || "",
    "Universidad Origen": m.universidadorigen || "",
    "Ciudad Origen": m.ciudadorigen || "",
    "Universidad Destino": m.universidaddestino || "",
    "Ciudad Destino": m.ciudaddestino || "",
    "Beca": valorSiNo(m.beca === "si" || m.beca === true),
    "Tipo de Beca": m.tipobeca || "",
    "Apoyo Económico": m.apoyoeconomico || "",
    "Estado": m.estado || "",
    "Nº Expediente": m.numeroexpediente || "",
    "Nº Resolución": m.numeroresolucion || "",
    "Nº SIAF": m.numerosiaf || "",
  }));

const crearDatosExportPDFMovilidad = (movilidades) =>
  movilidades.map((m, index) => ({
    "N°": index + 1,
    "Apellidos y Nombres": m.nombres || "",
    "Escuela": m.escuela || "",
    "Semestre": m.semestre || "",
    "Período": m.periodo || "",
    //"Intercambio": capitalizeIntercambio(m.intercambio),
    "N° de celular": m.celular || "",
    "Universidad Origen": m.universidadorigen || "",
    "Universidad Destino": m.universidaddestino || "",
    "Beca": valorSiNo(m.beca === "si" || m.beca === true),
    "Tipo de Beca": m.tipobeca || "",
    "Apoyo económico": m.apoyoeconomico || "",
    "Nº Resolución": m.numeroresolucion || "",
    "Nº Expediente": m.numeroexpediente || "",
    "Nº SIAF": m.numerosiaf || "",
  }));

// diseño logo
const agregarEncabezadoInstitucional = (doc, margin, pageWidth, tituloSistema, totalRegistros) => {
  const logoWidth = 16;
  const logoHeight = 16;
  const logoTop = 10;

  //Logotipo institucional 
  try {
    doc.addImage(logoUndac, "PNG", margin, logoTop, logoWidth, logoHeight);
  } catch (error) {
    console.warn("No se pudo renderizar el logo en el PDF, aplicando respaldo de texto.", error);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text("UNDAC LOGO", margin, logoTop + 8);
  }

  // Nombre de la Universidad 
  const textoUniversidadX = margin + logoWidth +1; // Posición X 
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.setFont(undefined, "bold");
  doc.text("Universidad Nacional Daniel Alcides Carrión", textoUniversidadX, 19, { align: "left" });

  // Nombre de la Oficina 
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(
    "Oficina de Cooperación y Relaciones Internacionales", 
    pageWidth - margin, 
    19, 
    { align: "right" }
  );

  // Título del Sistema correspondiente 
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, "bold");
  doc.text(tituloSistema, margin, 34);

  // Subtítulo con metadatos del reporte
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, "normal");
  doc.text(
    `Reporte generado: ${new Date().toLocaleDateString("es-PE")} - Total de registros: ${totalRegistros}`, 
    margin, 
    40
  );

  // Línea azul divisoria corporativa
  doc.setDrawColor(74, 144, 196);
  doc.setLineWidth(0.5);
  doc.line(margin, 43, pageWidth - margin, 43);
};

export const exportarMovilidad = (movilidades, formato = "excel") => {
  if (formato === "pdf") {
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    
    //  encabezado institucional personalizado
    agregarEncabezadoInstitucional(
      doc, 
      margin, 
      pageWidth, 
      "SISTEMA DE GESTIÓN DE MOVILIDAD ESTUDIANTIL", 
      movilidades.length
    );

    const filas = crearDatosExportPDFMovilidad(movilidades).map((fila, index) => [
      fila["N°"],
      fila["Apellidos y Nombres"],
      fila["Escuela"],
      fila["Semestre"],
      fila["Período"],
      //fila["Intercambio"],
      fila["N° de celular"],
      fila["Universidad Origen"],
      fila["Universidad Destino"],
      fila["Beca"],
      fila["Tipo de Beca"],
      fila["Apoyo económico"],
      fila["Nº Resolución"],
      fila["Nº Expediente"],
      fila["Nº SIAF"],
    ]);

    autoTable(doc, {
      head: [["N°", "Nombres", "Escuela de formacion profesional UNDAC", "Semestre", "Período", "N° de celular", "Universidad Origen", "Universidad Destino", "Beca", "Tipo de Beca", "Apoyo económico", "Nº Resolución", "Nº Expediente", "Nº SIAF"]],
      body: filas,
      startY: 45, 
      margin: { left: margin, right: margin, top: 43, bottom: 15 },
      pageBreak: "auto",
      styles: { 
        fontSize: 8,
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
        0: { cellWidth: 8, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 25, halign: "left" },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 15, halign: "center" }, 
        4: { cellWidth: 15, halign: "center" }, 
        5: { cellWidth: 18, halign: "center" }, 
        6: { cellWidth: 30, halign: "left" },
        7: { cellWidth: 30, halign: "center" },
        8: { cellWidth: 10, halign: "center" },
        9: { cellWidth: 15, halign: "center" }, 
        10: { cellWidth: 20, halign: "center" }, 
        11: { cellWidth: 20, halign: "center" },
        12: { cellWidth: 20, halign: "center" },
        13: { cellWidth: 20, halign: "center" },
        
      },
      didDrawPage: (data) => {
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
        
        doc.text(
          `${new Date().toLocaleTimeString("es-PE")}`,
          currentPageSize.getWidth() - margin - 5,
          currentPageSize.getHeight() - 8,
          { align: "right" }
        );
      },
    });
    
    doc.save(`movilidades_${new Date().getTime()}.pdf`);
    return;
  }

  const libro = XLSX.utils.book_new();
  const hoja = XLSX.utils.json_to_sheet(crearDatosExportExcelMovilidad(movilidades));

  const colWidths = [5, 25, 15, 12, 12, 15, 25, 20, 25, 20, 12, 20, 20, 15, 18, 18, 15];
  hoja["!cols"] = colWidths.map(width => ({ wch: width }));
  
  XLSX.utils.book_append_sheet(libro, hoja, "Movilidades");
  XLSX.writeFile(libro, `movilidades_${new Date().getTime()}.xlsx`);
};

export const exportar = (convenios, formato = "excel") => {
  if (formato === "pdf") {
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    
    //  encabezado institucional personalizado
    agregarEncabezadoInstitucional(
      doc, 
      margin, 
      pageWidth, 
      "SISTEMA DE GESTIÓN DE CONVENIOS", 
      convenios.length
    );

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
    ]);

    autoTable(doc, {
      head: [columnas.map(col => col.header)],
      body: filas,
      startY: 45, //Linea azul
      margin: { left: margin, right: margin, top: 43, bottom: 15 },
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
        0: { cellWidth: 8, halign: "center", fontStyle: "bold" },  
        1: { cellWidth: 65, halign: "left" },                      
        2: { cellWidth: 35, halign: "center" },                    
        3: { cellWidth: 40, halign: "center" },                   
        4: { cellWidth: 25, halign: "center" },                    
        5: { cellWidth: 20, halign: "center" },                    
        6: { cellWidth: 20, halign: "center" },                    
        7: { cellWidth: 15, halign: "center" },                    
        8: { cellWidth: 45, halign: "center" },                    
        9: { cellWidth: 65, halign: "left" },                      
        
      },
      didDrawPage: (data) => {
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
  
  const colWidths = [5, 35, 15, 20, 15, 15, 12, 20, 12, 15, 15, 15, 15, 15, 15, 20, 20];
  hoja["!cols"] = colWidths.map(width => ({ wch: width }));
  
  XLSX.utils.book_append_sheet(libro, hoja, "Convenios");
  XLSX.writeFile(libro, `convenios_${new Date().getTime()}.xlsx`);
};