import * as XLSX from "xlsx";
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

export function buildWooclapSheet(questions: Question[]): XLSX.WorkSheet {
  validateQuestions(questions);
  const rows = questions.map((q) => ({
    Type: "MCQ",
    Title: q.question,
    Correct: q.correctAnswer + 1, // Wooclap usa base 1
    "Answer 1": q.options[0],
    "Answer 2": q.options[1],
    "Answer 3": q.options[2],
    "Answer 4": q.options[3],
    Explanation: q.explanation ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(rows, { header: [...HEADERS] });
  ws["!cols"] = [
    { wch: 8 },
    { wch: 60 },
    { wch: 8 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 30 },
    { wch: 40 },
  ];
  return ws;
}

export function buildWooclapBuffer(questions: Question[]): Buffer {
  const ws = buildWooclapSheet(questions);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Wooclap");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
