import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHexagon, FiTrash2, FiCode, FiX, FiCpu, FiClock, FiVideo, FiImage, FiMusic, FiFileText } from 'react-icons/fi';
import { getGravitonNodes, deleteGravitonNode, type GravitonNode, type NodeType } from '../services/appNodeService';
import toast from 'react-hot-toast';
import { AssetLifecycleView } from './AssetLifecycleView';
import { GravitonConstellation } from './GravitonConstellation';

const getNodeIcon = (type: NodeType) => {
    if (!type) return <FiHexagon />;
    switch (type.toUpperCase()) {
        case 'VIDEO': return <FiVideo />;
        case 'IMAGE': return <FiImage />;
        case 'AUDIO': return <FiMusic />;
        case 'CODE': return <FiCode />;
        default: return <FiFileText />;
    }
};

const NodeCard = ({ node, onClick, onDelete }: { node: GravitonNode, onClick: () => void, onDelete: () => void }) => {
    if (!node) return null;

    const displayMode = node.mode || 'just';
    const displayStability = node.stability || 'UNKNOWN';
    const displayId = node.id || '???';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.5)' }}
            onClick={onClick}
            // ZMIANA: Tło jest teraz ciemniejsze i mniej przezroczyste, border wyraźniejszy
            className="bg-[#0d1117]/95 border border-white/10 p-5 rounded-xl cursor-pointer group shadow-lg hover:shadow-cyan-500/20 transition-all relative overflow-hidden"
        >
            {/* Glow Effect */}
            <div className={`absolute top-0 right-0 p-24 bg-gradient-to-br ${displayMode === 'just' ? 'from-lime-500/10' : 'from-cyan-500/10'} to-transparent rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none`} />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-lg ${displayMode === 'just' ? 'bg-lime-500/20 text-lime-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {getNodeIcon(node.type)}
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 border border-white/10 px-2 py-1 rounded bg-black/40">
                        {node.type || 'RAW'}
                    </span>
                </div>
            </div>

            <h3 className="text-white font-bold text-lg mb-2 truncate pr-2">{node.name || 'Unnamed Artifact'}</h3>
            <p className="text-slate-500 text-xs font-mono mb-4">ID: {displayId.substring(0, 8)}...</p>

            <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-3">
                <span className={`text-[10px] uppercase tracking-widest font-bold ${displayStability === 'GENESIS' ? 'text-purple-400' : 'text-slate-500'}`}>
                    {displayStability}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                    title="Burn Node"
                >
                    <FiTrash2 />
                </button>
            </div>
        </motion.div>
    );
};

export const GravitonGalleryView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [nodes, setNodes] = useState<GravitonNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<GravitonNode | null>(null);

    useEffect(() => {
        setNodes(getGravitonNodes());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm("Potwierdzasz spalenie tego Węzła? Proces jest nieodwracalny.")) {
            deleteGravitonNode(id);
            setNodes(getGravitonNodes());
            toast.success("Energia węzła rozproszona.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="flex justify-between items-center mb-10 sticky top-0 z-20 bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">GRAVITON <span className="text-cyan-500">GALLERY</span></h1>
                        <p className="text-slate-400 text-sm">Registry of your Tokenized Assets.</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white border border-white/5">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {nodes.length === 0 ? (
                    <div className="text-center py-32 flex flex-col items-center opacity-50">
                        <FiCpu className="w-24 h-24 text-slate-700 mb-6" />
                        <div className="text-2xl text-slate-500 font-bold">Pusty Rejestr</div>
                        <p className="text-sm text-slate-600 mt-2 max-w-md">Twoja cyfrowa przestrzeń jest czysta. Użyj App Studio lub Quantum Forge, aby zmaterializować pierwsze obiekty.</p>
                    </div>
                ) : (
                    <>
                    {/* 🌌 Żywa mapa sieci — węzły połączone rezonansem (typ/autor) */}
                    <GravitonConstellation nodes={nodes} onSelect={setSelectedNode} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        <AnimatePresence>
                            {nodes.map((n, index) => (
                                <NodeCard
                                    key={n.id || index}
                                    node={n}
                                    onClick={() => setSelectedNode(n)}
                                    onDelete={() => handleDelete(n.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                    </>
                )}
            </div>

            <AnimatePresence>
                {selectedNode && <AssetLifecycleView node={selectedNode} onClose={() => setSelectedNode(null)} />}
            </AnimatePresence>
        </motion.div>
    );
};