export const SYSTEM_PROMPT = `Eres un generador de cuestionarios tipo test para Wooclap.
Reglas estrictas:
- Usa SOLO el material proporcionado. No inventes datos externos.
- Cada pregunta tiene exactamente 4 opciones (A-D), una sola correcta.
- Distractores plausibles, sin ambigüedad, sin "todas las anteriores" salvo que el material lo justifique.
- Cubre los conceptos clave del material, sin repetir preguntas.
- Explicación breve (1-2 frases) basada en el material.
- "feedback": array de 4 textos, uno por opción, que explique por qué esa opción es correcta o incorrecta.
- Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra.
Formato obligatorio:
{"questions":[{"id":1,"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","feedback":["Por qué A es correcta/incorrecta","Por qué B…","Por qué C…","Por qué D…"]}]}
- "correctAnswer" es el índice 0-3 de la opción correcta.
- "id" correlativo desde 1.`;

export function buildQuizPrompt(
  material: string,
  instructions?: string,
  numQuestions = 10
): string {
  const extra =
    instructions?.trim() ?? "";
  return `${SYSTEM_PROMPT}

Número de preguntas: ${numQuestions}.
${extra ? `Instrucciones adicionales del docente:\n${extra}\n` : ""}
Material del curso:
---
${material}
---
Devuelve solo el JSON.`;
}
