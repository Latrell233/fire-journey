import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  code: string;
}

export default function CodeDisplay({ code }: Props) {
  const letters = code.split('-');
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGlow(true), letters.length * 120 + 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {letters.map((letter, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -12, opacity: 0 }}
          animate={{
            scale: 1,
            rotate: 0,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 18,
            delay: i * 0.15,
          }}
          className="relative"
        >
          {/* Subtle glow ring that appears after stagger */}
          {glow && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.3, scale: 1.15 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute -inset-1 rounded-btn bg-primary/20"
            />
          )}
          <div className="relative w-14 h-14 bg-[#f6f1eb] border-2 border-primary rounded-btn flex items-center justify-center">
            <span className="font-mono text-[18px] font-bold text-primary">{letter}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
