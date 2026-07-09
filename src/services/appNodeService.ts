// src/services/appNodeService.ts

import type { ElectricBorderMode } from '../store/electricBorder';

export type NodeType = 'CODE' | 'VIDEO' | 'IMAGE' | 'AUDIO' | 'THOUGHT';
export type StabilityLevel = 'FLASH' | 'FLUID' | 'STABLE' | 'GENESIS';

export interface GravitonNode {
    id: string;
    name: string;
    description?: string;
    type: NodeType;           // Co to jest?
    stability: StabilityLevel; // Jak bardzo jest trwałe?
    content: string;          // Kod, URL do pliku lub Treść
    timestamp: number;
    author: string;
    entropy: number;          // 0-100 (Im wyżej, tym szybciej znika - dla Flash nodes)
    mode: ElectricBorderMode;
}

const STORAGE_KEY = 'teo_graviton_nodes';

export const getGravitonNodes = (): GravitonNode[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const deleteGravitonNode = (id: string) => {
    const nodes = getGravitonNodes();
    const updatedNodes = nodes.filter(node => node.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNodes));
};

export const mintGravitonNode = (
    name: string,
    content: string,
    type: NodeType,
    stability: StabilityLevel,
    mode: ElectricBorderMode
): GravitonNode => {
    const nodes = getGravitonNodes();

    const hashPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Prefiks zależy od typu (APP, VID, IMG, MEM)
    const prefix = type === 'CODE' ? 'APP' : type === 'VIDEO' ? 'VID' : 'MEM';
    const nodeId = `GRV-${prefix}-${hashPart}-${stability.substring(0, 3)}`;

    // Obliczanie entropii na podstawie stabilności
    let entropyValue = 0;
    if (stability === 'FLASH') entropyValue = 90; // Bardzo nietrwałe
    if (stability === 'FLUID') entropyValue = 50;
    if (stability === 'STABLE') entropyValue = 10;
    if (stability === 'GENESIS') entropyValue = 0; // Wieczne

    const newNode: GravitonNode = {
        id: nodeId,
        name: name,
        type,
        stability,
        content,
        timestamp: Date.now(),
        author: 'TeO Prime',
        entropy: entropyValue,
        mode
    };

    const updatedNodes = [newNode, ...nodes];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNodes));

    return newNode;
};