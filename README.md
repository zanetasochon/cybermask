## Cybermask
Cybermask to narzędzie do inteligentnej anonimizacji dokumentów, które usuwa wszystkie dane pozwalające zidentyfikować człowieka, jednocześnie zachowując pełny sens, kontekst i prawdziwość treści. Projekt powstał w ramach wyzwania „Dane bez twarzy” (NASK) podczas Hackathonu HackNation 2025.

### Uruchomienie lokalne z Bielikiem i OCR

1. **Instalacja zależności i start środowiska developerskiego**

   ```bash
   npm install
   npm run dev
   ```

   Aplikacja będzie dostępna pod `http://localhost:3000`.

2. **Uruchom lokalny serwer Bielika**

   - Uruchom model Bielik jako serwer OpenAI‑kompatybilny (np. na `http://127.0.0.1:11434/v1/chat/completions`) z modelem `bielik`.
   - Szczegóły zależą od konkretnej dystrybucji Bielika (np. `ollama`, `llama.cpp` lub dedykowany serwer od NASK).

3. **Ustaw zmienne środowiskowe (plik `.env.local` w katalogu projektu)**

   ```bash
   BIELIK_API_URL=http://127.0.0.1:11434/v1/chat/completions
   BIELIK_MODEL=bielik
   NEXT_PUBLIC_USE_BIELIK_BACKEND=true
   ```

   - `BIELIK_API_URL` – adres lokalnego endpointu Bielika.
   - `BIELIK_MODEL` – nazwa modelu wystawionego przez serwer.
   - `NEXT_PUBLIC_USE_BIELIK_BACKEND` – ustaw na `true`, aby frontend korzystał z backendu (Bielik + OCR) zamiast czystych regexów w przeglądarce.

4. **OCR i PDF-y**

   - Projekt korzysta z `tesseract.js` oraz `pdf-parse`.
   - Upewnij się, że:
     - masz zainstalowane dane językowe Tesseract dla języka polskiego (`pol`),
     - środowisko, w którym uruchamiasz aplikację, ma dostęp do tych danych (lokalnie na maszynie / w kontenerze).

5. **Jak to działa po konfiguracji**

   - dla zwykłych PDF‑ów z warstwą tekstową – backend odczytuje tekst bez OCR,
   - dla zeskanowanych PDF‑ów – backend automatycznie wykonuje OCR,
   - Bielik wykrywa encje w dokumencie po polsku (imiona, nazwiska, PESEL, NIP, telefony, e‑maile itd.),
   - silnik redakcji w Cybermask dba o:
     - cenzurę (maskowanie) lub zamianę na pseudonimy,
     - spójność zamian (ta sama osoba/dane → ten sam pseudonim w całym dokumencie).

