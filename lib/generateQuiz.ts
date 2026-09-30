import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildQuizPrompt } from "./prompts";
import type { Question, QuizResult } from "@/types";

/** Modelos a probar en orden. Si uno falla tras reintentar, pasa al siguiente. */
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const RETRY_DELAY_MS = 2000;

function resolveKey(provided?: string): string {
  const key =
    provided?.trim() ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "Introduce tu API Key de Gemini para generar el cuestionario."
    );
  }
  return key;
}

function stripFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  return s.trim();
}

export function parseQuizJson(raw: string): QuizResult {
  const json = stripFences(raw);
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("IA devolvió JSON inválido.");
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !("questions" in data) ||
    !Array.isArray((data as { questions: unknown }).questions)
  ) {
    throw new Error("JSON sin campo questions[].");
  }
  const rawQuestions = (data as { questions: unknown[] }).questions;
  const questions: Question[] = rawQuestions.map((q, i) => {
    const obj = q as Record<string, unknown>;
    const options = Array.isArray(obj.options)
      ? (obj.options as unknown[]).map(String)
      : [];
    if (typeof obj.question !== "string" || options.length !== 4) {
      throw new Error(`Pregunta ${i + 1} inválida: requiere enunciado + 4 opciones.`);
    }
    const correct =
      typeof obj.correctAnswer === "number" ? obj.correctAnswer : -1;
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) {
      throw new Error(`Pregunta ${i + 1}: correctAnswer debe ser 0-3.`);
    }
    return {
      id: typeof obj.id === "number" ? obj.id : i + 1,
      question: obj.question,
      options,
      correctAnswer: correct,
      explanation:
        typeof obj.explanation === "string" ? obj.explanation : undefined,
      feedback:
        Array.isArray(obj.feedback) &&
        (obj.feedback as unknown[]).length === 4
          ? (obj.feedback as unknown[]).map((f) => String(f ?? ""))
          : undefined,
    };
  });
  if (questions.length === 0) throw new Error("IA devolvió 0 preguntas.");
  return {
    questions: questions.map((q, i) => ({ ...q, id: i + 1 })),
  };
}

export async function generateQuiz(
  material: string,
  instructions?: string,
  numQuestions = 10,
  apiKey?: string
): Promise<QuizResult> {
  if (!material.trim()) throw new Error("Material vacío.");
  const n = Math.min(Math.max(Math.floor(numQuestions) || 10, 1), 50);
  const genAI = new GoogleGenerativeAI(resolveKey(apiKey));
  const prompt = buildQuizPrompt(material, instructions, n);

  let lastError = "";
  for (const modelName of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (!text?.trim()) throw new Error("IA devolvió respuesta vacía.");
        return parseQuizJson(text);
      } catch (e) {
        lastError = `${modelName}: ${e instanceof Error ? e.message : String(e)}`;
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }
  }
  throw new Error(`Ningún modelo Gemini respondió. Último error: ${lastError}`);
}
