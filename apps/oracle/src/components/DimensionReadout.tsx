import { motion } from 'framer-motion';
import { DIMENSION_LABELS, getDimensionInterpretation, getDimensionBadge } from '../data/factions';

interface Props {
  dimension: string;
  pValue: number;
}

export default function DimensionReadout({ dimension, pValue }: Props) {
  const label = DIMENSION_LABELS[dimension];
  const interpretation = getDimensionInterpretation(dimension, pValue);
  const badge = getDimensionBadge(dimension, pValue);
  if (!label) return null;

  const strengthLabel =
    pValue >= 60 ? '强正向'
    : pValue > 50 ? '轻度正向'
    : pValue === 50 ? '完全平衡'
    : pValue > 40 ? '轻度反向'
    : '强反向';

  // Bar logic: 0 = full reverse, 50 = center, 100 = full forward
  const barPct = pValue;
  const isForward = pValue >= 50;
  const fillFromCenter = `${Math.abs(pValue - 50) * 2}%`;

  return (
    <div className="bg-white rounded-card p-5 border border-[#f0ebe4]">
      {/* Header row */}
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-sm font-semibold text-[#2c2c2c]">{label.name}</h3>
        <span className="text-[11px] text-[#8a7a6a]">{strengthLabel}</span>
      </div>

      {/* Bidirectional bar */}
      <div className="my-4">
        {/* Labels above bar */}
        <div className="flex justify-between text-[10px] text-[#8a7a6a] mb-1.5 px-0.5">
          <span className="font-medium">{label.forward}</span>
          <span className="font-medium">{label.reverse}</span>
        </div>

        {/* The bar track — split background halves */}
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: `linear-gradient(to right, #e8e3db 0%, #e8e3db 50%, #faf5e8 50%, #faf5e8 100%)` }}>
          {/* Center marker line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#8a7a6a]/50 z-10" />

          {/* Fill: extends from center toward the score side */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: fillFromCenter }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute top-0 bottom-0 bg-primary"
            style={{
              [isForward ? 'left' : 'right']: '50%',
              borderRadius: isForward ? '0 9999px 9999px 0' : '9999px 0 0 9999px',
            }}
          />

          {/* Position dot */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-primary rounded-full shadow-sm z-20"
            style={{ left: `calc(${barPct}% - 7px)` }}
          />
        </div>
      </div>

      {/* Badge — the fun label */}
      {badge && (
        <div className="mb-3 px-3 py-2 bg-[#faf5e8] rounded-btn border border-primary/15">
          <p className="text-[13px] font-bold text-[#2c2c2c]">
            「{badge.code}」
          </p>
          <p className="text-[12px] text-[#6b6258] leading-relaxed mt-0.5">
            {badge.description}
          </p>
        </div>
      )}

      {/* Interpretation */}
      <p className="text-[13px] text-[#6b6258] leading-relaxed">{interpretation}</p>
    </div>
  );
}
