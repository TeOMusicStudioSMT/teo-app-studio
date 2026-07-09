/**
 * 🌌 GravitonConstellation — żywa mapa sieci GRV.
 *
 * Rysuje węzły z rejestru (localStorage) jako konstelację na canvasie:
 *  - pozycja deterministyczna z hasha ID (ta sama mapa po odświeżeniu),
 *  - krawędzie łączą węzły tego samego typu oraz tego samego autora,
 *  - jasność/pulsowanie zależne od stabilności (GENESIS świeci, FLASH migocze),
 *  - hover podświetla węzeł i jego połączenia, klik otwiera podgląd.
 */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { GravitonNode, StabilityLevel } from '../services/appNodeService';

interface Star {
    node: GravitonNode;
    x: number;   // 0..1 (skalowane do canvas)
    y: number;
    r: number;   // promień bazowy
    phase: number;
    color: string;
}

interface Props {
    nodes: GravitonNode[];
    onSelect?: (node: GravitonNode) => void;
    height?: number;
}

/** Deterministyczny hash 32-bit ze stringa (FNV-1a). */
const hash = (s: string): number => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
};

const TYPE_COLOR: Record<string, string> = {
    CODE: '#22d3ee',    // cyan
    VIDEO: '#f472b6',   // pink
    IMAGE: '#a78bfa',   // violet
    AUDIO: '#4ade80',   // green
    THOUGHT: '#fbbf24', // amber
};

const STABILITY_RADIUS: Record<StabilityLevel, number> = {
    GENESIS: 7, STABLE: 5.5, FLUID: 4.5, FLASH: 3.5,
};

export const GravitonConstellation: React.FC<Props> = ({ nodes, onSelect, height = 420 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const hoveredRef = useRef<string | null>(null);
    hoveredRef.current = hovered;

    // Gwiazdy: pozycje deterministyczne z ID (stabilna mapa między sesjami)
    const stars = useMemo<Star[]>(() => nodes.map(node => {
        const h1 = hash(node.id);
        const h2 = hash(node.id + '::y');
        return {
            node,
            x: 0.08 + (h1 % 10000) / 10000 * 0.84,
            y: 0.12 + (h2 % 10000) / 10000 * 0.76,
            r: STABILITY_RADIUS[node.stability] ?? 4,
            phase: (h1 % 628) / 100,
            color: TYPE_COLOR[node.type] ?? '#94a3b8',
        };
    }), [nodes]);

    // Krawędzie: wspólny typ LUB wspólny autor (max 3 najbliższe na węzeł — bez pajęczyny)
    const edges = useMemo<[number, number][]>(() => {
        const out: [number, number][] = [];
        for (let i = 0; i < stars.length; i++) {
            const candidates: { j: number; d: number }[] = [];
            for (let j = 0; j < stars.length; j++) {
                if (i === j) continue;
                const a = stars[i].node, b = stars[j].node;
                if (a.type !== b.type && a.author !== b.author) continue;
                const dx = stars[i].x - stars[j].x, dy = stars[i].y - stars[j].y;
                candidates.push({ j, d: dx * dx + dy * dy });
            }
            candidates.sort((p, q) => p.d - q.d).slice(0, 3).forEach(({ j }) => {
                if (i < j) out.push([i, j]);
            });
        }
        return out;
    }, [stars]);

    // Pętla renderująca
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let raf = 0;

        const draw = (t: number) => {
            const dpr = window.devicePixelRatio || 1;
            const W = canvas.clientWidth, H = canvas.clientHeight;
            if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
                canvas.width = W * dpr; canvas.height = H * dpr;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);

            const time = t / 1000;
            const hoveredId = hoveredRef.current;

            // Krawędzie
            for (const [i, j] of edges) {
                const a = stars[i], b = stars[j];
                const active = hoveredId && (a.node.id === hoveredId || b.node.id === hoveredId);
                ctx.beginPath();
                ctx.moveTo(a.x * W, a.y * H);
                ctx.lineTo(b.x * W, b.y * H);
                ctx.strokeStyle = active ? 'rgba(34,211,238,0.55)' : 'rgba(148,163,184,0.12)';
                ctx.lineWidth = active ? 1.4 : 0.7;
                ctx.stroke();
            }

            // Węzły
            for (const s of stars) {
                const { node } = s;
                // FLASH migocze mocno, GENESIS oddycha spokojnie
                const flicker = node.stability === 'FLASH'
                    ? 0.55 + 0.45 * Math.abs(Math.sin(time * 5 + s.phase))
                    : 0.75 + 0.25 * Math.sin(time * 1.2 + s.phase);
                const isHover = node.id === hoveredId;
                const r = s.r * (isHover ? 1.6 : 1);

                // Halo
                const grad = ctx.createRadialGradient(s.x * W, s.y * H, 0, s.x * W, s.y * H, r * 4);
                grad.addColorStop(0, s.color + (isHover ? 'aa' : '55'));
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, r * 4, 0, Math.PI * 2);
                ctx.fill();

                // Rdzeń
                ctx.globalAlpha = flicker;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x * W, s.y * H, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;

                // Etykieta (hover albo GENESIS zawsze)
                if (isHover || node.stability === 'GENESIS') {
                    ctx.font = '10px "JetBrains Mono", monospace';
                    ctx.fillStyle = isHover ? '#e2e8f0' : 'rgba(226,232,240,0.5)';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.name.slice(0, 24), s.x * W, s.y * H - r - 8);
                }
            }
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, [stars, edges]);

    // Hover + klik (hit-test w przestrzeni 0..1)
    const hitTest = useCallback((e: React.MouseEvent): Star | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width;
        const my = (e.clientY - rect.top) / rect.height;
        let best: Star | null = null, bestD = Infinity;
        for (const s of stars) {
            const dx = (s.x - mx) * rect.width, dy = (s.y - my) * rect.height;
            const d = dx * dx + dy * dy;
            if (d < 400 && d < bestD) { best = s; bestD = d; } // 20px promień łapania
        }
        return best;
    }, [stars]);

    if (!nodes.length) return null;

    return (
        <div className="relative rounded-2xl border border-white/10 bg-[#05070d] overflow-hidden mb-8">
            <div className="absolute top-3 left-4 z-10 text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase pointer-events-none">
                ✦ Konstelacja GRV · {nodes.length} węzłów · {edges.length} rezonansów
            </div>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height }}
                className="cursor-pointer"
                onMouseMove={(e) => setHovered(hitTest(e)?.node.id ?? null)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => { const s = hitTest(e); if (s && onSelect) onSelect(s.node); }}
            />
            {/* Legenda typów */}
            <div className="absolute bottom-3 right-4 z-10 flex gap-3 text-[9px] font-mono text-slate-500 pointer-events-none">
                {Object.entries(TYPE_COLOR).map(([type, color]) => (
                    <span key={type} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                        {type}
                    </span>
                ))}
            </div>
        </div>
    );
};
