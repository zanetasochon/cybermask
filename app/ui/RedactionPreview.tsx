import React from "react";
import type { ProcessedDocument } from "../services/types/processing";

interface Props {
  originalText: string;
  result: ProcessedDocument | null;
  isProcessing: boolean;
}

export const RedactionPreview: React.FC<Props> = ({
  originalText,
  result,
  isProcessing,
}) => {
  return (
    <section
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid #27272A",
        background: "rgba(15,23,42,0.9)",
        minHeight: 200,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        Podgląd ocenzurowanego dokumentu
      </h2>
      <p
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          marginBottom: 8,
        }}
      >
        Po uruchomieniu cenzury zobaczysz tutaj porównanie treści przed i po
        przetworzeniu. W docelowej wersji desktopowej zamiast surowego tekstu
        będziesz widzieć podgląd PDF/DOCX z naniesionymi maskami.
      </p>

      {isProcessing && (
        <p
          style={{
            fontSize: 13,
            color: "#38BDF8",
            marginBottom: 8,
          }}
        >
          Przetwarzanie dokumentu, analiza wzorców i nakładanie cenzury...
        </p>
      )}

      {!result && !originalText && !isProcessing && (
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          Wgraj dokument lub wklej treść, a następnie uruchom cenzurowanie, aby
          zobaczyć efekt.
        </p>
      )}

      {result && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            marginTop: 8,
            fontSize: 12,
          }}
        >
          <div>
            <div
              style={{
                marginBottom: 4,
                color: "#9CA3AF",
              }}
            >
              Oryginał
            </div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                borderRadius: 8,
                border: "1px solid #1F2933",
                background: "#020617",
                padding: 8,
                maxHeight: 260,
                overflow: "auto",
              }}
            >
              {originalText}
            </pre>
          </div>
          <div>
            <div
              style={{
                marginBottom: 4,
                color: "#9CA3AF",
              }}
            >
              Po cenzurze
            </div>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                borderRadius: 8,
                border: "1px solid #1F2933",
                background: "#020617",
                padding: 8,
                maxHeight: 260,
                overflow: "auto",
              }}
            >
              {result.redactedText}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
};


