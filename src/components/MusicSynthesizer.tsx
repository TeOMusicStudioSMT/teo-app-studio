import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMusic, FiSliders, FiActivity, FiCpu, FiLock, FiCheckCircle,
    FiVolume2, FiZap, FiTerminal, FiSave, FiHexagon, FiEdit3,
    FiMaximize, FiMinimize, FiBarChart2, FiAperture, FiVolumeX, FiX, FiCamera
} from 'react-icons/fi';
import { negotiateAccess } from '../lib/jwProtocol';
import { mintGravitonNode } from '../services/appNodeService';
import { useAtomValue } from 'jotai';
import { electricBorderAtom } from '../store/electricBorder';
import toast from 'react-hot-toast';

// ... (Knob i OscillatorControl zostają bez zmian - wklej je z poprzedniej wersji lub zostaw jeśli masz) ...
// DLA PEWNOŚCI WKLEJAM CAŁY PLIK PONIŻEJ

const Knob = ({ label, value, min, max, onChange, color = "text-purple-500", unit = "" }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const handleBlur = () => { setIsEditing(false); onChange(Math.max(min, Math.min(max, Number(tempValue)))); };
    return (
        <div className="flex flex-col items-center gap-2 group relative">
            <div className="relative w-16 h-16 flex items-center justify-center bg-black/40 rounded-full border border-white/10 shadow-inner group-hover:border-white/30 transition-colors">
                <svg className="w-full h-full transform -rotate-90 pointer-events-none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-white/5" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - ((value - min) / (max - min)) * 175} className={`${color} transition-all duration-100`} />
                </svg>
                {!isEditing && <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer z-10" onDoubleClick={() => { setIsEditing(true); setTempValue(value); }} />}
                <div className="absolute flex items-center justify-center">
                    {isEditing ? <input autoFocus type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()} className="w-12 bg-black text-white text-xs font-bold text-center border border-cyan-500 rounded focus:outline-none z-20" />
                        : <div className="text-[10px] font-mono font-bold text-white pointer-events-none">{Math.round(value)}{unit}</div>}
                </div>
            </div>
            <div className="flex items-center gap-1"><span className="text-[9px] uppercase font-mono text-slate-500 tracking-widest">{label}</span><FiEdit3 className="w-2 h-2 text-slate-600 opacity-0 group-hover:opacity-100" /></div>
        </div>
    );
};

