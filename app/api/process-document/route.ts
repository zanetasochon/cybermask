import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "../../server/ocr/pdfTextExtractor";
import { extractEntitiesWithBielik } from "../../server/llm/bielikClient";
import {
  processDocument,
  redactWithProvidedEntities,
} from "../../services/redactionEngine";
import type {
  EntityOccurrence,
  ProcessDocumentInput,
  RedactionConfig,
} from "../../services/types/processing";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const file = formData.get("file");
  const rawConfig = formData.get("config");
  const formFileName = formData.get("fileName");
  const formMimeType = formData.get("mimeType");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Brak pliku w żądaniu." },
      { status: 400 },
    );
  }

  if (typeof rawConfig !== "string") {
    return NextResponse.json(
      { error: "Brak konfiguracji cenzury." },
      { status: 400 },
    );
  }

  let config: RedactionConfig;
  try {
    config = JSON.parse(rawConfig) as RedactionConfig;
  } catch {
    return NextResponse.json(
      { error: "Nieprawidłowy format konfiguracji." },
      { status: 400 },
    );
  }

  const fileName =
    (typeof formFileName === "string" && formFileName) || file.name || "plik";
  const mimeType =
    (typeof formMimeType === "string" && formMimeType) ||
    file.type ||
    "application/octet-stream";

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let text: string;

  if (mimeType === "application/pdf") {
    // PDF – najpierw spróbuj warstwy tekstowej, potem OCR.
    text = await extractTextFromPdf(buffer);
  } else if (mimeType.startsWith("text/")) {
    text = await file.text();
  } else {
    // Inne typy (docx, obrazy itp.) – na razie traktujemy całość przez OCR.
    text = await import("../../server/ocr/ocrService").then(({ extractTextWithOcr }) =>
      extractTextWithOcr(buffer),
    );
  }

  const baseInput: ProcessDocumentInput = {
    fileName,
    mimeType,
    originalText: text,
    config,
  };

  let entities: EntityOccurrence[] | null = null;

  // Jeśli skonfigurowano serwer Bielika – użyj go do wykrywania encji.
  if (process.env.BIELIK_API_URL || process.env.BIELIK_MODEL) {
    try {
      entities = await extractEntitiesWithBielik(text, config);
    } catch (error) {
      console.error("Błąd Bielika, fallback na regex:", error);
    }
  }

  let result;
  if (entities && entities.length > 0) {
    result = redactWithProvidedEntities(baseInput, entities);
  } else {
    result = await processDocument(baseInput);
  }

  return NextResponse.json(result);
}


