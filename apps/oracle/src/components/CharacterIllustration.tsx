import { useState } from 'react';
import { FACTION_CONTENT } from '../data/factions';
import type { PersonalityResult } from '@fj/engine-core';

interface Props {
  personality: PersonalityResult;
}

export default function CharacterIllustration({ personality }: Props) {
  const src = `/assets/characters/char-${personality.typeName}.png`;
  const factionColor = FACTION_CONTENT[personality.faction]?.color ?? '#d4a04a';
  const [imgOk, setImgOk] = useState<boolean | null>(null);

  return (
    <div className="flex justify-center my-4">
      {/* Real image — hidden until loaded successfully */}
      {imgOk !== false && (
        <img
          src={src}
          alt=""
          className="h-[200px] w-auto object-contain"
          loading="lazy"
          onLoad={() => setImgOk(true)}
          onError={() => setImgOk(false)}
          style={imgOk === true ? {} : { display: 'none' }}
        />
      )}

      {/* CSS fallback placeholder — shown when image unavailable */}
      {imgOk === false && (
        <div
          className="h-[180px] w-[180px] rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${factionColor}15 0%, ${factionColor}05 100%)`,
            border: `2px solid ${factionColor}25`,
          }}
        >
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
            {/* Head */}
            <circle cx="40" cy="28" r="22" stroke={factionColor} strokeWidth="1.5" opacity="0.4" />
            {/* Shoulders */}
            <path
              d="M8 90C8 62 18 52 40 52C62 52 72 62 72 90"
              stroke={factionColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Code inside head */}
            <text
              x="40" y="33" textAnchor="middle"
              fill={factionColor} fontSize="12"
              fontFamily="monospace" fontWeight="bold"
              opacity="0.5"
            >
              {personality.code.replace(/-/g, '')}
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
