import { Workbook, Worksheet } from "exceljs";
import type { Question } from "@/types";

const HEADERS = [
  "Type",
  "Title",
  "Correct",
  "Answer 1",
  "Answer 2",
  "Answer 3",
  "Answer 4",
  "Explanation",
] as const;

const COL_WIDTHS = [
  { width: 8 },
  { width: 60 },
  { width: 8 },
  { width: 30 },
  { width: 30 },
  { width: 30 },
  { width: 30 },
  { width: 40 },
];

export function validateQuestions(questions: Question[]): void {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No hay preguntas para exportar.");
  }
  questions.forEach((q, i) => {
    if (!q.question?.trim() || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Pregunta ${i + 1} inválida.`);
    }
    if (q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Pregunta ${i + 1}: respuesta correcta fuera de rango.`);
    }
  });
}

export function buildWooclapSheet(questions: Question[]): Worksheet {
  validateQuestions(questions);

  const workbook = new Workbook();
  const ws = workbook.addWorksheet("Wooclap");

  // Add header row
  ws.addRow(HEADERS);

  // Style header row
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  questions.forEach((q) => {
    ws.addRow({
      Type: "MCQ",
      Title: q.question,
      Correct: q.correctAnswer + 1, // Wooclap usa base 1
      "Answer 1": q.options[0],
      "Answer 2": q.options[1],
      "Answer 3": q.options[2],
      "Answer 4": q.options[3],
      Explanation: q.explanation ?? "",
    });
  });

  // Set column widths
  COL_WIDTHS.forEach((col, index) => {
    ws.getColumn(index + 1).width = col.width;
  });

  return ws;
}

export function buildWooclapBuffer(questions: Question[]): Promise<Buffer> {
  const ws = buildWooclapSheet(questions);
  const workbook = new Workbook();
  
  // Copy the worksheet to a new workbook (or use the existing one)
  const newWs = workbook.addWorksheet("Wooclap");
  
  // Copy all rows including styles
  ws.eachRow((row, rowNumber) => {
    const newRow = newWs.getRow(rowNumber);
    row.eachCell((cell, colNumber) => {
      newRow.getCell(colNumber).value = cell.value;
      newRow.getCell(colNumber).style = cell.style;
    });
    newRow.height = row.height;
  });

  // Copy column widths
  ws.columns.forEach((col, index) => {
    if (col.width) {
      newWs.getColumn(index + 1).width = col.width;
    }
  });

  return workbook.xlsx.writeBuffer().then((buffer) => Buffer.from(buffer));
}