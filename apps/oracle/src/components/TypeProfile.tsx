import { TYPE_PROFILES } from '../data/typeProfiles';
import { FACTION_CONTENT } from '../data/factions';
import type { PersonalityResult } from '@fj/engine-core';

interface Props {
  personality: PersonalityResult;
}

export default function TypeProfile({ personality }: Props) {
  const profile = TYPE_PROFILES[personality.code];
  if (!profile) return null;

  const factionColor = FACTION_CONTENT[personality.faction]?.color ?? '#d4a04a';

  return (
    <div className="space-y-5">
      {/* Core Portrait */}
      <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
        <SectionHeader color={factionColor} title="核心画像" />
        <p className="text-[14px] text-[#6b6258] leading-loose whitespace-pre-line">{profile.corePortrait}</p>

        {/* Formula highlight */}
        <div className="mt-5 p-4 bg-[#faf5e8] rounded-btn border border-primary/20">
          <p className="text-[13px] text-[#2c2c2c] font-semibold leading-relaxed">{profile.coreFormula}</p>
        </div>
      </div>

      {/* Decision Flow */}
      <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
        <SectionHeader color={factionColor} title="搞钱思维" />

        <h3 className="text-[12px] font-semibold text-[#2c2c2c] uppercase tracking-wide mb-2">决策优先级</h3>
        <ol className="space-y-2 mb-5">
          {profile.decisionPriorities.map((p, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-[#6b6258] leading-relaxed">
              <span className="font-semibold text-primary flex-shrink-0">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        <h3 className="text-[12px] font-semibold text-[#2c2c2c] uppercase tracking-wide mb-2">行事风格</h3>
        <ul className="space-y-2">
          {profile.behavioralTraits.map((t, i) => {
            const [title, ...rest] = t.split('：');
            return (
              <li key={i} className="text-[13px] text-[#6b6258] leading-relaxed">
                <span className="font-semibold">{title}</span>
                {rest.length > 0 && <span>：{rest.join('：')}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Interpersonal Gravity */}
      <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
        <SectionHeader color={factionColor} title="人际引力" />

        {profile.complementaryType && (
          <div className="mb-3 p-3 bg-[#f6f1eb] rounded-btn">
            <p className="text-[11px] text-[#8a7a6a] mb-1">天然互补</p>
            <p className="text-sm font-semibold text-[#2c2c2c]">{profile.complementaryType}</p>
            <p className="text-[13px] text-[#6b6258] leading-relaxed mt-1">{profile.complementaryDesc}</p>
          </div>
        )}

        {profile.conflictType && (
          <div className="p-3 bg-[#fef2f2] rounded-btn border border-danger/10">
            <p className="text-[11px] text-[#8a7a6a] mb-1">潜在冲突</p>
            <p className="text-sm font-semibold text-[#2c2c2c]">{profile.conflictType}</p>
            <p className="text-[13px] text-[#6b6258] leading-relaxed mt-1">{profile.conflictDesc}</p>
          </div>
        )}
      </div>

      {/* Crisis / Dark Side */}
      <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
        <SectionHeader color={factionColor} title="精神暗面" />

        {profile.pressureMode && (
          <div className="mb-5 p-3 bg-[#fef2f2] rounded-btn border border-danger/10">
            <p className="text-[11px] text-danger mb-1 font-semibold">压力下的退行模式</p>
            <p className="text-[13px] text-[#6b6258] leading-relaxed font-semibold">{profile.pressureMode}</p>
            {profile.pressureDesc && (
              <p className="text-[13px] text-[#6b6258] leading-relaxed mt-2">{profile.pressureDesc}</p>
            )}
          </div>
        )}

        <h3 className="text-[12px] font-semibold text-[#2c2c2c] uppercase tracking-wide mb-2">必须直面的暗面</h3>
        <ul className="space-y-2">
          {profile.darkSides.map((d, i) => {
            const [title, ...rest] = d.split('：');
            return (
              <li key={i} className="text-[13px] text-[#6b6258] leading-relaxed">
                <span className="font-semibold">{title}</span>
                {rest.length > 0 && <span>：{rest.join('：')}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Ideal Endgame */}
      <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
        <SectionHeader color={factionColor} title="理想终局" />
        {profile.idealEndgame && (
          <p className="text-sm font-semibold italic mb-4 leading-relaxed" style={{ color: factionColor }}>"{profile.idealEndgame}"</p>
        )}
        <p className="text-[14px] text-[#6b6258] leading-loose whitespace-pre-line">{profile.idealEndgameDesc}</p>
      </div>
    </div>
  );
}

/** Consistent section header with a tiny colored accent dot */
function SectionHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <h2 className="text-[16px] font-bold text-[#2c2c2c]">{title}</h2>
    </div>
  );
}
