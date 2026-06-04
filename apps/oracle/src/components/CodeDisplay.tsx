import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Dimension } from '@fj/engine-core';

interface Props {
  code: string;
  /** Which letter positions (0=SC,1=IG,2=FV,3=EO) are borderline */
  borderline?: Dimension[];
  /** Which letter positions are perfectly balanced */
  balanced?: Dimension[];
}

const DIM_ORDER: Dimension[] = ['SC', 'IG', 'FV', 'EO'];

export default function CodeDisplay({ code, borderline = [], balanced = [] }: Props) {
  const letters = code.split('-');
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGlow(true), letters.length * 120 + 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {letters.map((letter, i) => {
        const dim = DIM_ORDER[i];
        const isBorderline = borderline.includes(dim);
        const isBalanced = balanced.includes(dim);

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.15 }}
            className="relative"
          >
            {glow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.3, scale: 1.15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute -inset-1 rounded-btn bg-primary/20"
              />
            )}
            <div
              className={`relative w-14 h-14 border-2 rounded-btn flex flex-col items-center justify-center
                ${isBorderline ? 'border-dashed bg-[#faf5e8]' : 'border-primary bg-[#f6f1eb]'}`}
              style={isBorderline ? { borderColor: '#d4a04a' } : {}}
            >
              <span className="font-mono text-[18px] font-bold text-primary leading-none">
                {letter}
              </span>
              {/* Borderline indicator dot */}
              {isBorderline && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {/* Balanced indicator: both sides */}
              {isBalanced && (
                <span className="absolute -bottom-1 w-3 h-1 rounded-full bg-primary/50" />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
