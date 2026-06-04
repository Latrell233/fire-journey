import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../store/quizStore';
import { FACTION_CONTENT } from '../data/factions';
import FactionBanner from '../components/FactionBanner';
import FactionProfileCard from '../components/FactionProfileCard';
import CharacterIllustration from '../components/CharacterIllustration';
import DimensionReadout from '../components/DimensionReadout';
import TypeProfile from '../components/TypeProfile';
import ShareCard from '../components/ShareCard';
import ResultSummary from '../components/ResultSummary';
import Celebration from '../components/Celebration';
import StickyActions from '../components/StickyActions';
import BackToTop from '../components/BackToTop';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { personality } = useQuizStore();
  const [showDimensions, setShowDimensions] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!personality) {
      // Delay redirect to avoid flash if store is still hydrating
      const t = setTimeout(() => navigate('/', { replace: true }), 500);
      return () => clearTimeout(t);
    }
  }, [personality, navigate]);

  if (!personality) {
    // Show spinner while waiting — prevents blank background
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-[13px] text-[#8a7a6a]">正在加载结果...</p>
      </div>
    );
  }

  const { code, faction, typeName, dimensions } = personality;
  const factionColor = FACTION_CONTENT[faction]?.color ?? '#d4a04a';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24">
      <Celebration />

      {/* ① Faction Banner */}
      <FactionBanner faction={faction} typeName={typeName} />

      <div className="px-6">
        {/* ② Faction Profile — collapsible */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="-mt-4 relative z-10"
        >
          <FactionProfileCard faction={faction} typeName={typeName} />
        </motion.div>

        {/* ③ Merged: DNA Code + Identity Summary */}
        <ResultSummary code={code} faction={faction} typeName={typeName} borderline={personality.borderline} balanced={personality.balanced} />

        {/* ④ Character Illustration */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <CharacterIllustration personality={personality} />
        </motion.div>

        {/* ⑤ Share Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <ShareCard code={code} faction={faction} typeName={typeName} />
        </motion.div>

        {/* ⑥ Collapsible Full Report */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="mt-8"
        >
          {/* Section label + expand button */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: hexToRgba(factionColor, 0.2) }} />
            <span className="text-[11px] text-[#8a7a6a] uppercase tracking-widest flex-shrink-0">完整报告</span>
            <div className="flex-1 h-px" style={{ backgroundColor: hexToRgba(factionColor, 0.2) }} />
          </div>

          {!showReport ? (
            <button
              onClick={() => setShowReport(true)}
              className="w-full py-3 rounded-btn font-semibold text-sm transition-all duration-150
                         active:scale-[0.97] hover:opacity-90"
              style={{
                backgroundColor: hexToRgba(factionColor, 0.12),
                color: factionColor,
                border: `1px solid ${hexToRgba(factionColor, 0.25)}`,
              }}
            >
              展开完整人格报告 →
            </button>
          ) : (
            <>
              <TypeProfile personality={personality} />
              <button
                onClick={() => setShowReport(false)}
                className="w-full mt-4 py-2 text-[12px] text-[#8a7a6a] hover:opacity-70 transition-opacity"
              >
                收起报告 ↑
              </button>
            </>
          )}
        </motion.div>

        {/* ⑦ Collapsible Dimension Readouts */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          {/* Section label + expand button */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ backgroundColor: hexToRgba(factionColor, 0.2) }} />
            <span className="text-[11px] text-[#8a7a6a] uppercase tracking-widest flex-shrink-0">深度解读</span>
            <div className="flex-1 h-px" style={{ backgroundColor: hexToRgba(factionColor, 0.2) }} />
          </div>

          {!showDimensions ? (
            <button
              onClick={() => setShowDimensions(true)}
              className="w-full py-3 rounded-btn font-semibold text-sm transition-all duration-150
                         active:scale-[0.97] hover:opacity-90"
              style={{
                backgroundColor: hexToRgba(factionColor, 0.12),
                color: factionColor,
                border: `1px solid ${hexToRgba(factionColor, 0.25)}`,
              }}
            >
              展开四维深度解读 →
            </button>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 pt-2 pb-2">
                  <DimensionReadout dimension="SC" pValue={dimensions.P_SC} factionColor={factionColor} />
                  <DimensionReadout dimension="IG" pValue={dimensions.P_IG} factionColor={factionColor} />
                  <DimensionReadout dimension="FV" pValue={dimensions.P_FV} factionColor={factionColor} />
                  <DimensionReadout dimension="EO" pValue={dimensions.P_EO} factionColor={factionColor} />
                </div>
                <button
                  onClick={() => setShowDimensions(false)}
                  className="w-full mt-2 py-2 text-[12px] text-[#8a7a6a] hover:opacity-70 transition-opacity"
                >
                  收起解读 ↑
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <StickyActions />
      <BackToTop />
    </motion.div>
  );
}
