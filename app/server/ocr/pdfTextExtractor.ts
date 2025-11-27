import pdf from "pdf-parse";
import { extractTextWithOcr } from "./ocrService";

/**
 * Próbuje najpierw odczytać tekst z warstwy tekstowej PDF.
 * Jeśli jest pusty / bardzo krótki, używa OCR (Tesseract).
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  const text = data.text ?? "";

  if (text.trim().length > 30) {
    return text;
  }

  // Prawdopodobnie zeskanowany dokument – użyj OCR.
  return extractTextWithOcr(buffer);
}


