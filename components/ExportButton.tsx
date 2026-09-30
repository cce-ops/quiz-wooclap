"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types";
import { FileCode2, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

type Format = "xlsx" | "docx" | "xml";

const FILES: Record<Format, string> = {
  xlsx: "quiz-wooclap.xlsx",
  docx: "quiz.docx",
  xml: "quiz-wooclap.xml",
};

export function ExportButton({ questions }: { questions: Question[] }) {
  const [busy, setBusy] = useState<Format | null>(null);
  const [error, setError] = useState("");

  async function handleExport(format: Format) {
    setBusy(format);
    setError("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, format }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Error al exportar.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FILES[format];
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar.");
    } finally {
      setBusy(null);
    }
  }

  const disabled = busy !== null || questions.length === 0;

  function label(format: Format, text: string) {
    return busy === format ? "Generando…" : text;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => handleExport("xlsx")} disabled={disabled} size="lg">
          {busy === "xlsx" ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
          {label("xlsx", "Excel Wooclap (.xlsx)")}
        </Button>
        <Button onClick={() => handleExport("docx")} disabled={disabled} size="lg" variant="secondary">
          {busy === "docx" ? <Loader2 className="animate-spin" /> : <FileText />}
          {label("docx", "Word (.docx)")}
        </Button>
        <Button onClick={() => handleExport("xml")} disabled={disabled} size="lg" variant="outline">
          {busy === "xml" ? <Loader2 className="animate-spin" /> : <FileCode2 />}
          {label("xml", "XML Wooclap (.xml)")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        El .xml usa formato Moodle: en Wooclap, Import questions → From Moodle.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
