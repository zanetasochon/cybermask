import type {
  EntityOccurrence,
  ProcessDocumentInput,
  ProcessedDocument,
  RedactionConfig,
} from "./types/processing";

/**
 * Prosta, regexowa wersja silnika cenzury.
 * W wersji docelowej wykrywanie encji zostanie zastąpione przez lokalny LLM + OCR.
 */

export async function processDocument(
  input: ProcessDocumentInput,
): Promise<ProcessedDocument> {
  const { fileName, originalText, config } = input;

  const entities = detectEntities(originalText, config);
  return redactWithProvidedEntities(input, entities);
}

export function redactWithProvidedEntities(
  input: ProcessDocumentInput,
  entities: EntityOccurrence[],
): ProcessedDocument {
  const { fileName, originalText, config } = input;

  const { redactedText, mapping } = applyRedaction(
    originalText,
    entities,
    config,
  );

  const baseFileName = fileName.replace(/\.[^.]+$/, "");

  return {
    baseFileName,
    originalText,
    redactedText,
    entities,
    mapping,
  };
}

function detectEntities(
  text: string,
  config: RedactionConfig,
): EntityOccurrence[] {
  const entities: EntityOccurrence[] = [];

  const pushMatches = (
    regex: RegExp,
    type: EntityOccurrence["type"],
    enabled: boolean,
  ) => {
    if (!enabled) return;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      entities.push({
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        type,
      });
    }
  };

  // Uproszczone wzorce – lepsze wykrywanie powinno bazować na LLM + regułach.
  pushMatches(
    /\b\d{11}\b/g, // PESEL
    "pesel",
    config.fields.pesel,
  );

  pushMatches(
    /\b\d{10}\b/g, // uproszczony NIP
    "nip",
    config.fields.nip,
  );

  pushMatches(
    /\b(?:\+?\d{1,3}[- ]?)?(?:\d{3}[- ]?\d{3}[- ]?\d{3})\b/g,
    "phoneNumber",
    config.fields.phoneNumber,
  );

  pushMatches(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "email",
    config.fields.email,
  );

  pushMatches(
    /\b\d{1,3}\s*(?:lat|l\.)\b/gi,
    "age",
    config.fields.age,
  );

  pushMatches(
    /\b\d{4}-\d{2}-\d{2}\b/g, // 2024-01-31
    "birthDate",
    config.fields.birthDate,
  );

  // Prosta detekcja "Imię Nazwisko" – w praktyce lepiej to robić modelem.
  if (config.fields.fullName || config.fields.firstName || config.fields.lastName) {
    const nameRegex = /\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)+\b/g;
    let match: RegExpExecArray | null;
    while ((match = nameRegex.exec(text)) !== null) {
      const value = match[0];
      const parts = value.split(/\s+/);
      if (config.fields.fullName) {
        entities.push({
          value,
          start: match.index,
          end: match.index + value.length,
          type: "fullName",
        });
      } else {
        if (config.fields.firstName) {
          entities.push({
            value: parts[0],
            start: match.index,
            end: match.index + parts[0].length,
            type: "firstName",
          });
        }
        if (config.fields.lastName && parts.length > 1) {
          const lastName = parts[parts.length - 1];
          const lastStart =
            match.index + value.length - lastName.length;
          entities.push({
            value: lastName,
            start: lastStart,
            end: lastStart + lastName.length,
            type: "lastName",
          });
        }
      }
    }
  }

  // Własne wzorce użytkownika – zwykłe substringi lub mini-regexy.
  for (const pattern of config.fields.customPatterns || []) {
    try {
      const customRegex = new RegExp(pattern, "g");
      pushMatches(customRegex, "custom", true);
    } catch {
      // Ignorujemy błędne regexy w wersji demo.
    }
  }

  // Posortuj encje po pozycji startowej.
  entities.sort((a, b) => a.start - b.start);

  return entities;
}

function applyRedaction(
  text: string,
  entities: EntityOccurrence[],
  config: RedactionConfig,
): { redactedText: string; mapping: Record<string, string> } {
  if (entities.length === 0) {
    return { redactedText: text, mapping: {} };
  }

  const mapping = new Map<string, string>();

  const buildMask = (value: string) => {
    if (config.preserveLength) {
      return config.maskChar.repeat(value.length);
    }
    return `[${value[0] ? value[0] : ""}… ocenzurowane]`;
  };

  const getPseudonym = (value: string, type: EntityOccurrence["type"]) => {
    const key = config.consistentPseudonyms ? `${type}:${value}` : value;
    const existing = mapping.get(key);
    if (existing) return existing;

    // Prosta pseudonimizacja demonstracyjna.
    const base =
      type === "fullName" || type === "firstName" || type === "lastName"
        ? "Osoba"
        : type === "companyName"
          ? "Firma"
          : type === "pesel"
            ? "ID"
            : type === "nip"
              ? "NIP"
              : type === "phoneNumber"
                ? "Telefon"
                : type === "email"
                  ? "Email"
                  : "Dane";

    const pseudo = `${base}_${mapping.size + 1}`;
    mapping.set(key, pseudo);
    return pseudo;
  };

  let result = "";
  let cursor = 0;

  for (const entity of entities) {
    if (entity.start < cursor) {
      continue;
    }
    result += text.slice(cursor, entity.start);

    const original = entity.value;
    let replacement: string;

    if (config.mode === "mask") {
      replacement = buildMask(original);
    } else {
      replacement = getPseudonym(original, entity.type);
    }

    result += replacement;
    cursor = entity.end;
  }

  result += text.slice(cursor);

  const mappingObject: Record<string, string> = {};
  for (const [key, value] of mapping.entries()) {
    mappingObject[key] = value;
  }

  return { redactedText: result, mapping: mappingObject };
}


