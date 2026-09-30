"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const ACCEPT = ".pdf,.pptx,.docx,.txt";

/** Límite total recomendado de material por cuestionario. */
export const MAX_TOTAL_MB = 50;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileUploader({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  function add(list: FileList | null) {
    if (!list) return;
    onChange([...files, ...Array.from(list)]);
  }

  function removeAt(i: number) {
    onChange(files.filter((_, j) => j !== i));
  }

  const totalBytes = files.reduce((n, f) => n + f.size, 0);
  const totalMB = totalBytes / 1024 / 1024;
  const overLimit = totalMB > MAX_TOTAL_MB;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material del curso</CardTitle>
        <CardDescription>PDF, PPTX, DOCX, TXT. Varios archivos.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Total: {totalMB.toFixed(1)} MB de {MAX_TOTAL_MB} MB máximos. Si
          superas el límite, quita archivos o comprímelos en PDF.
        </p>
        <Input
          type="file"
          accept={ACCEPT}
          multiple
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin archivos.</p>
        ) : (
          <>
            {overLimit && (
              <p className="text-sm text-destructive">
                Superas los {MAX_TOTAL_MB} MB: quita algún archivo antes de
                generar.
              </p>
            )}
          <ul className="flex flex-col gap-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5 text-sm"
              >
                <span className="truncate">
                  {f.name}{" "}
                  <Badge variant="secondary">{formatSize(f.size)}</Badge>
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeAt(i)}
                  aria-label={`Quitar ${f.name}`}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
