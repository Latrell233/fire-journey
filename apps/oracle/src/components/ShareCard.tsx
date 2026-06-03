import { FACTION_CONTENT } from '../data/factions';
import { SHARE_COPY } from '../data/typeProfiles';
import type { Faction } from '@fj/engine-core';
import { useState } from 'react';

interface Props {
  code: string;
  faction: Faction;
  typeName: string;
}

export default function ShareCard({ code, faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];
  const share = SHARE_COPY[code];
  const [copied, setCopied] = useState(false);

  const tagline = share?.tagline ?? content.slogan;
  const soulmate = share?.soulmate ?? '';
  const shareText = `我的财务DNA是 ${code}（${typeName}）——${tagline} 来测测你的：`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '我的财务DNA代码',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      await navigator.clipboard.writeText(shareText + ' ' + window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-card p-6 text-white text-center"
      style={{ backgroundColor: content.color }}
    >
      <p className="text-[11px] uppercase tracking-widest opacity-70 mb-2">{faction}</p>
      <p className="text-[24px] font-bold mb-1">{code}</p>
      <p className="text-[13px] opacity-80 mb-1">{typeName}</p>
      <p className="text-[11px] opacity-60 italic mt-2 mb-1">"{tagline}"</p>
      {soulmate && (
        <p className="text-[11px] opacity-50 mb-4">搞钱 Soulmate：{soulmate}</p>
      )}
      <button
        onClick={handleShare}
        className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm py-3 px-8 rounded-btn
                   active:scale-[0.97] transition-all duration-150"
      >
        {copied ? '已复制！' : '分享我的DNA'}
      </button>
    </div>
  );
}
