import { GoogleGenerativeAI } from "@google/generative-ai";

// DEFINICJE OSOBOWOŚCI (PRESETS)
const PERSONAS: Record<string, string> = {
  default: `Jesteś TeO Creator - Architektem UI. Styl: Nowoczesny, minimalistyczny, Dark Mode, fioletowe akcenty.`,
  grvim: `Jesteś MISTRZEM KUŹNI (GRVim Forge). Twórz pojedyncze, uniwersalne moduły (klocki). Styl: Techniczny, industrialny.`,
  game: `Jesteś GAME WEAVER. Styl: Retro, Pixel-art, Cyberpunk, Arcade, Neon Green. Interfejsy gier.`,
  eco: `Jesteś ECOSYSTEM ARCHITECT. Styl: Data-driven, Clean, Futuristic Blue/Cyan. Dashboardy i dane.`,
  business: `
    Jesteś WEB ARCHITECT dla Sieci GraviTON.
    Tworzysz profesjonalne strony wizytówkowe dla fizycznych biznesów (Kawiarnie, Salony, Sklepy).
    STYL: Elegancki, ciepły, 'Coffee & Gold', czytelny, zachęcający.
    
    JEŚLI DOSTANIESZ ZDJĘCIE:
    1. Przeanalizuj kolory na zdjęciu i użyj ich w "screenColor" oraz kolorach przycisków.
    2. Jeśli na zdjęciu jest MENU (tekst), przepisz pozycje do kart (Card).
    3. Jeśli na zdjęciu jest PRODUKT (np. ciasto), stwórz sekcję promującą ten produkt.
  `
};

// Funkcja pomocnicza do konwersji Base64 na format Gemini
function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: path.split(',')[1], // Usuwamy nagłówek 'data:image/jpeg;base64,'
      mimeType
    },
  };
}

export const generateUI = async (apiKey: string, userPrompt: string, mode: string = 'default', customInstruction: string = '', imageBase64: string | null = null) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    let personaInstruction = PERSONAS[mode] || PERSONAS['default'];
    if (mode === 'custom' && customInstruction) {
      personaInstruction = `TRYB NIESTANDARDOWY (CUSTOM CORE). Twoja rola: ${customInstruction}`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // Flash jest świetny do Vision!
      systemInstruction: `
          ${personaInstruction}
          
          ZASADA NADRZĘDNA:
          Zwracaj TYLKO czysty kod JSON w formacie:
          {
            "screenColor": "#hex",
            "elements": [ 
               { "type": "header", "text": "..." },
               { "type": "button", "text": "...", "color": "..." },
               { "type": "text", "content": "..." },
               { "type": "input", "placeholder": "..." },
               { "type": "card", "title": "...", "subtitle": "..." }
            ],
            "message": "Krótki komentarz co zanalizowano"
          }
          Nie używaj Markdown.
        `
    });

    // Budowanie zapytania (Tekst + Opcjonalny Obraz)
    const promptParts: any[] = [userPrompt];

    if (imageBase64) {
      // Zakładamy, że to JPEG lub PNG. Gemini Flash radzi sobie z tym.
      promptParts.push(fileToGenerativePart(imageBase64, "image/jpeg"));
    }

    const result = await model.generateContent(promptParts);
    const response = result.response;
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Błąd AI:", error);
    return {
      screenColor: "#1a0000",
      elements: [],
      message: "Błąd analizy danych lub obrazu. Sprawdź klucz API."
    };
  }
};