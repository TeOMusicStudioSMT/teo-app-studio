/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'teo-void': '#030014', // Głęboka czerń tła
                'teo-primary': '#a855f7', // Fiolet TeO
                'teo-cyan': '#06b6d4', // Cyjan techniczny
                'teo-glass': 'rgba(255, 255, 255, 0.05)',
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 20px #a855f7' },
                    '50%': { opacity: .5, boxShadow: '0 0 5px #a855f7' },
                }
            }
        },
    },
    plugins: [],
}