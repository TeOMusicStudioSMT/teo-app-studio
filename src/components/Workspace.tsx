import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Loader2, Image as ImageIcon, FormInput, LayoutGrid, Type, Box, Gamepad2, Globe, Lock, Save, Share2, Camera, Paperclip, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateUI } from '../services/aiService';
import { downloadCode } from '../services/exportService';

// Style
const THEMES: any = {
    default: { color: 'text-teo-primary', border: 'border-teo-primary', bg: 'bg-teo-primary', glow: 'shadow-purple-500/50' },
    grvim: { color: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-500', glow: 'shadow-orange-500/50' },
    game: { color: 'text-green-400', border: 'border-green-400', bg: 'bg-green-400', glow: 'shadow-green-500/50' },
    eco: { color: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400', glow: 'shadow-cyan-500/50' },
    custom: { color: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400', glow: 'shadow-yellow-500/50' },
    business: { color: 'text-amber-200', border: 'border-amber-500', bg: 'bg-amber-600', glow: 'shadow-amber-500/50' },
};

// Komponent Renderujący
const RenderElement = ({ el, themeMode }: { el: any, themeMode: string }) => {
    const commonClasses = "mb-4 w-full transition-all duration-300";
    const t = THEMES[themeMode] || THEMES.default;

    if (el.type === 'button') return (
        <motion.button
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            className={`${commonClasses} py-4 rounded-xl font-bold shadow-lg text-sm tracking-wide bg-white text-black border-2 border-transparent hover:${t.border} hover:text-${t.color.split('-')[1]}-600`}
            style={{ borderRadius: themeMode === 'game' ? '4px' : '12px' }}
        >
            {el.text}
        </motion.button>
    );
    if (el.type === 'header') return (
        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`${commonClasses} text-3xl font-bold text-white mt-2 font-display`}>
            {el.text}
        </motion.h2>
    );
    if (el.type === 'text') return (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${commonClasses} text-gray-400 text-sm leading-relaxed`}>
            {el.content}
        </motion.p>
    );
    if (el.type === 'input') return (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={commonClasses}>
            <input placeholder={el.placeholder} className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-${t.bg.split('-')[1]}-500 focus:outline-none transition-all`} />
        </motion.div>
    );
    if (el.type === 'card') return (
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className={`${commonClasses} bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2 hover:bg-white/10 transition-colors`}>
            {el.title && <h3 className={`font-bold ${t.color}`}>{el.title}</h3>}
            {el.subtitle && <p className="text-xs text-gray-400">{el.subtitle}</p>}
            {!el.title && <div className="h-4 w-32 bg-white/20 rounded mb-2 animate-pulse" />}
        </motion.div>
    );
    return null;
};

export default function Workspace() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mode = searchParams.get('mode') || 'default';
    const projectName = searchParams.get('name') || 'TeO Project';
    const projectDesc = searchParams.get('desc') || '';
    const customInstruction = searchParams.get('custom') || '';
    const isPublic = searchParams.get('public') === 'true';

    const [apiKey, setApiKey] = useState('');
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const currentTheme = THEMES[mode] || THEMES.default;

    const [uiState, setUiState] = useState<any>({
        screenColor: '#030014', elements: [], message: 'System gotowy.'
    });

    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const keyFromUrl = searchParams.get('key');
        if (keyFromUrl) setApiKey(keyFromUrl);

        if (logs.length === 0) {
            if (projectDesc) {
                setLogs([`SYSTEM: Inicjalizacja projektu "${projectName}"...`, `> ${projectDesc}`]);
                setTimeout(() => {
                    if (apiKey || keyFromUrl) processPrompt(projectDesc, 'USER');
                    else setLogs(prev => [...prev, "SYSTEM: Oczekiwanie na klucz API."]);
                }, 1000);
            } else {
                let welcomeMsg = `Witaj w "${projectName}".`;
                if (mode === 'business') welcomeMsg += " Tryb Biznesowy: Prześlij zdjęcie lokalu, aby zacząć!";
                setLogs([`SYSTEM: ${welcomeMsg}`]);
            }
        }
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setLogs(prev => [...prev, "SYSTEM: Załadowano obraz do analizy."]);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();

    const processPrompt = async (prompt: string, source: 'USER' | 'GRVim') => {
        if (!apiKey && !prompt.startsWith('AIza')) {
            setLogs(prev => [...prev, 'SYSTEM: Brak klucza API.']);
            return;
        }
        if (prompt.startsWith('AIza')) {
            setApiKey(prompt);
            setLogs(prev => [...prev, 'SYSTEM: Klucz zapisany.']);
            setInputText('');
            return;
        }

        setLogs(prev => [...prev, `${source === 'USER' ? '>' : '⚡'} ${prompt} ${selectedImage ? '[ZDJĘCIE]' : ''}`]);
        setIsProcessing(true);

        const currentElementsJSON = JSON.stringify(uiState.elements);

        if (source === 'GRVim') {
            const appendPrompt = `
                ZADANIE: Stwórz obiekt JSON dla JEDNEGO nowego elementu: "${prompt}".
                KONTEKST STYLU: "${mode}".
                WAŻNE: Zwróć JSON z tablicą 'elements' zawierającą TYLKO ten nowy element.
            `;
            const result = await generateUI(apiKey, appendPrompt, mode, customInstruction);
            if (result && result.elements) {
                setUiState((prev: any) => ({ ...prev, elements: [...prev.elements, ...result.elements] }));
                setLogs(prev => [...prev, `AI: Dodano element.`]);
            }
        } else {
            const contextPrompt = `
                OBECNY KOD UI (JSON): ${currentElementsJSON}
                ZADANIE UŻYTKOWNIKA: "${prompt}"
                PROJEKT: "${projectName}" - ${projectDesc}
                
                ${selectedImage ? 'UŻYTKOWNIK PRZESŁAŁ ZDJĘCIE. Przeanalizuj je. Jeśli to menu - przepisz pozycje. Jeśli to wnętrze - dopasuj kolory.' : ''}
                
                INSTRUKCJA:
                1. Jesteś w trybie PEŁNEJ EDYCJI.
                2. Zwróć PEŁNĄ strukturę JSON.
            `;

            const result = await generateUI(apiKey, contextPrompt, mode, customInstruction, selectedImage);

            if (result && result.elements) {
                setUiState(result);
                setLogs(prev => [...prev, `AI: ${result.message || 'Analiza zakończona.'}`]);
                setSelectedImage(null);
            }
        }

        setIsProcessing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            processPrompt(inputText, 'USER');
            setInputText('');
        }
    };

    const handleDragStart = (e: React.DragEvent, type: string) => { e.dataTransfer.setData('grvimType', type); setIsDragging(true); };
    const handleDragOver = (e: React.DragEvent) => e.preventDefault();
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false);
        const grvimType = e.dataTransfer.getData('grvimType');
        let prompt = "";
        if (grvimType === 'input') prompt = "Jeden stylowy Input z etykietą pasujący do tematu.";
        if (grvimType === 'header') prompt = "Jeden duży, ozdobny Nagłówek sekcji.";
        if (grvimType === 'card') prompt = "Jedna Karta ze zdjęciem (placeholder), tytułem i opisem.";
        if (prompt) processPrompt(prompt, 'GRVim');
    };

    return (
        <div className="min-h-screen w-screen bg-teo-void flex flex-col overflow-hidden text-white relative font-sans">

            {/* HEADER */}
            <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-20 shrink-0">
                <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white shrink-0">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className={`text-sm lg:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-mono tracking-wider truncate`}>
                            {projectName.toUpperCase()}
                        </h1>
                        <div className="flex gap-2 items-center">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${currentTheme.border} ${currentTheme.color} bg-white/5 uppercase`}>
                                {mode}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    <button onClick={() => downloadCode(projectName, uiState)} className="p-2 bg-white/5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded-lg border border-white/10 hover:border-green-500/50 transition-all flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        <span className="text-xs font-mono hidden md:inline">CODE</span>
                    </button>
                    <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500 shadow-[0_0_10px_#00ff00]' : 'bg-red-500'}`} />
                </div>
            </header>

            {/* GŁÓWNY UKŁAD: FLEX-COL NA MOBILE, FLEX-ROW NA DESKTOPIE */}
            <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">

                {/* 1. LEWY PANEL (CHAT) - NA MOBILE GÓRA/ŚRODEK */}
                <div className="w-full lg:w-[450px] h-[40vh] lg:h-full border-b lg:border-b-0 lg:border-r border-white/10 bg-black/60 flex flex-col relative z-10 backdrop-blur-sm order-2 lg:order-1">
                    <div className="flex-1 p-4 lg:p-6 font-mono text-sm text-gray-300 overflow-y-auto scrollbar-thin">
                        {logs.map((log, index) => (
                            <div key={index} className={`flex gap-3 mb-3 ${log.startsWith('>') ? 'justify-end' : ''}`}>
                                <div className={`p-3 rounded-2xl text-xs max-w-[90%] ${log.startsWith('>') ? `${currentTheme.bg}/20 text-white border ${currentTheme.border}/50` : log.startsWith('⚡') ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'}`}>
                                    {log}
                                </div>
                            </div>
                        ))}
                        {isProcessing && <div className={`${currentTheme.color} text-xs animate-pulse flex items-center gap-2`}><Loader2 className="w-3 h-3 animate-spin" /> Przetwarzanie...</div>}
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-3 lg:p-6 bg-black/40 border-t border-white/10 shrink-0 z-20">
                        {/* PODGLĄD ZDJĘCIA */}
                        <AnimatePresence>
                            {selectedImage && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-12 left-4 flex items-center gap-2 bg-black/80 p-1 rounded-lg border border-white/20">
                                    <img src={selectedImage} alt="Preview" className="w-8 h-8 object-cover rounded-md" />
                                    <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-400"><X className="w-3 h-3" /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={`bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl flex items-center gap-2 focus-within:border-${currentTheme.bg.split('-')[1]}-500 transition-colors`}>
                            <button onClick={triggerFileInput} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-colors">
                                <Camera className="w-5 h-5" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={selectedImage ? "Opisz zdjęcie..." : "Opisz wizję..."}
                                className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none text-base font-mono px-2 py-1"
                            />
                            <button onClick={() => processPrompt(inputText, 'USER')} className={`p-3 rounded-xl ${currentTheme.bg} text-white transition-all`}>
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. PRAWY PANEL (TELEFON) - NA MOBILE GÓRA */}
                <div className="flex-1 h-[60vh] lg:h-full bg-[#050505] relative flex items-center justify-center bg-grid-pattern overflow-hidden order-1 lg:order-2 p-4 lg:p-0">
                    <motion.div layout style={{ backgroundColor: uiState.screenColor }} className={`w-[320px] lg:w-[375px] h-full lg:h-[812px] max-h-[90%] border rounded-[2rem] lg:rounded-[3rem] shadow-2xl overflow-hidden relative transition-all duration-300 flex flex-col ${isDragging ? `${currentTheme.border} ${currentTheme.glow} scale-105` : 'border-white/20'}`} onDragOver={handleDragOver} onDrop={handleDrop}>

                        {/* Wskaźnik Upuszczania */}
                        {isDragging && (
                            <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed ${currentTheme.border} rounded-[3rem]`}>
                                <LayoutGrid className={`w-12 h-12 ${currentTheme.color} mb-2 animate-bounce`} />
                                <p className={`${currentTheme.color} font-mono font-bold text-lg tracking-widest`}>UPUŚĆ TUTAJ</p>
                            </div>
                        )}

                        <div className="h-full p-4 lg:p-6 flex flex-col overflow-y-auto scrollbar-hide">
                            <div className="h-6 w-full flex justify-between items-center mb-6 opacity-50 shrink-0">
                                <span className="text-xs text-white mix-blend-difference">9:41</span>
                                <div className="w-16 h-4 bg-white/20 rounded-full mix-blend-difference" />
                            </div>
                            <div className="flex-1 pb-10">
                                <AnimatePresence mode='popLayout'>
                                    {uiState.elements && uiState.elements.length > 0 ? (
                                        uiState.elements.map((el: any, i: number) => <RenderElement key={i} el={el} themeMode={mode} />)
                                    ) : (
                                        <div className="text-center opacity-30 mt-32">
                                            <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
                                            <p className="text-xs font-mono">OCZEKIWANIE NA MATERIĘ...</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DOCK - TYLKO NA DESKTOP LUB ZWINIĘTY NA MOBILE (Ukryłem na mobile dla czytelności, można odkomentować 'hidden' w 'hidden md:flex') */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex gap-4 z-40 bg-black/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                <div draggable onDragStart={(e) => handleDragStart(e, 'header')} className="group cursor-grab hover:-translate-y-2 transition-transform p-2 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center mb-1 group-hover:${currentTheme.border}`}>
                        <Type className={`w-5 h-5 ${currentTheme.color}`} />
                    </div>
                    <span className="text-[8px] text-gray-400 font-mono">TYTUŁ</span>
                </div>
                <div draggable onDragStart={(e) => handleDragStart(e, 'card')} className="group cursor-grab hover:-translate-y-2 transition-transform p-2 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center mb-1 group-hover:${currentTheme.border}`}>
                        <ImageIcon className={`w-5 h-5 ${currentTheme.color}`} />
                    </div>
                    <span className="text-[8px] text-gray-400 font-mono">KARTA</span>
                </div>
                <div draggable onDragStart={(e) => handleDragStart(e, 'input')} className="group cursor-grab hover:-translate-y-2 transition-transform p-2 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center mb-1 group-hover:${currentTheme.border}`}>
                        <FormInput className={`w-5 h-5 ${currentTheme.color}`} />
                    </div>
                    <span className="text-[8px] text-gray-400 font-mono">INPUT</span>
                </div>
            </div>
        </div>
    );
}