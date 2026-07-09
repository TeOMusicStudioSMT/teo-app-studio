import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const phrases = [
    "Choose the Reality Creation Interface...",
    "Calculating: Ounns TeO + H2O + Ether...",
    "= The Future.",
    "System Ready."
];

export const SystemMessage = () => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % phrases.length;
            const fullText = phrases[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            // Prędkość pisania vs kasowania
            setTypingSpeed(isDeleting ? 50 : 100);

            if (!isDeleting && text === fullText) {
                // Pauza po napisaniu całego zdania
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                // Przejście do następnego zdania
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    return (
        <div className="h-8 flex items-center justify-center">
            <p className="text-xl text-cyan-400 font-mono tracking-wider drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                {text}
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-5 ml-1 bg-cyan-400 align-middle"
                />
            </p>
        </div>
    );
};