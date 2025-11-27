"use client";

import React, { useState } from "react";
import { RedactionConfigPanel } from "./ui/RedactionConfigPanel";
import { RedactionPreview } from "./ui/RedactionPreview";
import { processDocumentClient } from "./services/processDocumentClient";
import type {
  ProcessedDocument,
  RedactionConfig,
} from "./services/types/processing";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [config, setConfig] = useState<RedactionConfig>({
    fields: {
      firstName: true,
      lastName: true,
      fullName: true,
      birthDate: true,
      age: false,
      phoneNumber: true,
      email: true,
      pesel: true,
      companyName: true,
      nip: true,
      address: false,
      customPatterns: [],
    },
    mode: "mask",
    maskChar: "█",
    preserveLength: true,
    consistentPseudonyms: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setError(null);

    // Na potrzeby wersji webowej – odczytujemy pliki tekstowe,
    // a dla PDF/DOCX pokazujemy placeholder.
    if (selected.type === "text/plain") {
      const text = await selected.text();
      setRawText(text);
    } else {
      setRawText(
        "Wersja demonstracyjna: pełna obsługa PDF/DOC/DOCX z OCR będzie realizowana w warstwie desktopowej / backendowej.\nAktualnie możesz przetestować silnik cenzury na pliku .txt.",
      );
    }
  };

  const handleProcess = async () => {
    if (!rawText) {
      setError("Najpierw wgraj dokument lub wprowadź tekst.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const processed = await processDocumentClient({
        file,
        fileName: file?.name ?? "wklejony_tekst.txt",
        mimeType: file?.type ?? "text/plain",
        originalText: rawText,
        config,
      });
      setResult(processed);
    } catch (e) {
      console.error(e);
      setError("Wystąpił błąd podczas przetwarzania dokumentu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.redactedText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.baseFileName}_ocenzurowany.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          maxWidth: 1200,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              marginBottom: 16,
            }}
          >
            CyberMask –{" "}
            <span style={{ color: "#22d3ee" }}>
              dokumenty mówią mniej, niż wiedzą
            </span>
          </h1>
          <p
            style={{
              marginBottom: 24,
              maxWidth: 640,
              color: "#A1A1AA",
            }}
          >
            Wgraj dokument, wybierz jakie dane mają zniknąć (imiona, nazwiska,
            PESEL, NIP, numery telefonów itd.), a CyberMask zadba o spójną
            cenzurę i przygotuje materiał do bezpiecznego udostępnienia –
            zachowując prawdę, ale nie zdradzając człowieka.
          </p>

          <div
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              border: "1px solid #27272A",
              background: "rgba(15,23,42,0.85)",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                color: "#E4E4E7",
              }}
            >
              Wgraj dokument (.txt, docx, pdf)
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#71717A",
              }}
            >
              Wersja webowa służy jako prototyp silnika cenzury. W trybie
              desktopowym dokumenty pozostają lokalnie, a OCR i LLM działają
              offline.
            </p>
          </div>

          <div
            style={{
              marginBottom: 16,
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontSize: 14,
                color: "#E4E4E7",
              }}
            >
              Podgląd surowego tekstu
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Możesz też wkleić tutaj treść dokumentu..."
              style={{
                width: "100%",
                minHeight: 200,
                borderRadius: 12,
                border: "1px solid #27272A",
                background: "#020617",
                color: "#F4F4F5",
                padding: 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco",
                fontSize: 13,
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleProcess}
            disabled={isProcessing}
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #22c55e 0%, #22d3ee 45%, #4f46e5 100%)",
              color: "#020617",
              fontWeight: 600,
              cursor: isProcessing ? "wait" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? "Cenzurowanie..." : "Ocenzuruj dokument"}
          </button>

          {error && (
            <p
              style={{
                marginTop: 12,
                color: "#f97373",
                fontSize: 14,
              }}
            >
              {error}
            </p>
          )}

          {result && (
            <button
              type="button"
              onClick={handleDownload}
              style={{
                marginTop: 16,
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #4b5563",
                background: "transparent",
                color: "#E5E7EB",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Pobierz ocenzurowany plik (.txt)
            </button>
          )}
        </div>

        <div>
          <RedactionConfigPanel config={config} onChange={setConfig} />
          <RedactionPreview
            originalText={rawText}
            result={result}
            isProcessing={isProcessing}
          />
        </div>
      </section>
    </main>
  );
}