const OscillatorControl = ({ label, type, setType }: { label: string, type: string, setType: (t: string) => void }) => (
    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2"><FiActivity className="text-teal-400" /> {label}</label>
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
            {['sine', 'square', 'sawtooth', 'triangle'].map((t) => (
                <button key={t} onClick={() => setType(t)} className={`flex-1 py-1 text-[9px] font-bold rounded transition-colors uppercase ${type === t ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}>{t.substring(0, 3)}</button>
            ))}
        </div>
    </div>
);

// --- SONIC VISUALIZER V2 (GEOMETRIA MANDALI) ---
const SonicVisualizer = ({ analyser, frequency, isVerified, onCapture }: { analyser: AnalyserNode | null, frequency: number, isVerified: boolean, onCapture?: (file: File) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'BARS' | 'GEOMETRY' | 'WAVE'>('GEOMETRY');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setIsFullscreen(true); }
        else { document.exitFullscreen(); setIsFullscreen(false); }
    };

    const handleCapture = () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `Mandala_${Math.floor(frequency)}Hz.png`, { type: 'image/png' });
                onCapture?.(file);
                toast.success("MATERIA SCHWYTANA!");
            }
        });
    };

    useEffect(() => {
        if (!canvasRef.current || !analyser) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const timeArray = new Uint8Array(bufferLength);

        const render = () => {
            animationId = requestAnimationFrame(render);
            canvas.width = canvas.parentElement?.clientWidth || 300;
            canvas.height = canvas.parentElement?.clientHeight || 200;
            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);
            analyser.getByteFrequencyData(dataArray);
            analyser.getByteTimeDomainData(timeArray);

            let sum = 0; for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength; // Bass/Volume indicator

            if (mode === 'BARS') {
                const barWidth = (w / bufferLength) * 2.5;
                let barX = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = (dataArray[i] / 255) * h;
                    ctx.fillStyle = `hsl(${i / bufferLength * 360 + average}, 100%, 50%)`;
                    ctx.fillRect(barX, h - barHeight, barWidth, barHeight);
                    barX += barWidth + 1;
                }
            }
            else if (mode === 'WAVE') {
                ctx.lineWidth = 2; ctx.strokeStyle = '#2dd4bf'; ctx.beginPath();
                const sliceWidth = w * 1.0 / bufferLength; let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    const v = timeArray[i] / 128.0; const y = v * h / 2;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.lineTo(w, h / 2); ctx.stroke();
            }
            else if (mode === 'GEOMETRY') {
                // MANDALA ENGINE
                const sides = Math.max(3, Math.floor(frequency / 40)); // Więcej boków przy wyższej częstotliwości
                const radius = Math.min(w, h) / 3.5;
                const scale = 1 + (average / 200); // Pulsowanie w rytm basu

                ctx.translate(cx, cy);
                ctx.rotate(Date.now() / 2000); // Ciągły obrót

                // Pętla rysująca kilka warstw dla efektu głębi
                for (let layer = 0; layer < 3; layer++) {
                    ctx.beginPath();
                    ctx.strokeStyle = `hsla(${(frequency + layer * 30) % 360}, 80%, 60%, ${0.8 - layer * 0.2})`;
                    ctx.lineWidth = 2;

                    for (let i = 0; i <= sides; i++) {
                        const angle = (i * 2 * Math.PI) / sides;
                        // Modyfikator kształtu przez dane audio (różne pasma dla różnych warstw)
                        const modifier = (dataArray[(i * 10 + layer * 20) % bufferLength] / 255) * 40 * scale;
                        const r = (radius + modifier) * (1 - layer * 0.2); // Mniejsze warstwy w środku
                        const x = r * Math.cos(angle);
                        const y = r * Math.sin(angle);
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.stroke();

                    // Linie łączące do środka (pajęczyna)
                    if (layer === 0) {
                        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                        ctx.lineWidth = 1;
                        for (let i = 0; i < sides; i++) {
                            const angle = (i * 2 * Math.PI) / sides;
                            ctx.beginPath();
                            ctx.moveTo(0, 0);
                            ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
                            ctx.stroke();
                        }
                    }
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset
            }
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [analyser, mode, frequency]);

    return (
        <div ref={containerRef} className={`relative bg-black rounded-xl overflow-hidden group border border-white/10 ${isFullscreen ? 'fixed inset-0 z-[100] rounded-none' : 'flex-grow h-full'}`}>
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleCapture} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40" title="CAPTURE SNAPSHOT"><FiCamera className="w-4 h-4" /></button>
                <div className="w-px bg-white/20 mx-1" />
                <button onClick={() => setMode('BARS')} className="p-2 rounded-lg bg-black/50 text-white hover:bg-teal-500/20"><FiBarChart2 className="w-4 h-4" /></button>
                <button onClick={() => setMode('WAVE')} className="p-2 rounded-lg bg-black/50 text-white hover:bg-teal-500/20"><FiActivity className="w-4 h-4" /></button>
                <button onClick={() => setMode('GEOMETRY')} className="p-2 rounded-lg bg-black/50 text-white hover:bg-teal-500/20"><FiAperture className="w-4 h-4" /></button>
                <div className="w-px bg-white/20 mx-1" />
                <button onClick={toggleFullscreen} className="p-2 bg-black/50 text-white rounded-lg hover:bg-white/20">{isFullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}</button>
            </div>
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-teal-500/50 pointer-events-none uppercase">VISUAL: {mode}</div>
        </div>
    );
};

export const MusicSynthesizer: React.FC<{ onClose: () => void, onSnapshot?: (file: File) => void }> = ({ onClose, onSnapshot }) => {
    const { globalMode } = useAtomValue(electricBorderAtom);
    const [isVerified, setIsVerified] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [statusLog, setStatusLog] = useState<string[]>([]);

    // --- MUTE STATE ---
    const [isMuted, setIsMuted] = useState(false);

    // Params
    const [oscType, setOscType] = useState<OscillatorType>('sine');
    const [frequency, setFrequency] = useState(432);
    const [cutoff, setCutoff] = useState(2500);
    const [resonance, setResonance] = useState(5);
    const [volume, setVolume] = useState(0.2);

    const audioCtx = useRef<AudioContext | null>(null);
    const oscNode = useRef<OscillatorNode | null>(null);
    const gainNode = useRef<GainNode | null>(null);
    const filterNode = useRef<BiquadFilterNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // MUTE LOGIC
    useEffect(() => {
        if (audioCtx.current) {
            if (isMuted) audioCtx.current.suspend();
            else audioCtx.current.resume();
        }
    }, [isMuted]);

    useEffect(() => {
        if (isVerified && !audioCtx.current) initAudio();
        // Cleanup na zamknięcie (OnClose)
        return () => { stopAudio(); };
    }, [isVerified]);

    // Live Updates
    useEffect(() => { if (oscNode.current) oscNode.current.type = oscType; }, [oscType]);
    useEffect(() => { if (oscNode.current && audioCtx.current) oscNode.current.frequency.setTargetAtTime(frequency, audioCtx.current.currentTime, 0.1); }, [frequency]);
    useEffect(() => { if (filterNode.current && audioCtx.current) { filterNode.current.frequency.setTargetAtTime(cutoff, audioCtx.current.currentTime, 0.1); filterNode.current.Q.setTargetAtTime(resonance, audioCtx.current.currentTime, 0.1); } }, [cutoff, resonance]);
    useEffect(() => { if (gainNode.current && audioCtx.current) gainNode.current.gain.setTargetAtTime(volume, audioCtx.current.currentTime, 0.1); }, [volume]);

    const initAudio = () => {
        try {
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            audioCtx.current = new Ctx();
            oscNode.current = audioCtx.current.createOscillator();
            gainNode.current = audioCtx.current.createGain();
            filterNode.current = audioCtx.current.createBiquadFilter();
            analyserRef.current = audioCtx.current.createAnalyser();
            analyserRef.current.fftSize = 2048; // Większa precyzja dla geometrii

            oscNode.current.type = oscType;
            oscNode.current.frequency.value = frequency;
            filterNode.current.type = 'lowpass';
            filterNode.current.frequency.value = cutoff;
            filterNode.current.Q.value = resonance;
            gainNode.current.gain.value = volume;

            oscNode.current.connect(filterNode.current);
            filterNode.current.connect(gainNode.current);
            gainNode.current.connect(analyserRef.current);
            analyserRef.current.connect(audioCtx.current.destination);

            oscNode.current.start();
        } catch (e) { console.error(e); }
    };

    const stopAudio = () => {
        if (oscNode.current) { oscNode.current.stop(); oscNode.current.disconnect(); }
        if (audioCtx.current) audioCtx.current.close();
        audioCtx.current = null;
    };

    const checkPermissions = async () => {
        setIsChecking(true);
        setStatusLog([]);
        try {
            const token = await negotiateAccess((msg) => setStatusLog(prev => [...prev, msg]));
            if (token) setTimeout(() => { setIsVerified(true); toast.success("SYSTEM ONLINE"); }, 800);
        } catch (e) { toast.error("Odmowa."); }
        finally { setIsChecking(false); }
    };

    const mintSonicPreset = () => {
        const presetData = { engine: "SonicLab_v2.1", osc: oscType, freq: frequency, filter: { cutoff, res: resonance }, vol: volume };
        mintGravitonNode(`Sonic Mandala ${Math.floor(frequency)}Hz`, JSON.stringify(presetData), 'AUDIO', 'FLUID', globalMode);
        toast.success("Sonic Geometry Saved!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <div className="w-full max-w-5xl bg-[#0d1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl font-sans text-slate-300 relative min-h-[600px] flex flex-col">
                {/* HEADER */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-teal-900/20 to-transparent">
                    <div className="flex items-center gap-3">
                        <FiMusic className="text-teal-400 w-6 h-6" />
                        <div>
                            <h2 className="text-xl font-bold text-white leading-none">SONIC LAB</h2>
                            <span className="text-[10px] font-mono text-teal-500 uppercase tracking-widest">QUANTUM AUDIO ENGINE V2.1</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {isVerified && (
                            <>
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${isMuted ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}
                                >
                                    {isMuted ? <><FiVolumeX /> MUTED</> : <><FiVolume2 /> LIVE</>}
                                </button>
                                <button onClick={mintSonicPreset} className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30 transition-all flex items-center gap-2">
                                    <FiHexagon /> MINT GEO-PRESET
                                </button>
                            </>
                        )}
                        <button onClick={onClose}><FiX className="hover:text-white transition-colors" /></button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 flex-grow flex flex-col relative">
                    <AnimatePresence>
                        {!isVerified && (
                            <motion.div exit={{ opacity: 0, pointerEvents: 'none' }} className="absolute inset-0 z-20 bg-[#0d1117]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="bg-black border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                                    <FiCpu className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                                    <h3 className="text-white font-bold mb-2">Wymagana Autoryzacja Audio</h3>
                                    <div className="bg-black/50 border border-white/5 p-3 rounded mb-6 h-24 overflow-y-auto text-left font-mono text-[10px] text-teal-400 custom-scrollbar">
                                        {statusLog.map((l, i) => <div key={i}>{l}</div>)}
                                        {isChecking && <div className="animate-pulse">_</div>}
                                    </div>
                                    <button onClick={checkPermissions} disabled={isChecking} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-white/5">
                                        {isChecking ? <FiActivity className="animate-spin" /> : <FiZap />}
                                        {isChecking ? "Negocjacje..." : "Złóż Wniosek o Hałas"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-1000 h-full ${!isVerified ? 'blur-sm opacity-30 pointer-events-none' : ''}`}>
                        <div className="space-y-6 flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-widest border-b border-white/5 pb-2"><FiActivity className="text-teal-500" /> SOURCE & FILTER</div>
                            <OscillatorControl label="WAVEFORM" type={oscType} setType={(t) => setOscType(t as any)} />
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                <Knob label="FREQ (Hz)" value={frequency} min={20} max={2000} onChange={setFrequency} color="text-teal-400" />
                                <Knob label="CUTOFF" value={cutoff} min={20} max={5000} onChange={setCutoff} color="text-purple-400" />
                                <Knob label="RES" value={resonance} min={0} max={20} onChange={setResonance} color="text-pink-400" />
                                <Knob label="VOL" value={volume * 100} min={0} max={100} onChange={(v: number) => setVolume(v / 100)} color="text-white" />
                            </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col h-full min-h-[300px]">
                            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-widest border-b border-white/5 pb-2 mb-4 justify-between">
                                <span className="flex items-center gap-2"><FiVolume2 className="text-emerald-500" /> SONIC VISUALIZER</span>
                            </div>
                            <SonicVisualizer analyser={analyserRef.current} frequency={frequency} isVerified={isVerified} onCapture={onSnapshot} />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};