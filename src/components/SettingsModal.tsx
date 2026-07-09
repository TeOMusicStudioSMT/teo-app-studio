import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiShield, FiActivity, FiZap, FiSettings } from 'react-icons/fi';
import { ModeSelector } from './ModeSelector'; // Teraz ten plik już istnieje!

export const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-2xl overflow-hidden"
            >
                {/* Dekoracyjne tło */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                            <FiSettings className="text-slate-400 animate-spin-slow" />
                            FIELD CONTROL
                        </h2>
                        <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">System Core Configuration</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors group">
                        <FiX className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-8 relative z-10">

                    {/* 1. SELEKTOR TRYBU (Z pliku powyżej) */}
                    <ModeSelector />

                    {/* 2. STATYSTYKI ENERGII (Mockup) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-colors group">
                            <div className="flex items-center gap-3 mb-4 text-cyan-400">
                                <div className="p-2 bg-cyan-500/10 rounded-lg">
                                    <FiShield className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest">SECURITY LAYER</span>
                            </div>
                            <p className="text-slate-500 text-xs mb-1">Integrity Status</p>
                            <p className="text-xl font-mono text-white group-hover:text-cyan-300 transition-colors">100% STABLE</p>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 hover:border-lime-500/20 transition-colors group">
                            <div className="flex items-center gap-3 mb-4 text-lime-400">
                                <div className="p-2 bg-lime-500/10 rounded-lg">
                                    <FiActivity className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold tracking-widest">ENERGY FLOW</span>
                            </div>
                            <p className="text-slate-500 text-xs mb-1">Current Load</p>
                            <p className="text-xl font-mono text-white group-hover:text-lime-300 transition-colors">LOW / OPTIMAL</p>
                        </div>
                    </div>
                </div>

            </motion.div>
        </motion.div>
    );
};