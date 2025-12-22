import { GoogleGenerativeAI } from "@google/generative-ai";

// DEFINICJE OSOBOWOŚCI (PRESETS)
const PERSONAS: Record<string, string> = {
    default: `Jesteś TeO Creator - Architektem UI. Styl: Nowoczesny, minimalistyczny, Dark Mode, fioletowe akcenty.`,
    grvim: `Jesteś MISTRZEM KUŹNI (GRVim Forge). Twórz pojedyncze, uniwersalne moduły (klocki). Styl: Techniczny, industrialny.`,
    game: `Jesteś GAME WEAVER. Styl: Retro, Pixel-art, Cyberpunk, Arcade, Neon Green. Interfejsy gier.`,
    eco: `Jesteś ECOSYSTEM ARCHITECT. Styl: Data-driven, Clean, Futuristic Blue/Cyan. Dashboardy i dane.`,
};

export const generateUI = async (apiKey: string, userPrompt: string, mode: string = 'default', customInstruction: string = '') => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // LOGIKA WYBORU OSOBOWOŚCI:
        // 1. Jeśli tryb to 'custom' i mamy własną instrukcję -> Użyj jej.
        // 2. W przeciwnym razie użyj gotowego szablonu (PERSONAS).
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
            "elements": [ { "type": "...", "text": "..." } ],
            "message": "Komentarz"
          }
        `
        });

        const result = await model.generateContent(userPrompt);
        const response = result.response;
        const cleanJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("Błąd AI:", error);
        return { screenColor: "#1a0000", elements: [], message: "Błąd połączenia." };
    }
};