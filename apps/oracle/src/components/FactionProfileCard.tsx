import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';

interface Props {
  faction: Faction;
  typeName: string;
}

export default function FactionProfileCard({ faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];
  const [open, setOpen] = useState(false);
  if (!content) return null;

  return (
    <div className="bg-white rounded-card border border-[#f0ebe4] overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left
                   hover:bg-[#faf8f4] transition-colors duration-150"
      >
        <div>
          <p
            className="text-[16px] font-bold"
            style={{ color: content.color }}
          >
            {faction}
          </p>
          <p className="text-[12px] text-[#8a7a6a] mt-0.5">{typeName}</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#8a7a6a] text-sm flex-shrink-0 ml-2"
        >
          ▾
        </motion.span>
      </button>

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-[#f0ebe4]">
              {/* Guide */}
              <p className="text-[14px] text-[#4a3f35] leading-loose mb-4 mt-3">
                {content.guide}
              </p>

              {/* Subtle divider */}
              <div className="w-8 h-px mb-4" style={{ backgroundColor: content.color }} />

              {/* Core philosophy */}
              <p className="text-[13px] text-[#6b6258] leading-loose">
                {content.overview}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
