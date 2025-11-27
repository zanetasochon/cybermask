import Tesseract from "tesseract.js";

/**
 * OCR dla dokumentów (np. zeskanowanych PDF-ów) z użyciem Tesseract.js.
 * Zakładamy, że na maszynie są dostępne dane językowe dla języka polskiego ("pol").
 */
export async function extractTextWithOcr(buffer: Buffer): Promise<string> {
  const result = await Tesseract.recognize(buffer, "pol");
  return result.data.text ?? "";
}


