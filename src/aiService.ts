import { GoogleGenerativeAI } from "@google/generative-ai";

// DEFINICJE OSOBOWOŚCI (PRESETS)
const PERSONAS: Record<string, string> = {
  default: `Jesteś TeO Creator - Architektem UI. Styl: Nowoczesny, minimalistyczny, Dark Mode, fioletowe akcenty.`,
  grvim: `Jesteś MISTRZEM KUŹNI (GRVim Forge). Twórz pojedyncze, uniwersalne moduły (klocki). Styl: Techniczny, industrialny.`,
  game: `Jesteś GAME WEAVER. Styl: Retro, Pixel-art, Cyberpunk, Arcade, Neon Green. Interfejsy gier.`,
  eco: `Jesteś ECOSYSTEM ARCHITECT. Styl: Data-driven, Clean, Futuristic Blue/Cyan. Dashboardy i dane.`,
  // NOWOŚĆ: MODUŁ BIZNESOWY DLA SIOSTRY
  business: `
    Jesteś WEB ARCHITECT dla Sieci GraviTON.
    Tworzysz profesjonalne strony wizytówkowe dla fizycznych biznesów (Kawiarnie, Salony, Sklepy).
    STYL: Elegancki, ciepły, 'Coffee & Gold', czytelny, zachęcający.
    
    KLUCZOWE ELEMENTY DO UŻYWANIA:
    - Sekcje Hero z dużym napisem zapraszającym.
    - Karty Menu (Nazwa dania + Cena).
    - Moduł "Wymiana Energii" (Przycisk Płatności/Rezerwacji).
    - Sekcja "O Nas" z opisem klimatu.
    
    Pamiętaj: To ma wyglądać jak gotowa, piękna strona mobilna kawiarni.
  `
};

// PRZYWRÓCONA FUNKCJA GENERUJĄCA
export const generateUI = async (apiKey: string, userPrompt: string, mode: string = 'default', customInstruction: string = '') => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // LOGIKA WYBORU OSOBOWOŚCI:
    let personaInstruction = PERSONAS[mode] || PERSONAS['default'];

    if (mode === 'custom' && customInstruction) {
      personaInstruction = `TRYB NIESTANDARDOWY (CUSTOM CORE). Twoja rola: ${customInstruction}`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
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
            "message": "Krótki komentarz"
          }
          Nie używaj Markdown (bloków kodu). Zwróć surowy JSON.
        `
    });

    const result = await model.generateContent(userPrompt);
    const response = result.response;
    // Czyszczenie ewentualnych znaczników markdown
    const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Błąd AI:", error);
    return {
      screenColor: "#1a0000",
      elements: [],
      message: "Błąd połączenia z Węzłem Kreatywnym. Sprawdź klucz API."
    };
  }
};