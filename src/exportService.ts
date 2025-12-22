import { saveAs } from 'file-saver'; // Opcjonalne, ale zrobimy to natywnie dla prostoty

// Tłumacz JSON -> React Code
export const generateReactCode = (projectName: string, uiState: any) => {
    const elementsCode = uiState.elements.map((el: any) => {
        // Generowanie kodu dla każdego elementu
        if (el.type === 'button') {
            const rounded = "rounded-xl"; // Domyślnie
            return `
        <motion.button 
            whileTap={{ scale: 0.95 }} 
            className="w-full py-4 ${rounded} font-bold shadow-lg text-sm tracking-wide mb-4 ${el.color === 'purple' || !el.color ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-white text-black'}"
        >
            ${el.text}
        </motion.button>`;
        }
        if (el.type === 'header') {
            return `<h2 className="text-3xl font-bold text-white mt-4 mb-4 font-display">${el.text}</h2>`;
        }
        if (el.type === 'text') {
            return `<p className="text-gray-400 text-sm leading-relaxed mb-4">${el.content}</p>`;
        }
        if (el.type === 'input') {
            return `
        <div className="mb-4">
            <input 
                placeholder="${el.placeholder}" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500 transition-all" 
            />
        </div>`;
        }
        if (el.type === 'card') {
            return `
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-2 mb-4 hover:bg-white/10 transition-colors">
            ${el.title ? `<h3 className="font-bold text-white">${el.title}</h3>` : ''}
            ${el.subtitle ? `<p className="text-xs text-gray-400">${el.subtitle}</p>` : ''}
            ${!el.title && !el.subtitle ? '<div className="h-20 bg-white/10 rounded animate-pulse"></div>' : ''}
        </div>`;
        }
        return '';
    }).join('\n        ');

    // Szablon całego pliku
    return `import React from 'react';
import { motion } from 'framer-motion';

export default function ${projectName.replace(/\s+/g, '')}App() {
  return (
    <div className="min-h-screen w-full flex flex-col p-6 font-sans" style={{ backgroundColor: '${uiState.screenColor}' }}>
        
        {/* Status Bar Fake */}
        <div className="h-6 w-full flex justify-between items-center mb-6 opacity-50">
            <span className="text-xs text-white mix-blend-difference">9:41</span>
            <div className="w-16 h-4 bg-white/20 rounded-full mix-blend-difference" />
        </div>

        {/* Generated Content */}
        <div className="flex-1 overflow-y-auto pb-10">
        ${elementsCode}
        </div>

    </div>
  );
}
`;
};

// Funkcja pobierania
export const downloadCode = (projectName: string, uiState: any) => {
    const code = generateReactCode(projectName, uiState);
    const blob = new Blob([code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_App.tsx`; // Np. Cyber_Bakery_App.tsx
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};