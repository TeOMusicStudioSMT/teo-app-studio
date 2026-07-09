import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, Power, Waves, X, Loader2 } from 'lucide-react';

interface QuantumRadioProps {
    onClose?: () => void;
}

export const QuantumRadio: React.FC<QuantumRadioProps> = ({ onClose }) => {
    const [isOn, setIsOn] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [frequency, setFrequency] = useState(0.5); // Modulates the 'color' of the noise
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const filterNodeRef = useRef<BiquadFilterNode | null>(null);

    // Initialize Audio Context
    useEffect(() => {
        return () => {
            stopAudio();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Handle Volume Change
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.1);
        }
    }, [volume]);

    // Handle Frequency (Filter) Change
    useEffect(() => {
        if (filterNodeRef.current && audioContextRef.current) {
            // Map 0-1 to 100Hz-5000Hz
            const freqValue = 100 + (frequency * 4900);
            filterNodeRef.current.frequency.setTargetAtTime(freqValue, audioContextRef.current.currentTime, 0.1);
        }
    }, [frequency]);

    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioCtx();
        }

        const ctx = audioContextRef.current!;

        // Ensure context is running (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        // Create Nodes
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate Pink Noise approximation
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain loss
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100 + (frequency * 4900);

        const gain = ctx.createGain();
        gain.gain.value = volume;

        // Connect
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start();

        // Store refs
        sourceNodeRef.current = source;
        filterNodeRef.current = filter;
        gainNodeRef.current = gain;
    };

    let lastOut = 0;

    const stopAudio = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current.disconnect();
            sourceNodeRef.current = null;
        }
    };

    const togglePower = () => {
        if (isOn) {
            stopAudio();
            setIsOn(false);
        } else {
            initAudio();
            setIsOn(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-slate-950/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)] font-sans relative"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-cyan-900/20 to-transparent">
                <div className="flex items-center gap-3">
                    <Radio className={`w-5 h-5 ${isOn ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                    <span className="font-bold text-slate-100 tracking-wider text-sm flex items-center gap-2">
                        QUANTUM RADIO
                        {isOn && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                    </span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Main Display */}
            <div className="h-40 bg-black/50 relative overflow-hidden flex items-center justify-center">
                {isOn ? (
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-60">
                        {/* Fake visualizer bars */}
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: '10%' }}
                                animate={{ height: ['20%', '90%', '20%'] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.5 + Math.random(),
                                    ease: "easeInOut",
                                    delay: Math.random() * 0.5
                                }}
                                className="w-2 bg-gradient-to-t from-cyan-600 to-purple-500 rounded-full blur-[1px]"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-700 font-mono text-xs tracking-widest uppercase flex flex-col items-center gap-2">
                        <Waves className="w-8 h-8 opacity-20" />
                        Offline // Silence
                    </div>
                )}

                {/* Scanlines Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
            </div>

            {/* Controls */}
            <div className="p-6 space-y-6">

                {/* Main Power Button */}
                <div className="flex justify-center -mt-10 mb-4 relative z-10">
                    <button
                        onClick={togglePower}
                        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 shadow-xl ${isOn
                                ? 'bg-slate-900 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]'
                                : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        <Power className={`w-6 h-6 ${isOn ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </button>
                </div>

                {/* Sliders */}
                <div className={`space-y-4 transition-all duration-500 ${isOn ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-slate-400 uppercase">
                            <span className="flex items-center gap-2"><Volume2 className="w-3 h-3" /> Volume</span>
                            <span>{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-mono text-slate-400 uppercase">
                            <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin-slow" /> Entropy (Freq)</span>
                            <span>{(frequency * 100).toFixed(0)} Hz</span>
                        </div>
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={frequency} onChange={(e) => setFrequency(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />
                    </div>
                </div>

                {/* Status Bar */}
                <div className="text-[10px] text-center font-mono text-slate-600 pt-2 border-t border-white/5">
                    {isOn ? "RECEIVING STARLIGHT TRANSMISSION..." : "WAITING FOR SIGNAL"}
                </div>
            </div>
        </motion.div>
    );
};
