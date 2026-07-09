// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generuje treść używając Gemini API (Cloud AI - tryb 'resonance')
 * @param prompt - Prompt użytkownika
 * @param mode - Tryb generowania (aktualnie tylko 'resonance')
 * @returns Wygenerowana odpowiedź w formie tekstu
 */
export const generateContent = async (prompt: string, mode: string = 'resonance'): Promise<string> => {
    try {
        // Pobierz klucz API z localStorage lub zmiennej środowiskowej
        const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('Brak klucza API Gemini. Skonfiguruj klucz w ustawieniach.');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: `Jesteś ekspertem programowania React i TypeScript. 
            Tworzysz kod wysokiej jakości, dobrze sformatowany i gotowy do użycia.
            Zawsze zwracaj kod w blokach \`\`\`typescript lub \`\`\`tsx.`
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();

    } catch (error) {
        console.error('Błąd Gemini Service:', error);
        throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Generuje UI/kod z obrazem (multimodal)
 */
export const generateWithImage = async (prompt: string, imageBase64: string): Promise<string> => {
    try {
        const apiKey = localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('Brak klucza API Gemini');
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const imagePart = {
            inlineData: {
                data: imageBase64.split(',')[1],
                mimeType: 'image/jpeg'
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();

    } catch (error) {
        console.error('Błąd Gemini Vision:', error);
        throw new Error(`Gemini Vision Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
