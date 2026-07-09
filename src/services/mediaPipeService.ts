// services/mediaPipeService.ts

/**
 * Serwis do lokalnego AI (on-device) - tryb 'just'
 * 
 * UWAGA: To jest wersja placeholder/symulacja.
 * W pełnej implementacji można użyć:
 * - MediaPipe Tasks (jeśli dostępne dla generacji tekstu)
 * - WebLLM (https://webllm.mlc.ai/)
 * - Transformers.js
 * - Gemini Nano (gdy będzie dostępny w Chrome)
 */

/**
 * Generuje treść lokalnie na urządzeniu (tryb 'just')
 * @param prompt - Prompt użytkownika
 * @returns Wygenerowana odpowiedź (obecnie symulacja)
 */
export const generateOnDevice = async (prompt: string): Promise<string> => {
    // Symulacja opóźnienia (jak prawdziwy model lokalny)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // PLACEHOLDER: W przyszłości tutaj będzie prawdziwy model on-device
    // Możliwe opcje:
    // 1. WebLLM: const model = await CreateWebLLMEngine(...)
    // 2. Transformers.js: const pipeline = await pipeline('text-generation', ...)
    // 3. Gemini Nano: window.ai.generateText(...)

    return `// === LOCAL FORGE MODE ===
// Prompt: ${prompt}

import React from 'react';

// Kod wygenerowany lokalnie (symulacja)
// W pełnej wersji tutaj będzie odpowiedź z WebLLM lub Gemini Nano

const GeneratedComponent = () => {
    return (
        <div className="p-6 bg-gradient-to-br from-lime-900/20 to-green-900/20 rounded-xl border border-lime-500/30">
            <h2 className="text-xl font-bold text-lime-400 mb-4">
                Local AI Generated Component
            </h2>
            <p className="text-slate-300">
                To jest komponent wygenerowany lokalnie (tryb JusT).
                Prompt: "${prompt}"
            </p>
            <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <code className="text-xs text-lime-300">
                    // Pełna implementacja wymaga WebLLM lub Gemini Nano
                </code>
            </div>
        </div>
    );
};

export default GeneratedComponent;`;
};

/**
 * Sprawdza czy lokalne AI jest dostępne
 */
export const isOnDeviceAIAvailable = (): boolean => {
    // Sprawdzenie czy przeglądarka wspiera Web AI
    // @ts-ignore - window.ai jeszcze nie jest w typach
    if (typeof window !== 'undefined' && window.ai) {
        return true;
    }

    // Tutaj można dodać sprawdzenie dla innych bibliotek (WebLLM, itp.)
    return false;
};

/**
 * Zwraca nazwę dostępnego silnika lokalnego
 */
export const getLocalEngineInfo = (): string => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.ai) {
        return 'Gemini Nano (Chrome Built-in AI)';
    }

    return 'Local AI (Simulation Mode)';
};
