export type RedactionMode = "mask" | "pseudonymize";

export interface RedactionFieldsConfig {
  firstName: boolean;
  lastName: boolean;
  fullName: boolean;
  birthDate: boolean;
  age: boolean;
  phoneNumber: boolean;
  email: boolean;
  pesel: boolean;
  companyName: boolean;
  nip: boolean;
  address: boolean;
  customPatterns: string[];
}

export interface RedactionConfig {
  fields: RedactionFieldsConfig;
  mode: RedactionMode;
  maskChar: string;
  preserveLength: boolean;
  consistentPseudonyms: boolean;
}

export interface ProcessDocumentInput {
  fileName: string;
  mimeType: string;
  originalText: string;
  config: RedactionConfig;
}

export interface EntityOccurrence {
  value: string;
  start: number;
  end: number;
  type:
    | "firstName"
    | "lastName"
    | "fullName"
    | "birthDate"
    | "age"
    | "phoneNumber"
    | "email"
    | "pesel"
    | "companyName"
    | "nip"
    | "address"
    | "custom";
}

export interface ProcessedDocument {
  baseFileName: string;
  originalText: string;
  redactedText: string;
  entities: EntityOccurrence[];
  mapping: Record<string, string>;
}


