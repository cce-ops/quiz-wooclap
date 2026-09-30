"use client";

import { useState } from "react";
import { FileUploader, MAX_TOTAL_MB } from "@/components/FileUploader";
import { InstructionsUploader } from "@/components/InstructionsUploader";
import { QuizPreview } from "@/components/QuizPreview";
import { ExportButton } from "@/components/ExportButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Question, QuizResult } from "@/types";
import { Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [instructions, setInstructions] = useState("");
  const [instructionsName, setInstructionsName] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setError("");
    if (files.length === 0) {
      setError("Sube al menos 1 archivo de material antes de generar.");
      return;
    }
    const totalMB =
      files.reduce((n, f) => n + f.size, 0) / 1024 / 1024;
    if (totalMB > MAX_TOTAL_MB) {
      setError(
        `Material supera ${MAX_TOTAL_MB} MB: quita archivos o comprímelos.`
      );
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      form.append("instructions", instructions);
      form.append("numQuestions", String(numQuestions));
      form.append("apiKey", apiKey);
      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = (await res.json()) as QuizResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Error al generar.");
      setQuestions(data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar.");
    } finally {
      setLoading(false);
    }
  }

  function updateQuestion(id: number, next: Question) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? next : q)));
  }

  function deleteQuestion(id: number) {
    setQuestions((prev) =>
      prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, id: i + 1 }))
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">
            Generador de Cuestionarios Wooclap
          </h1>
          <p className="text-sm text-muted-foreground">
            Sube material, genera test con IA, edita y exporta a Excel. Nada se
            guarda: al refrescar se pierde todo.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tu API Key de Gemini
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowKeyHelp((v) => !v)}
              aria-label="Cómo conseguir una API Key gratis"
              title="Cómo conseguir una API Key gratis"
              className="rounded-full font-bold"
            >
              ?
            </Button>
          </CardTitle>
          <CardDescription>
            Cada usuario usa su propia clave. Se envía solo a tu servidor para
            llamar a Gemini y no se guarda.{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Conseguir clave
            </a>
          </CardDescription>
        </CardHeader>
        {showKeyHelp && (
          <CardContent>
            <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
              <p className="font-medium">
                Cómo conseguir tu API Key gratis (2 min):
              </p>
              <ol className="flex list-decimal flex-col gap-1 pl-5">
                <li>
                  Entra en{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google AI Studio
                  </a>{" "}
                  e inicia sesión con tu cuenta de Google.
                </li>
                <li>Pulsa “Create API key”.</li>
                <li>Copia la clave y pégala en el campo de abajo.</li>
              </ol>
              <p className="text-muted-foreground">
                Es gratis dentro de límites generosos. No compartas tu clave
                con nadie.
              </p>
            </div>
          </CardContent>
        )}
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apikey">API Key</Label>
            <Input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega aquí tu clave de Gemini"
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <FileUploader files={files} onChange={setFiles} />
        <InstructionsUploader
          content={instructions}
          fileName={instructionsName}
          onText={setInstructions}
          onFile={(c, n) => {
            setInstructions(c);
            setInstructionsName(n);
          }}
          onClear={() => {
            setInstructions("");
            setInstructionsName(null);
          }}
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="num">Nº preguntas (1-50)</Label>
            <Input
              id="num"
              type="number"
              min={1}
              max={50}
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(
                  Math.min(50, Math.max(1, Number(e.target.value) || 10))
                )
              }
              className="w-28"
            />
          </div>
          <Button onClick={handleGenerate} disabled={loading} size="lg">
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles />
            )}
            {loading ? "Generando…" : "Generar cuestionario"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">
          Extrayendo texto y probando modelos Gemini (reintenta y cambia de
          modelo si falla)…
        </p>
      )}

      {questions.length > 0 && (
        <>
          <Separator />
          <QuizPreview
            questions={questions}
            onUpdate={updateQuestion}
            onDelete={deleteQuestion}
          />
          <ExportButton questions={questions} />
        </>
      )}
    </main>
  );
}
