"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/types";
import { Trash2 } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"];

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question;
  onUpdate: (q: Question) => void;
  onDelete: () => void;
}) {
  function setOption(i: number, value: string) {
    const options = [...question.options];
    options[i] = value;
    onUpdate({ ...question, options });
  }

  function setFeedback(i: number, value: string) {
    const feedback = [...(question.feedback ?? ["", "", "", ""])];
    feedback[i] = value;
    onUpdate({ ...question, feedback });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pregunta {question.id}</span>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 /> Eliminar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Enunciado</Label>
          <Textarea
            value={question.question}
            onChange={(e) => onUpdate({ ...question, question: e.target.value })}
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Opciones (marca la correcta)</Label>
          {question.options.map((opt, i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-lg border p-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === i}
                  onChange={() => onUpdate({ ...question, correctAnswer: i })}
                  aria-label={`Opción ${LETTERS[i]} correcta`}
                />
                <Input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  aria-label={`Opción ${LETTERS[i]}`}
                />
              </div>
              <Input
                value={question.feedback?.[i] ?? ""}
                onChange={(e) => setFeedback(i, e.target.value)}
                placeholder={`Feedback ${LETTERS[i]}: por qué es correcta o incorrecta (opcional)`}
                aria-label={`Feedback opción ${LETTERS[i]}`}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Explicación general (opcional)</Label>
          <Textarea
            value={question.explanation ?? ""}
            onChange={(e) =>
              onUpdate({ ...question, explanation: e.target.value })
            }
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
