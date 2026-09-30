import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFiles } from "@/lib/extractText";
import { generateQuiz } from "@/lib/generateQuiz";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let material = "";
    let instructions = "";
    let numQuestions = 10;
    let apiKey = "";
    let truncated = false;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("files").filter((f): f is File => f instanceof File);
      if (files.length === 0) {
        return NextResponse.json(
          { error: "Sube al menos 1 archivo de material." },
          { status: 400 }
        );
      }
      const extracted = await extractTextFromFiles(files);
      material = extracted.text;
      truncated = extracted.truncated;
      instructions = String(form.get("instructions") ?? "");
      numQuestions = Number(form.get("numQuestions") ?? 10) || 10;
      apiKey = String(form.get("apiKey") ?? "");
    } else {
      const body = (await req.json()) as {
        text?: string;
        instructions?: string;
        numQuestions?: number;
        apiKey?: string;
      };
      material = body.text ?? "";
      instructions = body.instructions ?? "";
      numQuestions = body.numQuestions ?? 10;
      apiKey = body.apiKey ?? "";
    }

    if (!material.trim()) {
      return NextResponse.json(
        { error: "No se extrajo texto del material." },
        { status: 400 }
      );
    }

    const result = await generateQuiz(material, instructions, numQuestions, apiKey);
    return NextResponse.json({
      ...result,
      meta: { chars: material.length, truncated },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error interno.";
    const status = /API Key|material|archivo|texto/i.test(message)
      ? 400
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
