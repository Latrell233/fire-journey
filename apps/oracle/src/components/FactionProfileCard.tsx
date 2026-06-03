import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';

interface Props {
  faction: Faction;
  typeName: string;
}

export default function FactionProfileCard({ faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];
  if (!content) return null;

  return (
    <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
      {/* Section label */}
      <p
        className="text-[11px] uppercase tracking-widest mb-4 font-semibold"
        style={{ color: content.color }}
      >
        {faction}
      </p>

      {/* Guide — personal, direct address */}
      <p className="text-[15px] text-[#4a3f35] leading-loose mb-5">
        {content.guide}
      </p>

      {/* Subtle divider */}
      <div className="w-8 h-px mb-5" style={{ backgroundColor: content.color }} />

      {/* Core philosophy — more analytical */}
      <p className="text-[14px] text-[#6b6258] leading-loose">
        {content.overview}
      </p>
    </div>
  );
}
