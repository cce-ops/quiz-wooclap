import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import JSZip from "jszip";

export const MAX_CHARS = 90000;
/** Rechazo por archivo en servidor (evita colgar memoria). */
export const MAX_FILE_MB = 50;

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

function extractTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

async function extractPptx(buffer: Buffer): Promise<string> {
  // PPTX = zip con XML en ppt/slides/slide*.xml, texto en nodos <a:t>
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)?.[1] ?? "0", 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)?.[1] ?? "0", 10);
      return na - nb;
    });
  if (slideFiles.length === 0) return "";
  const parts: string[] = [];
  for (const name of slideFiles) {
    const file = zip.files[name];
    const xml = await file.async("string");
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const texts = matches
      .map((m) => m.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
    if (texts.length > 0) parts.push(texts.join(" "));
  }
  return parts.join("\n\n");
}

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = getExtension(filename);
  switch (ext) {
    case "pdf":
      return cleanText(await extractPdf(buffer));
    case "docx":
      return cleanText(await extractDocx(buffer));
    case "txt":
    case "md":
      return cleanText(extractTxt(buffer));
    case "pptx":
      return cleanText(await extractPptx(buffer));
    default:
      throw new Error(`Formato no soportado: ${filename}`);
  }
}

/** Recibe File[] (Web API, válido en Route Handler server) y devuelve string concatenado, limitado. */
export async function extractTextFromFiles(files: File[]): Promise<{
  text: string;
  truncated: boolean;
  chars: number;
}> {
  const chunks: string[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      throw new Error(
        `${file.name} supera ${MAX_FILE_MB} MB: comprímelo o divídelo.`
      );
    }
    const ab = await file.arrayBuffer();
    const text = await extractTextFromBuffer(
      Buffer.from(ab),
      file.name || "archivo"
    );
    if (text) chunks.push(`=== ${file.name} ===\n${text}`);
  }
  const joined = cleanText(chunks.join("\n\n"));
  const truncated = joined.length > MAX_CHARS;
  const text = truncated ? joined.slice(0, MAX_CHARS) : joined;
  return { text, truncated, chars: text.length };
}
