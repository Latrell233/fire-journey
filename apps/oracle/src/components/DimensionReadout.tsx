import { motion } from 'framer-motion';
import { DIMENSION_LABELS, getDimensionInterpretation, getDimensionBadge } from '../data/factions';

interface Props {
  dimension: string;
  pValue: number;
  factionColor: string;
}

/** Hex → rgba with given alpha */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function DimensionReadout({ dimension, pValue, factionColor }: Props) {
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

  // Bar logic: 0% left edge = full forward, 50% center = balanced, 100% right edge = full reverse.
  // pValue is forward-percentage: 100 = full forward, 50 = balanced, 0 = full reverse.
  const isForward = pValue >= 50;
  const fillFromCenter = `${Math.abs(pValue - 50)}%`;

  return (
    <div className="bg-white rounded-card p-5 border border-[#f0ebe4]">
      {/* Header row */}
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-sm font-semibold text-[#2c2c2c]">{label.name}</h3>
        <span className="text-[11px] text-[#8a7a6a]">
          {strengthLabel}
          <span className="ml-1 text-[10px] opacity-60">· {label.forward.slice(0, 1)}{pValue}%</span>
        </span>
      </div>

      {/* Bidirectional bar */}
      <div className="my-4">
        {/* Labels above bar */}
        <div className="flex justify-between text-[10px] text-[#8a7a6a] mb-1.5 px-0.5">
          <span className="font-medium">{label.forward}</span>
          <span className="font-medium">{label.reverse}</span>
        </div>

        {/* The bar track — split background with faction color tint */}
        <div className="relative h-3 rounded-full overflow-hidden" style={{
          background: `linear-gradient(to right, ${hexToRgba(factionColor, 0.08)} 0%, ${hexToRgba(factionColor, 0.08)} 50%, ${hexToRgba(factionColor, 0.16)} 50%, ${hexToRgba(factionColor, 0.16)} 100%)`,
        }}>
          {/* Subtle tick marks at 25% / 50% / 75% */}
          <div className="absolute left-[25%] top-0 bottom-0 w-px bg-[#8a7a6a]/20 z-[5]" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#8a7a6a]/50 z-10" />
          <div className="absolute left-[75%] top-0 bottom-0 w-px bg-[#8a7a6a]/20 z-[5]" />

          {/* Fill: extends from center toward the score side */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: fillFromCenter }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute top-0 bottom-0"
            style={{
              backgroundColor: factionColor,
              [isForward ? 'right' : 'left']: '50%',
              borderRadius: isForward ? '9999px 0 0 9999px' : '0 9999px 9999px 0',
            }}
          />

        </div>
      </div>

      {/* Badge — the fun label */}
      {badge && (
        <div className="mb-3 px-3 py-2 rounded-btn border" style={{
          backgroundColor: hexToRgba(factionColor, 0.08),
          borderColor: hexToRgba(factionColor, 0.2),
        }}>
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
