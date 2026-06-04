import { motion } from 'framer-motion';
import { SHARE_COPY } from '../data/typeProfiles';
import { FACTION_CONTENT } from '../data/factions';
import CodeDisplay from './CodeDisplay';
import type { Faction, Dimension } from '@fj/engine-core';

interface Props {
  code: string;
  faction: Faction;
  typeName: string;
  borderline: Dimension[];
  balanced: Dimension[];
}

export default function ResultSummary({ code, faction, typeName, borderline, balanced }: Props) {
  const share = SHARE_COPY[code];
  const factionData = FACTION_CONTENT[faction];
  const tagline = share?.tagline ?? factionData?.slogan ?? '';

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-4 bg-white rounded-card shadow-sm border border-[#f0ebe4] px-4 py-5 text-center"
    >
      <p className="text-[11px] text-[#8a7a6a] uppercase tracking-widest mb-1">你的财富人格</p>

      {/* DNA Code animation */}
      <CodeDisplay code={code} borderline={borderline} balanced={balanced} />

      {/* Type name */}
      <h2 className="text-[20px] font-bold text-[#2c2c2c] mt-1">{typeName}</h2>

      {/* Tagline */}
      <p className="text-[13px] text-[#6b6258] leading-relaxed italic mt-2 px-2">
        {tagline}
      </p>
    </motion.div>
  );
}
