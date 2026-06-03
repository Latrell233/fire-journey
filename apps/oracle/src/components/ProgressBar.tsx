import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] text-[#8a7a6a]">第 {current} / {total} 题</span>
        <span className="text-[11px] text-[#8a7a6a]">{pct}%</span>
      </div>
      <div className="w-full h-1 bg-[#f0ebe4] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
