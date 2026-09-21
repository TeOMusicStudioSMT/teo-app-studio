import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, LayoutGrid, Settings, UploadCloud, Music, Smartphone, Users, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Importy modułów
import { AppStudioView } from './AppStudioView';
import { GravitonGalleryView } from './GravitonGalleryView';
import { SettingsModal } from './SettingsModal';
import { QuantumForgeView } from './QuantumForgeView';
import { MusicSynthesizer } from './MusicSynthesizer'; // <--- (1) IMPORTUJEMY DZIEŁO AGENTA
import { SystemMessage } from './SystemMessage';
import matrixVideo from '../assets/matrix_bg.mp4';

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
            <div className={`p-4 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/10`}>
                <Icon className="w-8 h-8 text-white/80" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{subtitle}</p>
        </div>
    </motion.div>
);

export default function Dashboard() {
    const navigate = useNavigate();

    // --- (2) STANY ---
    const [isAppStudioOpen, setIsAppStudioOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isForgeOpen, setIsForgeOpen] = useState(false);
    const [forgeInitialFile, setForgeInitialFile] = useState<File | null>(null); // MATERIA DLA KUŹNI
    const [isSynthOpen, setIsSynthOpen] = useState(false); // <--- NOWY STAN DLA SYNTEZATORA

    return (
        <div className="min-h-screen text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden relative">

            {/* Tło Wideo */}
            <div className="fixed inset-0 -z-50 overflow-hidden">
                <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover opacity-60">
                    <source src={matrixVideo} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/60 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80" />
            </div>

            {/* Header */}
            <div className="pt-20 pb-10 text-center relative z-10 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                    TeO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">OS</span>
                </motion.h1>

                <div className="mt-4 mb-8">
                    <SystemMessage />
                </div>
            </div>

            {/* Grid Kart */}
            {/* Zmieniono grid na 5 kolumn dla dużych ekranów, żeby pomieścić nową kartę */}
            <div className="max-w-7xl mx-auto px-4 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 relative z-10">

                {/* 🛠️ App Studio 2.0 — Kodeks (TeOgochi od kodu) buduje apki na moście,
                    z piaskownicą, buildem i testem w przeglądarce. Stare „App Studio" (Gemini
                    w przeglądarce) zostaje obok, dopóki Suweren nie zdecyduje o jego losie. */}
                <Card
                    title="Kodeks buduje"
                    subtitle="TeOgochi pisze, testuje, poprawia."
                    icon={Bot}
                    color="from-emerald-400 to-cyan-600"
                    delay={0.05}
                    onClick={() => navigate('/kodeks')}
                />

                <Card
                    title="App Studio"
                    subtitle="Create. Code. Tokenize."
                    icon={Cpu}
                    color="from-cyan-400 to-blue-600"
                    delay={0.1}
                    onClick={() => setIsAppStudioOpen(true)}
                />

                <Card
                    title="Quantum Forge"
                    subtitle="Tokenize Any Matter."
                    icon={UploadCloud}
                    color="from-purple-500 to-indigo-600"
                    delay={0.15}
                    onClick={() => setIsForgeOpen(true)}
                />

                {/* --- (3) NOWA KARTA: SONIC LAB --- */}
                <Card
                    title="Sonic Lab"
                    subtitle="Experimental Audio Synthesis."
                    icon={Music}
                    color="from-rose-500 to-orange-500"
                    delay={0.2}
                    onClick={() => setIsSynthOpen(true)}
                />

                <Card
                    title="Graviton Gallery"
                    subtitle="Registry of your Assets."
                    icon={LayoutGrid}
                    color="from-pink-500 to-rose-600"
                    delay={0.25}
                    onClick={() => setIsGalleryOpen(true)}
                />

                <Card
                    title="Field Control"
                    subtitle="System Settings."
                    icon={Settings}
                    color="from-slate-500 to-slate-700"
                    delay={0.3}
                    onClick={() => setIsSettingsOpen(true)}
                />

                {/* Trasy istniały, ale nie miały żadnego wejścia z Dashboardu */}
                <Card
                    title="Workspace"
                    subtitle="Visual App Builder."
                    icon={Smartphone}
                    color="from-emerald-500 to-teal-600"
                    delay={0.35}
                    onClick={() => navigate('/create')}
                />

                <Card
                    title="TeOnauts"
                    subtitle="Community Apps."
                    icon={Users}
                    color="from-amber-500 to-orange-600"
                    delay={0.4}
                    onClick={() => navigate('/community')}
                />
            </div>

            {/* --- (4) MODALE --- */}
            <AnimatePresence>
                {isAppStudioOpen && <AppStudioView onClose={() => setIsAppStudioOpen(false)} />}
                {isGalleryOpen && <GravitonGalleryView onClose={() => setIsGalleryOpen(false)} />}
                {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
                {isForgeOpen && (
                    <QuantumForgeView 
                        onClose={() => { 
                            setIsForgeOpen(false); 
                            setForgeInitialFile(null); 
                        }} 
                        initialFile={forgeInitialFile} 
                    />
                )}

                {/* MODAL SYNTEZATORA */}
                {isSynthOpen && (
                    <MusicSynthesizer 
                        onClose={() => setIsSynthOpen(false)} 
                        onSnapshot={(file: File) => {
                            setForgeInitialFile(file);
                            setIsForgeOpen(true);
                            setIsSynthOpen(false); // Zamykamy Lab przy otwarciu Kuźni
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}