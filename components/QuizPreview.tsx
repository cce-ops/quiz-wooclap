"use client";

import type { Question } from "@/types";
import { QuestionEditor } from "./QuestionEditor";

export function QuizPreview({
  questions,
  onUpdate,
  onDelete,
}: {
  questions: Question[];
  onUpdate: (id: number, q: Question) => void;
  onDelete: (id: number) => void;
}) {
  if (questions.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">
        Cuestionario ({questions.length} preguntas)
      </h2>
      {questions.map((q) => (
        <QuestionEditor
          key={q.id}
          question={q}
          onUpdate={(next) => onUpdate(q.id, next)}
          onDelete={() => onDelete(q.id)}
        />
      ))}
    </div>
  );
}
