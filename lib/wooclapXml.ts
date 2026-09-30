import { validateQuestions } from "./wooclapExport";
import type { Question } from "@/types";

/**
 * Moodle XML: formato que Wooclap acepta vía "Import event → From Moodle".
 * Multichoice con una sola respuesta correcta, feedback general y por opción.
 */

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildMoodleXml(questions: Question[]): string {
  validateQuestions(questions);

  const items = questions
    .map((q) => {
      const answers = q.options
        .map((opt, i) => {
          const fraction = i === q.correctAnswer ? "100" : "0";
          const fb = q.feedback?.[i] ?? "";
          return `    <answer fraction="${fraction}" format="html">
      <text>${cdata(opt)}</text>
      <feedback format="html"><text>${cdata(fb)}</text></feedback>
    </answer>`;
        })
        .join("\n");
      return `  <question type="multichoice">
    <name><text>${esc(`Pregunta ${q.id}: ${q.question.slice(0, 60)}`)}</text></name>
    <questiontext format="html"><text>${cdata(q.question)}</text></questiontext>
    <generalfeedback format="html"><text>${cdata(q.explanation ?? "")}</text></generalfeedback>
    <defaultgrade>1.0000000</defaultgrade>
    <penalty>0.0000000</penalty>
    <hidden>0</hidden>
    <idnumber></idnumber>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>abc</answernumbering>
    <showstandardinstruction>0</showstandardinstruction>
    <correctfeedback format="html"><text></text></correctfeedback>
    <partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>
    <incorrectfeedback format="html"><text></text></incorrectfeedback>
    <shownumcorrect></shownumcorrect>
${answers}
  </question>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="category">
    <category><text>$course$/top/Cuestionario</text></category>
    <info format="html"><text></text></info>
    <idnumber></idnumber>
  </question>
${items}
</quiz>
`;
}
