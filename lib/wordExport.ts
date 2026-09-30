import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { validateQuestions } from "./wooclapExport";
import type { Question } from "@/types";

const LETTERS = ["A", "B", "C", "D"];

export async function buildWordBuffer(questions: Question[]): Promise<Buffer> {
  validateQuestions(questions);

  const children: Paragraph[] = [
    new Paragraph({ text: "Cuestionario", heading: HeadingLevel.TITLE }),
  ];

  questions.forEach((q, qi) => {
    children.push(
      new Paragraph({
        text: `Pregunta ${qi + 1}`,
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({ children: [new TextRun({ text: q.question, bold: true })] })
    );
    q.options.forEach((opt, i) => {
      const correct = i === q.correctAnswer;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${LETTERS[i]}) ${opt}${correct ? " ✓" : ""}`,
              bold: correct,
            }),
          ],
        })
      );
      const fb = q.feedback?.[i]?.trim();
      if (fb) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `→ ${fb}`, italics: true })],
          })
        );
      }
    });
    if (q.explanation?.trim()) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Explicación: ", bold: true }),
            new TextRun({ text: q.explanation }),
          ],
        })
      );
    }
  });

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
