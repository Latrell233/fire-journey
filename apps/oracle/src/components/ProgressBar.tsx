import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  const [displayPct, setDisplayPct] = useState(0);

  // Animate the percentage counter
  const springPct = useSpring(0, { stiffness: 80, damping: 20 });
  const rounded = useTransform(springPct, (v) => Math.round(v));

  useEffect(() => {
    springPct.set(pct);
  }, [pct]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplayPct(v));
    return unsub;
  }, [rounded]);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-end mb-2">
        <span className="text-[13px] text-[#8a7a6a] font-medium">
          第 {current} / {total} 题
        </span>
        <span className="text-[12px] text-[#8a7a6a] tabular-nums font-medium">
          {displayPct}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#f0ebe4] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #d4a04a 0%, #c48a3a 100%)',
            width: `${pct}%`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Glow dot at tip */}
        {pct > 0 && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"
            animate={{ left: `calc(${pct}% - 4px)` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>
    </div>
  );
}
