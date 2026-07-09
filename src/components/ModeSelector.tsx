import React from 'react';
import { useAtom } from 'jotai';
import { electricBorderAtom, setGlobalModeAtom, type ElectricBorderMode, } from '../store/electricBorder';
import { FiCpu, FiCloud, FiZap } from 'react-icons/fi';

export const ModeSelector: React.FC = () => {
    const [state] = useAtom(electricBorderAtom);
    const [, setMode] = useAtom(setGlobalModeAtom);

    const modes: { id: ElectricBorderMode; label: string; icon: any }[] = [
        { id: 'just', label: 'LOCAL FORGE', icon: FiCpu },
        { id: 'resonance', label: 'CLOUD SYNTH', icon: FiCloud },
        { id: 'active', label: 'ACTIVE FLOW', icon: FiZap },
    ];

    return (
        <div className="w-full">
            <h3 className="text-cyan-400 text-[10px] font-bold mb-4 uppercase tracking-[0.3em]">
                Consciousness Engine Source
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
                {modes.map((m) => {
                    const isActive = state.globalMode === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 border ${isActive
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                        >
                            <m.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black tracking-widest">{m.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Opis trybu */}
            <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/5 text-xs text-slate-400 font-mono">
                STATUS: <span className="text-white">
                    {state.globalMode === 'just' && "Running on internal NPU. Offline safe."}
                    {state.globalMode === 'resonance' && "Connected to Global Field API. High Intelligence."}
                    {state.globalMode === 'active' && "Experimental Agent Swarm. Use with caution."}
                </span>
            </div>
        </div>
    );
};