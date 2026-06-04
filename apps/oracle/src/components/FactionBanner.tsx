import { motion } from 'framer-motion';
import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';

interface Props {
  faction: Faction;
  typeName: string;
}

export default function FactionBanner({ faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-[240px] rounded-card px-6 py-8 text-white text-center relative overflow-hidden"
      style={{ backgroundColor: content.color }}
    >
      {/* Image asset (loaded on top of fallback color) */}
      <img
        src={`/assets/factions/${faction.slice(0, 2).toLowerCase()}.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      {/* CSS geometric texture overlay — subtle depth while waiting for image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0,0,0,0.06) 0%, transparent 50%),
            repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)
          `,
        }}
      />
      {/* Text overlay */}
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-widest opacity-80 mb-2 drop-shadow-sm">{faction}</p>
        <h1 className="text-[24px] font-bold mb-3 drop-shadow-sm">{typeName}</h1>
        <p className="text-base opacity-95 italic leading-relaxed drop-shadow-sm">"{content.slogan}"</p>
      </div>
    </motion.div>
  );
}
