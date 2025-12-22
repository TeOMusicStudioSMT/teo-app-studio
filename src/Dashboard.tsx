import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Users, Zap, LayoutGrid, Mic, Box, X, Rocket, Lock, Globe, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Karta w menu
const Card = ({ title, subtitle, icon: Icon, color, delay, onClick }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        onClick={onClick}
        className="relative group cursor-pointer"
    >
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-75 transition duration-500`} />
        <div className="relative h-full bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center hover:bg-white/5 transition-all duration-300">
            <div className={`p-4 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5`}>
                <Icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2 font-mono">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{subtitle}</p>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // DANE FORMULARZA PROJEKTU
    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        mode: 'default', // default, grvim, game, eco, custom
        customDefinition: '',
        isPublic: false
    });

    // Otwieranie modala z wstępnym wyborem trybu
    const openSetup = (preselectedMode: string) => {
        setProjectData(prev => ({ ...prev, mode: preselectedMode }));
        setIsModalOpen(true);
    };

    // START MISJI (Przekierowanie z danymi)
    const handleLaunch = () => {
        const params = new URLSearchParams({
            mode: projectData.mode,
            name: projectData.name || 'Untitled Project',
            desc: projectData.description,
            public: projectData.isPublic.toString(),
            custom: projectData.customDefinition
        });
        navigate(`/create?${params.toString()}`);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-teo-void font-sans">

            {/* Central Voice Node */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-16 relative z-10">
                <div className="relative group cursor-pointer" onClick={() => openSetup('default')}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse-glow" />
                    <button className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-105 transition-transform">
                        <Mic className="w-10 h-10 text-white" />
                    </button>
                </div>
            </motion.div>

            {/* Grid Kart - TERAZ OTWIERAJĄ MODAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
                <Card title="TeOcreate Self (GRVim)" subtitle="Forge Modules." icon={Bot} color="from-purple-600 to-blue-600" delay={0.1} onClick={() => openSetup('grvim')} />
                <Card title="Co-TeOnaut (Eco)" subtitle="Ecosystem Tools." icon={Users} color="from-pink-600 to-rose-600" delay={0.2} onClick={() => openSetup('eco')} />
                <Card title="TeOapps On-Go (Game)" subtitle="Game Weaver." icon={Zap} color="from-yellow-400 to-orange-500" delay={0.3} onClick={() => openSetup('game')} />
                <Card title="TeOnauts Apps" subtitle="Library & Custom." icon={LayoutGrid} color="from-cyan-400 to-emerald-400" delay={0.4} onClick={() => openSetup('custom')} />
            </div>

            {/* --- MODAL KONFIGURACJI PROJEKTU --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header Modala */}
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                                <h2 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
                                    <Rocket className="text-teo-primary" /> INICJALIZACJA PROJEKTU
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Formularz */}
                            <div className="p-8 space-y-6">

                                {/* 1. Nazwa i Opis */}
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

                                {/* 2. Wybór Rdzenia (Mode Selector) */}
                                <div className="space-y-3">
                                    <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Wybierz Rdzeń AI (Theme)</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {['default', 'grvim', 'game', 'eco', 'custom'].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setProjectData(p => ({ ...p, mode: m }))}
                                                className={`p-2 rounded-lg text-xs font-bold uppercase transition-all border ${projectData.mode === m ? 'bg-teo-primary text-white border-teo-primary' : 'bg-white/5 text-gray-500 border-white/10 hover:border-white/30'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 3. Custom Definition (Tylko jeśli wybrano 'custom') */}
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
                                                placeholder="Opisz, kim ma być AI. Np: 'Jesteś średniowiecznym skrybą. Używaj fontów szeryfowych i kolorów pergaminu.'"
                                                value={projectData.customDefinition}
                                                onChange={e => setProjectData({ ...projectData, customDefinition: e.target.value })}
                                                className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-100 focus:border-yellow-500 focus:outline-none h-24"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">Anuluj</button>
                                <button
                                    onClick={handleLaunch}
                                    disabled={!projectData.name}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-teo-primary to-blue-600 text-white font-bold shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Rocket className="w-5 h-5" /> ROZPOCZNIJ SYNTEZĘ
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 pointer-events-auto">
                    <Box className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-400 font-mono">Wybierz moduł, skonfiguruj i wystartuj.</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
            </motion.div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
}