import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Users, Zap, LayoutGrid, Mic, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectWizard from './ProjectWizard'; // Importujemy nasz nowy moduł

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
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState('default');

    // Funkcja tylko dla TeOcreate (otwiera kreator)
    const openCreator = (mode: string) => {
        setSelectedMode(mode);
        setIsWizardOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden bg-teo-void font-sans">

            {/* Central Voice Node */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-16 relative z-10">
                <div className="relative group cursor-pointer" onClick={() => openCreator('default')}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse-glow" />
                    <button className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-105 transition-transform">
                        <Mic className="w-10 h-10 text-white" />
                    </button>
                </div>
            </motion.div>

            {/* Grid Kart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">

                {/* 1. KREATOR (Włącza Modal) */}
                <Card
                    title="TeOcreate Self"
                    subtitle="Solo construct mode. Create your vision."
                    icon={Bot}
                    color="from-purple-600 to-blue-600"
                    delay={0.1}
                    onClick={() => openCreator('default')}
                />

                {/* 2. INNE MODUŁY (Na razie placeholder lub bezpośrednie linki) */}
                <Card
                    title="Co-TeOnaut (Eco)"
                    subtitle="Ecosystem Dashboard tools."
                    icon={Users}
                    color="from-pink-600 to-rose-600"
                    delay={0.2}
                    onClick={() => openCreator('eco')} // Też używa kreatora ale w trybie ECO
                />

                <Card
                    title="TeOapps On-Go"
                    subtitle="Instant Games & Utilities."
                    icon={Zap}
                    color="from-yellow-400 to-orange-500"
                    delay={0.3}
                    onClick={() => openCreator('game')} // Też używa kreatora w trybie GAME
                />

                {/* 4. SPOŁECZNOŚĆ (Bezpośrednie przejście do Galerii) */}
                <Card
                    title="TeOnauts Apps"
                    subtitle="The Great Library. Explore community constructs."
                    icon={LayoutGrid}
                    color="from-cyan-400 to-emerald-400"
                    delay={0.4}
                    onClick={() => navigate('/community')} // <--- NOWY LINK
                />
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

            {/* MODAL ZEWNĘTRZNY */}
            <ProjectWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                preselectedMode={selectedMode}
            />

        </div>
    );
}