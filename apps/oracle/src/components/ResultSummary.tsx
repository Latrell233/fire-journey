import { motion } from 'framer-motion';
import { SHARE_COPY } from '../data/typeProfiles';
import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';

interface Props {
  code: string;
  faction: Faction;
  typeName: string;
}

export default function ResultSummary({ code, faction, typeName }: Props) {
  const share = SHARE_COPY[code];
  const factionData = FACTION_CONTENT[faction];
  const tagline = share?.tagline ?? factionData?.slogan ?? '';

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.85 }}
      className="mt-6 bg-white rounded-card p-6 border border-[#f0ebe4] text-center"
    >
      {/* One-line identity */}
      <p className="text-[11px] text-[#8a7a6a] uppercase tracking-widest mb-3">
        你的财富人格
      </p>

      <h2 className="text-[24px] font-bold text-[#2c2c2c] mb-1">{typeName}</h2>
      <p className="text-[15px] font-mono text-primary font-semibold mb-3">{code}</p>

      {/* Tagline in quote style */}
      <div className="relative px-4">
        <span
          className="absolute left-0 top-0 text-2xl leading-none opacity-20"
          style={{ color: factionData?.color }}
        >
          "
        </span>
        <p className="text-[14px] text-[#6b6258] leading-relaxed italic px-2">
          {tagline}
        </p>
      </div>
    </motion.div>
  );
}
