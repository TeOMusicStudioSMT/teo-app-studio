import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, Heart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TeOnautsApps() {
    const navigate = useNavigate();

    // Placeholder danych (tu kiedyś będą dane z Twojej bazy)
    const apps = [
        { name: "Cyber Bakery", author: "Hugo", likes: 124, color: "bg-purple-600" },
        { name: "Mars Weather", author: "Elon", likes: 89, color: "bg-orange-500" },
        { name: "TeO Music", author: "TeO", likes: 999, color: "bg-cyan-500" },
    ];

    return (
        <div className="min-h-screen bg-teo-void text-white p-8">
            <header className="flex items-center gap-4 mb-12">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold font-mono">TeOnauts APPS <span className="text-xs text-gray-500 ml-2">LIBRARY</span></h1>
            </header>

            {/* Wyszukiwarka */}
            <div className="mb-12 relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                <input
                    type="text" placeholder="Szukaj aplikacji w ekosystemie..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-teo-primary focus:outline-none"
                />
            </div>

            {/* Grid Aplikacji */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {apps.map((app, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-black/40 border border-white/10 rounded-3xl p-6 hover:bg-white/5 transition-all group cursor-pointer"
                    >
                        <div className={`h-32 ${app.color} rounded-2xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{app.name}</h3>
                                <p className="text-xs text-gray-400">by @{app.author}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"><Heart className="w-4 h-4" /> {app.likes}</button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}