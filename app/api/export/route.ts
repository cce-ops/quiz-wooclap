import { NextRequest, NextResponse } from "next/server";
import { buildWooclapBuffer } from "@/lib/wooclapExport";
import { buildWordBuffer } from "@/lib/wordExport";
import { buildMoodleXml } from "@/lib/wooclapXml";
import type { Question } from "@/types";

export const runtime = "nodejs";

type Format = "xlsx" | "docx" | "xml";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      questions?: Question[];
      format?: Format;
    };
    const questions = body.questions ?? [];
    const format: Format =
      body.format === "docx" || body.format === "xml" ? body.format : "xlsx";

    if (format === "docx") {
      const buffer = await buildWordBuffer(questions);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="quiz.docx"',
        },
      });
    }

    if (format === "xml") {
      const xml = buildMoodleXml(questions);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Content-Disposition": 'attachment; filename="quiz-wooclap.xml"',
        },
      });
    }

    const buffer = buildWooclapBuffer(questions);
    const bytes = new Uint8Array(buffer);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="quiz-wooclap.xlsx"',
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al exportar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
