"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export function InstructionsUploader({
  content,
  fileName,
  onText,
  onFile,
  onClear,
}: {
  content: string;
  fileName: string | null;
  onText: (text: string) => void;
  onFile: (content: string, fileName: string) => void;
  onClear: () => void;
}) {
  async function handleFile(list: FileList | null) {
    const f = list?.[0];
    if (!f) return;
    const text = await f.text();
    // Añade al texto existente para no borrar lo ya escrito
    const next = content.trim() ? `${content}\n\n${text}` : text;
    onFile(next, f.name);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrucciones (opcional)</CardTitle>
        <CardDescription>
          Escribe indicaciones, o sube .md / .txt. Se envían a la IA junto al
          material.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instructions-text">Texto de instrucciones</Label>
          <Textarea
            id="instructions-text"
            value={content}
            onChange={(e) => onText(e.target.value)}
            rows={5}
            placeholder="Ej.: 10 preguntas fáciles, enfocadas en definiciones…"
          />
        </div>
        <Input
          type="file"
          accept=".md,.txt,.markdown,.text"
          onChange={(e) => {
            void handleFile(e.target.files);
            e.target.value = "";
          }}
        />
        {fileName ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-sm">
            <span className="truncate">
              {fileName} ({content.length} chars)
            </span>
            <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Quitar instrucciones">
              <X />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sin archivo. Puedes escribir arriba directamente.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
