# Proyecto: Generador de Cuestionarios Wooclap (Fase 1 - MVP)

## Objetivo
App web que:
1. Recibe archivos (PDF, PPTX, DOCX, TXT) + opcionalmente un .md de instrucciones
2. Extrae el texto
3. Genera preguntas tipo test (opción múltiple) con IA
4. Permite editar las preguntas
5. Exporta a Excel compatible con Wooclap
6. No guarda nada (todo se pierde al refrescar)

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind + shadcn/ui
- pdf-parse, mammoth, xlsx
- Google Gemini API (modelo flash)
- Hosting: Vercel

## Estructura de carpetas
app/
page.tsx
api/
generate/route.ts
export/route.ts
components/
FileUploader.tsx
InstructionsUploader.tsx
QuizPreview.tsx
QuestionEditor.tsx
ExportButton.tsx
lib/
extractText.ts
generateQuiz.ts
wooclapExport.ts
prompts.ts
types/
index.ts

## Orden de implementación (seguir estrictamente)

### 1. Inicializar proyecto
- Crear Next.js con TypeScript y Tailwind
- Instalar shadcn/ui
- Instalar dependencias: pdf-parse mammoth xlsx @google/generative-ai

### 2. Definir tipos (types/index.ts)
```ts
export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // índice 0-3
  explanation?: string;
}

export interface QuizResult {
  questions: Question[];
}

### 3. Extraer texto (lib/extractText.ts)

Función que recibe File[]
Extrae texto de PDF (pdf-parse), DOCX (mammoth) y TXT
PPTX: implementar extracción básica o convertir a texto
Devolver un string limpio concatenado
Limitar a ~80-100k caracteres máximo

### 4. Prompts (lib/prompts.ts)
Crear dos cosas:

System prompt fuerte (calidad, solo material proporcionado, distractores plausibles, formato JSON estricto)
Función que combine: system prompt + instrucciones del .md del usuario + texto del material

Formato de salida obligatorio:
JSON
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}

### 5. Generación con IA (lib/generateQuiz.ts + api/generate/route.ts)

Endpoint POST /api/generate
Recibe: texto del material + instrucciones (opcional)
Llama a Gemini Flash
Devuelve el JSON de preguntas
Manejar errores y límites de tokens

### 6. Interfaz principal (app/page.tsx)

Estado: archivos, instrucciones, preguntas, loading, error
Componentes:
FileUploader (múltiples archivos)
InstructionsUploader (solo .md)
Botón Generar
QuizPreview / QuestionEditor
ExportButton


### 7. Editor de preguntas

Mostrar lista de preguntas
Poder editar: enunciado, opciones y respuesta correcta
Poder eliminar preguntas
Guardar cambios en el estado

### 8. Exportación Wooclap (lib/wooclapExport.ts + api/export/route.ts)

Generar archivo .xlsx con el formato exacto que acepta Wooclap
Columnas típicas: Type, Title, Correct, Answer1, Answer2, Answer3, Answer4...
Descargar el archivo desde el cliente

### 9. Detalles importantes

No usar base de datos ni almacenamiento
Todo en memoria (useState)
Al refrescar → se pierde todo
Validar que haya al menos 1 archivo de material antes de generar
Mostrar estados de carga y errores claros

### Criterios de aceptación Fase 1

 Se pueden subir varios archivos
 Se puede subir un .md de instrucciones
 Se genera un cuestionario en JSON válido
 Se pueden editar las preguntas
 Se descarga un Excel importable en Wooclap
 Al refrescar desaparece todo

### Notas para el agente

Implementar paso a paso
No saltar fases
Después de cada paso importante, verificar que compila
Priorizar código simple y funcional
Preguntar antes de decisiones de arquitectura complejas

