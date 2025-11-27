import type {
  EntityOccurrence,
  RedactionConfig,
} from "../../services/types/processing";

const BIELIK_API_URL =
  process.env.BIELIK_API_URL ??
  "http://127.0.0.1:11434/v1/chat/completions";
const BIELIK_MODEL = process.env.BIELIK_MODEL ?? "bielik";

interface BielikEntity {
  value: string;
  start: number;
  end: number;
  type: EntityOccurrence["type"];
}

interface BielikResponse {
  entities: BielikEntity[];
}

/**
 * Klient do lokalnie uruchomionego LLM „Bielik”.
 *
 * Zakładamy, że działa on jako serwer kompatybilny z OpenAI / Ollama:
 *  - URL: BIELIK_API_URL (domyślnie http://127.0.0.1:11434/v1/chat/completions)
 *  - model: BIELIK_MODEL (np. "bielik")
 *
 * Prompt prosi model o zwrot ściśle zdefiniowanego JSON-a z listą encji.
 */
export async function extractEntitiesWithBielik(
  text: string,
  config: RedactionConfig,
): Promise<EntityOccurrence[]> {
  const systemPrompt =
    "Jesteś modelem do anonimizacji dokumentów w języku polskim. " +
    "Masz za zadanie wykrywać dane osobowe i wrażliwe (imiona, nazwiska, pełne imię i nazwisko, daty urodzenia, wiek, numery telefonów, adresy e-mail, PESEL, NIP, nazwy firm, adresy) " +
    "i zwrócić je w formacie JSON, z pozycjami start/end w tekście.";

  const enabledTypes = Object.entries(config.fields)
    .filter(([key, value]) => key !== "customPatterns" && value === true)
    .map(([key]) => key)
    .join(", ");

  const userPrompt =
    `Oto treść dokumentu, w którym masz wykryć dane wrażliwe. ` +
    `Interesujące typy danych: ${enabledTypes || "wszystkie dostępne"}. ` +
    `Zwróć TYLKO czysty JSON w formacie:\n` +
    `{"entities":[{"value":"...", "start":0, "end":10, "type":"fullName"}]}\n` +
    `Dozwolone typy: "firstName", "lastName", "fullName", "birthDate", "age", "phoneNumber", "email", "pesel", "companyName", "nip", "address", "custom".\n\n` +
    `Dokument:\n` +
    text;

  const response = await fetch(BIELIK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: BIELIK_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Bielik API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content) as BielikResponse;
    if (!parsed.entities || !Array.isArray(parsed.entities)) {
      return [];
    }
    return parsed.entities.map((e) => ({
      value: e.value,
      start: e.start,
      end: e.end,
      type: e.type,
    }));
  } catch {
    // Jeśli model zwrócił coś innego niż czysty JSON – na razie ignorujemy.
    return [];
  }
}


