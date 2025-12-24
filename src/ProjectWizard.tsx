import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Lock, Globe, Edit3, Box, Coffee, Zap, Users, Bot } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ProjectWizardProps {
    isOpen: boolean;
    onClose: () => void;
    preselectedMode: string;
}

export default function ProjectWizard({ isOpen, onClose, preselectedMode }: ProjectWizardProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // <- ODBIERAMY KLUCZ Z URL

    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        mode: preselectedMode || 'default',
        customDefinition: '',
        isPublic: false
    });

    useEffect(() => {
        if (preselectedMode) setProjectData(p => ({ ...p, mode: preselectedMode }));
    }, [preselectedMode]);

    const handleLaunch = () => {
        // Pobieramy klucz z obecnego adresu (jeśli jest)
        const currentKey = searchParams.get('key');

        const params = new URLSearchParams({
            mode: projectData.mode,
            name: projectData.name || 'Untitled Project',
            desc: projectData.description,
            public: projectData.isPublic.toString(),
            custom: projectData.customDefinition
        });

        // JEŚLI MAMY KLUCZ, DOKLEJAMY GO DO NOWEGO ADRESU!
        if (currentKey) {
            params.append('key', currentKey);
        }

        navigate(`/create?${params.toString()}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 shrink-0">
                            <h2 className="text-xl md:text-2xl font-bold text-white font-mono flex items-center gap-3">
                                <Rocket className="text-teo-primary" /> INICJALIZACJA PROJEKTU
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Formularz - Scrollowalny */}
                        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Nazwa Projektu</label>
                                    <input
                                        type="text" placeholder="Np. Cyber Bakery"
                                        value={projectData.name}
                                        onChange={e => setProjectData({ ...projectData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-teo-primary focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Dostępność</label>
                                    <button
                                        onClick={() => setProjectData(p => ({ ...p, isPublic: !p.isPublic }))}
                                        className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${projectData.isPublic ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {projectData.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            {projectData.isPublic ? 'Public Co-Create' : 'Private Mode'}
                                        </span>
                                        <div className={`w-3 h-3 rounded-full ${projectData.isPublic ? 'bg-green-500 shadow-[0_0_8px_#00ff00]' : 'bg-gray-600'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Opis Misji (Context)</label>
                                <textarea
                                    placeholder="Krótki opis, co chcesz zbudować. To będzie główna dyrektywa dla AI."
                                    value={projectData.description}
                                    onChange={e => setProjectData({ ...projectData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-teo-primary focus:outline-none h-20 resize-none"
                                />
                            </div>

                            {/* Wybierz Rdzeń AI */}
                            <div className="space-y-3">
                                <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Wybierz Rdzeń AI (Theme)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['default', 'grvim', 'game', 'eco', 'business', 'custom'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setProjectData(p => ({ ...p, mode: m }))}
                                            className={`p-3 rounded-xl text-xs font-bold uppercase transition-all border flex flex-col items-center gap-2 ${projectData.mode === m ? 'bg-white/10 text-white border-white/50 shadow-lg' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/30'}`}
                                        >
                                            {m === 'business' && <Coffee className="w-5 h-5 text-amber-400" />}
                                            {m === 'game' && <Zap className="w-5 h-5 text-yellow-400" />}
                                            {m === 'eco' && <Users className="w-5 h-5 text-cyan-400" />}
                                            {m === 'grvim' && <Bot className="w-5 h-5 text-purple-400" />}
                                            {m === 'default' && <Box className="w-5 h-5 text-gray-400" />}
                                            {m === 'custom' && <Edit3 className="w-5 h-5 text-white" />}

                                            <span>{m === 'business' ? 'BIZ / CAFE' : m}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Definition */}
                            <AnimatePresence>
                                {projectData.mode === 'custom' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-2"
                                    >
                                        <label className="text-xs text-yellow-400 font-mono uppercase tracking-widest flex items-center gap-2">
                                            <Edit3 className="w-3 h-3" /> Zdefiniuj Własny Model
                                        </label>
                                        <textarea
                                            placeholder="Opisz, kim ma być AI..."
                                            value={projectData.customDefinition}
                                            onChange={e => setProjectData({ ...projectData, customDefinition: e.target.value })}
                                            className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-100 focus:border-yellow-500 focus:outline-none h-24"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-4 shrink-0">
                            <button onClick={onClose} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">Anuluj</button>
                            <button
                                onClick={handleLaunch}
                                disabled={!projectData.name}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-teo-primary to-blue-600 text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Rocket className="w-5 h-5" /> START
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}