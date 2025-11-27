import { processDocument } from "./redactionEngine";
import type {
  ProcessDocumentInput,
  ProcessedDocument,
} from "./types/processing";

/**
 * Warstwa kliencka:
 *  - w trybie czysto przeglądarkowym korzysta z lokalnego silnika regexowego,
 *  - jeśli dostępny jest backend z Bielikiem/OCR, wysyła plik do /api/process-document.
 */
interface ClientProcessDocumentInput extends ProcessDocumentInput {
  file?: File | null;
}

export async function processDocumentClient(
  input: ClientProcessDocumentInput,
): Promise<ProcessedDocument> {
  const useBackend =
    typeof window !== "undefined" &&
    typeof FormData !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_BIELIK_BACKEND === "true";

  if (!useBackend) {
    return processDocument(input);
  }

  const formData = new FormData();

  if (input.file) {
    formData.append("file", input.file);
  } else {
    const blob = new Blob([input.originalText], { type: "text/plain" });
    formData.append("file", blob, input.fileName);
  }

  formData.append("config", JSON.stringify(input.config));
  formData.append("fileName", input.fileName);
  formData.append("mimeType", input.mimeType);

  const response = await fetch("/api/process-document", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Błąd backendu przetwarzania: ${response.statusText}`);
  }

  const data = (await response.json()) as ProcessedDocument;
  return data;
}


