import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiPlay, FiCode, FiSend, FiPower, FiDownload, FiHexagon, FiShare2, FiTerminal, FiCheck } from 'react-icons/fi';
import { useAtomValue } from 'jotai';
import { electricBorderAtom } from '../store/electricBorder';
import { generateOnDevice } from '../services/mediaPipeService';
import { generateContent } from '../services/geminiService';
import { mintGravitonNode } from '../services/appNodeService';
import { negotiateAccess } from '../lib/jwProtocol'; // Upewnij się, że masz ten plik!
import toast from 'react-hot-toast';

// Ulepszony blok kodu
const CodeBlock = ({ code }: { code: string }) => (
    <div className="bg-[#0d1117] p-4 rounded-xl overflow-x-auto font-mono text-sm border border-slate-800 h-full custom-scrollbar relative group">
        <pre className="h-full overflow-y-auto pb-10"> {/* Dodano overflow-y-auto tutaj */}
            <code className="language-typescript text-cyan-300 block">
                {code || "// Waiting for thought transmission..."}
            </code>
        </pre>
        {code && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-white/5">
                    {code.length} bytes
                </span>
            </div>
        )}
    </div>
);

export const AppStudioView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { globalMode } = useAtomValue(electricBorderAtom);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: `App Studio V2 Online. Engine: ${globalMode.toUpperCase()}. Ready to construct.` }
    ]);
    const [input, setInput] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
    const [assetHash, setAssetHash] = useState<string | null>(null);

    // Stany dla J&W Protocol
    const [jwLogs, setJwLogs] = useState<string[]>([]);
    const [isHandshakeActive, setIsHandshakeActive] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsGenerating(true);
        setAssetHash(null);

        try {
            // ULEPSZONY PROMPT: Wymusza pełny komponent
            const systemPrompt = `You are an OpenCode expert (Graviton Node Builder). 
            Task: Create a COMPLETE, SELF-CONTAINED React component (using Tailwind CSS) for: ${userMsg}.
            RULES:
            1. Use 'export default function App()'.
            2. Use 'lucide-react' for icons.
            3. Do not omit imports.
            4. Return ONLY the code block wrapped in \`\`\`tsx.`;

            let response = "";
            if (globalMode === 'just') {
                response = await generateOnDevice(systemPrompt);
            } else {
                response = await generateContent(systemPrompt, 'resonance');
            }

            const codeMatch = response.match(/```(?:typescript|tsx|js|jsx)?([\s\S]*?)```/);
            if (codeMatch && codeMatch[1]) {
                setGeneratedCode(codeMatch[1].trim());
            } else {
                // Fallback jeśli model zapomni o backticks
                setGeneratedCode(response);
            }

            setMessages(prev => [...prev, { role: 'ai', content: "Construction complete. ready for Tokenization." }]);
        } catch (error) {
            console.error('[AppStudio] ❌ Synteza padła:', error);
            const detail = error instanceof Error ? ` (${error.message})` : '';
            setMessages(prev => [...prev, { role: 'ai', content: `Synthesis Error. Connection disrupted.${detail}` }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const tokenizeAsset = async () => {
        if (!generatedCode) return;
        const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content || "Untitled App";

        setIsHandshakeActive(true);
        setJwLogs([]);

        try {
            const jadziaToken = await negotiateAccess((msg) => {
                setJwLogs(prev => [...prev, msg]);
            });

            if (jadziaToken) {
                const newNode = mintGravitonNode(lastUserMessage, generatedCode, 'CODE', 'STABLE', globalMode);
                setAssetHash(newNode.id);
                toast.success(`Asset Secured! Token: ${jadziaToken.substring(0, 8)}...`);
            }
        } catch (e) {
            toast.error("Protocol Error.");
        } finally {
            setIsHandshakeActive(false);
        }
    };

    // FUNKCJA KOPIOWANIA (SHARE)
    const handleShare = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        toast.success("Source Code copied to Clipboard!", { icon: '📋' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 md:p-6 lg:p-8"
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 lg:mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${globalMode === 'just' ? 'bg-lime-500/10 text-lime-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        <FiCpu className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black tracking-tighter text-white">APP STUDIO <span className="text-xs align-top opacity-50 text-cyan-400">V2 // GRAVITON NODE</span></h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${globalMode === 'just' ? 'bg-lime-500' : 'bg-cyan-500'} animate-pulse`} />
                            <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                {globalMode === 'just' ? 'Local Forge' : 'Cloud Synthesis'}
                            </p>
                        </div>
                    </div>
                </div>

                <button onClick={onClose} className="group flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full transition-all border border-transparent hover:border-red-500/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block group-hover:text-red-300">Exit System</span>
                    <FiPower className="w-5 h-5" />
                </button>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">

                {/* LEWA: ARCHITEKT */}
                <div className="w-full lg:w-1/3 flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
                    <div className="flex-grow p-4 overflow-y-auto custom-scrollbar space-y-4" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-500/20' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isGenerating && <div className="text-xs text-cyan-500 animate-pulse ml-2">Building logic structures...</div>}
                    </div>
                    <div className="p-4 bg-slate-950 border-t border-white/5 flex gap-2">
                        <input
                            type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Define node function..."
                            className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button onClick={handleSend} className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-xl"><FiSend /></button>
                    </div>
                </div>

                {/* PRAWA: BUDOWNICZY */}
                <div className="w-full lg:w-2/3 flex flex-col bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden relative shadow-xl">
                    {/* TOOLBAR */}
                    <div className="flex items-center gap-2 p-2 bg-slate-950 border-b border-white/5">
                        <button onClick={() => setActiveTab('code')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'code' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}><FiCode className="inline mr-2" /> SOURCE</button>
                        <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'preview' ? 'bg-slate-800 text-lime-400' : 'text-slate-500'}`}><FiPlay className="inline mr-2" /> RUN NODE</button>
                        <div className="flex-grow" />

                        {assetHash ? (
                            // AKTYWNY PRZYCISK SHARE
                            <div
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 border border-cyan-500/30 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-all group"
                                title="Click to Copy Hash"
                            >
                                <FiHexagon className="text-cyan-400 group-hover:animate-spin-slow" />
                                <span className="text-[10px] font-mono text-cyan-300 tracking-wider">{assetHash}</span>
                                <FiShare2 className="text-slate-400 group-hover:text-white ml-2" />
                            </div>
                        ) : (
                            <button
                                onClick={tokenizeAsset}
                                disabled={!generatedCode}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${generatedCode
                                    ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                    : 'bg-slate-800 border-transparent text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                <FiHexagon /> MINT ASSET
                            </button>
                        )}
                    </div>

                    <div className="flex-grow relative bg-[#0d1117] overflow-hidden">
                        {activeTab === 'code' ? <CodeBlock code={generatedCode} /> : (
                            <div className="h-full flex items-center justify-center text-slate-500 flex-col">
                                <FiCpu className="w-16 h-16 mb-4 opacity-20" />
                                <p>Node Simulation Environment</p>
                            </div>
                        )}
                    </div>

                    {/* --- KONSOLA JADZIA & WIESŁAW --- */}
                    <AnimatePresence>
                        {isHandshakeActive && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-4 left-4 right-4 bg-black/95 border border-green-500/30 p-4 rounded-xl font-mono text-xs shadow-2xl z-50 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-2 mb-2 text-green-500 border-b border-green-500/20 pb-2">
                                    <FiTerminal className="animate-pulse" />
                                    {/* TUTAJ BYŁ BŁĄD "<->" - TERAZ JEST BEZPIECZNIE */}
                                    <span className="uppercase tracking-widest font-bold">SECURE CHANNEL: HUB {'<->'} STUDIO</span>
                                </div>
                                <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                                    {jwLogs.map((log, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`
                                                ${log.includes('WIESŁAW') ? 'text-cyan-400' : ''}
                                                ${log.includes('JADZIA') ? 'text-pink-400' : ''}
                                                ${log.includes('SYSTEM') ? 'text-slate-500 italic' : ''}
                                            `}
                                        >
                                            {log}
                                        </motion.div>
                                    ))}
                                    <div className="animate-pulse text-green-500">_</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </motion.div>
    );
};