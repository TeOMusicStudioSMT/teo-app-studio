import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHexagon, FiCode, FiX, FiDatabase, FiPlay, FiShare2, FiActivity, FiDollarSign, FiMusic, FiEye, FiEyeOff, FiSend } from 'react-icons/fi';
import type { GravitonNode } from '../services/appNodeService';
import toast from 'react-hot-toast';

interface Props {
    node: GravitonNode;
    onClose: () => void;
}

type LifePhase = 'FRUIT' | 'PULP' | 'SEED';

export const AssetLifecycleView: React.FC<Props> = ({ node, onClose }) => {
    const [phase, setPhase] = useState<LifePhase>('FRUIT');
    const [showPrompt, setShowPrompt] = useState(false); // Stan prywatności promptu

    // Symulacja wysyłania do HUBa
    const handleSendToHub = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Nawiązywanie połączenia z TeO HuB...',
                success: 'Asset przetransferowany do Portfela Głównego!',
                error: 'Błąd połączenia z HuBem.',
            },
            {
                style: { background: '#0f172a', color: '#22d3ee', border: '1px solid #22d3ee' }
            }
        );
    };

    const renderAudioDNA = (content: string) => {
        try {
            const data = JSON.parse(content);
            return (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-black rounded-xl border border-teal-500/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                    <div className="z-10 flex flex-col gap-6 w-full max-w-sm">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <span className="text-teal-400 font-mono text-xs tracking-widest flex items-center gap-2">
                                <FiMusic /> SONIC SIGNATURE
                            </span>
                            <span className="text-white font-bold">{data.engine || 'UNKNOWN'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Waveform</div>
                                <div className="text-xl font-black text-teal-300 mt-1">{data.osc?.toUpperCase() || 'SINE'}</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Frequency</div>
                                <div className="text-xl font-black text-purple-300 mt-1">{Math.round(data.freq) || 0} Hz</div>
                            </div>
                        </div>
                        <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-lg flex items-center gap-4">
                            <FiActivity className="text-teal-400 w-6 h-6 animate-pulse" />
                            <div className="text-xs text-teal-200">
                                This node contains executable audio DNA.
                            </div>
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            return <div className="p-4 text-red-400 font-mono text-xs">Corrupted Sonic Data</div>;
        }
    };

    const renderContent = () => {
        if (node.type === 'VIDEO') {
            return (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <video src={node.content} autoPlay loop muted controls className="max-w-full max-h-full rounded-xl" />
                </div>
            );
        }
        if (node.type === 'IMAGE') {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <img src={node.content} alt={node.name} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                </div>
            );
        }
        if (node.type === 'AUDIO') {
            return renderAudioDNA(node.content);
        }
        return (
            <div className="w-full h-full bg-[#0d1117]/90 p-6 overflow-hidden relative font-mono text-xs md:text-sm text-lime-400/80">
                <pre className="whitespace-pre-wrap">{node.content.substring(0, 2000)}...</pre>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white z-50 transition-colors border border-white/10">
                <FiX className="w-6 h-6" />
            </button>

            <div className="w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center relative perspective-1000">

                {/* NAVIGACJA */}
                <div className="absolute top-0 flex gap-4 mb-8 z-40">
                    <button onClick={() => setPhase('FRUIT')} className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all border ${phase === 'FRUIT' ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_cyan]' : 'bg-black/50 text-slate-500 border-white/10'}`}>1. OWOC (ASSET)</button>
                    <button onClick={() => setPhase('PULP')} className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all border ${phase === 'PULP' ? 'bg-lime-500 text-black border-lime-400 shadow-[0_0_20px_lime]' : 'bg-black/50 text-slate-500 border-white/10'}`}>2. MIĄŻSZ (TREŚĆ)</button>
                    <button onClick={() => setPhase('SEED')} className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all border ${phase === 'SEED' ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_20px_purple]' : 'bg-black/50 text-slate-500 border-white/10'}`}>3. NASIONO (MYŚL)</button>
                </div>

                <AnimatePresence mode='wait'>

                    {/* FAZA 1: OWOC */}
                    {phase === 'FRUIT' && (
                        <motion.div
                            key="fruit"
                            initial={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
                            transition={{ duration: 0.5 }}
                            className="relative cursor-default"
                        >
                            <div className="w-[350px] md:w-[500px] bg-[#0d1117] border border-cyan-500/30 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                    <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 border border-cyan-500/20"><FiHexagon className="w-10 h-10" /></div>
                                    <div className="overflow-hidden">
                                        <h2 className="text-2xl font-black text-white tracking-tight truncate">{node.name}</h2>
                                        <p className="text-cyan-500 font-mono text-[10px] uppercase tracking-widest mt-1">ID: {node.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-bold tracking-wider"><FiActivity /> ENTROPY</div>
                                        <div className="text-2xl font-mono text-white">{node.entropy}%</div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1 font-bold tracking-wider"><FiDollarSign /> EST. VALUE</div>
                                        <div className="text-2xl font-mono text-emerald-400">{(Math.random() * 100).toFixed(2)} GRV</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={handleSendToHub}
                                        className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                                    >
                                        <FiShare2 /> SEND TO HUB
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FAZA 2: MIĄŻSZ */}
                    {phase === 'PULP' && (
                        <motion.div
                            key="pulp"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-4xl h-[60vh] relative"
                        >
                            <div className="w-full h-full bg-[#0d1117] border border-lime-500/30 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                                <div className="p-2 bg-lime-900/20 border-b border-lime-500/20 flex justify-between items-center px-4">
                                    <span className="text-[10px] text-lime-400 font-mono">RAW_DATA_VIEWER_V1.0</span>
                                </div>
                                <div className="flex-grow overflow-auto custom-scrollbar">
                                    {renderContent()}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FAZA 3: NASIONO (Z PRYWATNOŚCIĄ) */}
                    {phase === 'SEED' && (
                        <motion.div
                            key="seed"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative flex flex-col items-center"
                        >
                            <div className="w-[400px] h-[400px] bg-black border border-purple-500/50 rounded-full flex flex-col items-center justify-center p-12 text-center shadow-[0_0_50px_rgba(168,85,247,0.2)] relative z-10 hover:border-purple-400 transition-colors">
                                <FiDatabase className="w-12 h-12 text-purple-400 mb-6" />
                                <h3 className="text-purple-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">ORIGIN PROMPT</h3>

                                <div className="relative w-full">
                                    {/* Treść Promptu */}
                                    <p className={`text-white text-lg font-serif italic leading-relaxed transition-all duration-500 ${showPrompt ? 'blur-0 opacity-100' : 'blur-md opacity-50 select-none'}`}>
                                        "{node.name}..." <br />
                                        <span className="text-sm not-italic font-sans text-slate-400 mt-2 block">(Szczegółowe dane kreacji...)</span>
                                    </p>

                                    {/* Przycisk Odkrywania */}
                                    <button
                                        onClick={() => setShowPrompt(!showPrompt)}
                                        className="absolute inset-0 flex items-center justify-center z-20 group"
                                    >
                                        {!showPrompt && (
                                            <div className="bg-black/80 backdrop-blur-sm p-3 rounded-full border border-purple-500/50 text-purple-400 group-hover:scale-110 transition-transform cursor-pointer">
                                                <FiEyeOff className="w-6 h-6" />
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Toggle Button na dole dla wygody */}
                                <button
                                    onClick={() => setShowPrompt(!showPrompt)}
                                    className="mt-8 text-[10px] text-slate-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
                                >
                                    {showPrompt ? <><FiEyeOff /> UKRYJ DANE</> : <><FiEye /> POKAŻ ŹRÓDŁO</>}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </motion.div>
    );
};