import React from "react";
import type { RedactionConfig } from "../services/types/processing";

interface Props {
  config: RedactionConfig;
  onChange: (config: RedactionConfig) => void;
}

export const RedactionConfigPanel: React.FC<Props> = ({ config, onChange }) => {
  const toggleField = (field: keyof RedactionConfig["fields"]) => {
    onChange({
      ...config,
      fields: {
        ...config.fields,
        [field]: !config.fields[field],
      },
    });
  };

  const handleModeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const mode = event.target.value as RedactionConfig["mode"];
    onChange({ ...config, mode });
  };

  return (
    <aside
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid #27272A",
        background: "rgba(15,23,42,0.9)",
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        Ustawienia cenzury
      </h2>
      <p
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          marginBottom: 12,
        }}
      >
        Wybierz, jakie typy danych mają zostać wykryte i ocenzurowane. W
        wersji desktopowej wykrywanie będzie realizowane przez lokalny model
        językowy (LLM) i OCR.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 4,
          marginBottom: 12,
          fontSize: 13,
        }}
      >
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.firstName}
            onChange={() => toggleField("firstName")}
          />
          <span>Imiona</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.lastName}
            onChange={() => toggleField("lastName")}
          />
          <span>Nazwiska</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.fullName}
            onChange={() => toggleField("fullName")}
          />
          <span>Imię i nazwisko</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.birthDate}
            onChange={() => toggleField("birthDate")}
          />
          <span>Daty urodzenia</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.age}
            onChange={() => toggleField("age")}
          />
          <span>Wiek</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.phoneNumber}
            onChange={() => toggleField("phoneNumber")}
          />
          <span>Telefon</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.email}
            onChange={() => toggleField("email")}
          />
          <span>E-mail</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.pesel}
            onChange={() => toggleField("pesel")}
          />
          <span>PESEL</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.companyName}
            onChange={() => toggleField("companyName")}
          />
          <span>Nazwa firmy</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.nip}
            onChange={() => toggleField("nip")}
          />
          <span>NIP</span>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={config.fields.address}
            onChange={() => toggleField("address")}
          />
          <span>Adresy</span>
        </label>
      </div>

      <fieldset
        style={{
          border: "1px solid #27272A",
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <legend
          style={{
            fontSize: 12,
            padding: "0 4px",
            color: "#A1A1AA",
          }}
        >
          Tryb cenzury
        </legend>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          <input
            type="radio"
            name="mode"
            value="mask"
            checked={config.mode === "mask"}
            onChange={handleModeChange}
          />
          <span>
            Zamazanie danych{" "}
            <span style={{ color: "#6B7280" }}>
              (np. █████ lub \[imię ocenzurowane\])
            </span>
          </span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          <input
            type="radio"
            name="mode"
            value="pseudonymize"
            checked={config.mode === "pseudonymize"}
            onChange={handleModeChange}
          />
          <span>
            Zamiana na inne dane{" "}
            <span style={{ color: "#6B7280" }}>
              (spójna pseudonimizacja w całym dokumencie)
            </span>
          </span>
        </label>
      </fieldset>

      {config.mode === "mask" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
            fontSize: 13,
          }}
        >
          <label>
            Znak maski:{" "}
            <input
              type="text"
              maxLength={1}
              value={config.maskChar}
              onChange={(e) =>
                onChange({ ...config, maskChar: e.target.value || "█" })
              }
              style={{
                width: 32,
                marginLeft: 4,
              }}
            />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={config.preserveLength}
              onChange={() =>
                onChange({
                  ...config,
                  preserveLength: !config.preserveLength,
                })
              }
            />
            <span style={{ color: "#9CA3AF" }}>Zachowaj długość ciągu</span>
          </label>
        </div>
      )}

      <label
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          fontSize: 12,
          color: "#9CA3AF",
        }}
      >
        <input
          type="checkbox"
          checked={config.consistentPseudonyms}
          onChange={() =>
            onChange({
              ...config,
              consistentPseudonyms: !config.consistentPseudonyms,
            })
          }
        />
        <span>Ta sama osoba =&gt; ta sama zamiana w całym dokumencie</span>
      </label>
    </aside>
  );
};


