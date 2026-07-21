// src/utils/exportUtils.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Exportar directamente a Excel (.xlsx) NATIVO
export const exportarAExcel = (datos, nombreArchivo = "Reporte.xlsx") => {
  if (!datos || datos.length === 0) return;
  
  // Crea la hoja de trabajo a partir del arreglo de objetos
  const worksheet = XLSX.utils.json_to_sheet(datos);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  // Genera y descarga el archivo .xlsx
  XLSX.writeFile(workbook, nombreArchivo.endsWith(".xlsx") ? nombreArchivo : `${nombreArchivo}.xlsx`);
};

// Exportar a CSV plano
export const exportarACSV = (datos, nombreArchivo = "Reporte.csv") => {
  if (!datos || datos.length === 0) return;
  const headers = Object.keys(datos[0]);
  const filas = datos.map((row) =>
    headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(",")
  );
  const contenidoCSV = "\uFEFF" + [headers.join(","), ...filas].join("\n");
  const blob = new Blob([contenidoCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo.endsWith(".csv") ? nombreArchivo : `${nombreArchivo}.csv`;
  link.click();
};

// Exportar a PDF
export const exportarAPDF = (datos, titulo = "Reporte Financiero", nombreArchivo = "Reporte.pdf") => {
  if (!datos || datos.length === 0) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
  doc.setFillColor(30, 97, 122);
  doc.rect(0, 0, 210, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Sistema Financiero LoanBe", 14, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(titulo, 14, 18);

  const headers = Object.keys(datos[0]);
  const body = datos.map((row) => headers.map((header) => row[header]));

  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: body,
    theme: "striped",
    headStyles: { fillColor: [30, 97, 122] },
    styles: { fontSize: 8 }
  });

  doc.save(nombreArchivo);
};