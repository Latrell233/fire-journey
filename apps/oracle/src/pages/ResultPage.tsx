import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../store/quizStore';
import FactionBanner from '../components/FactionBanner';
import FactionProfileCard from '../components/FactionProfileCard';
import CodeDisplay from '../components/CodeDisplay';
import CharacterIllustration from '../components/CharacterIllustration';
import DimensionReadout from '../components/DimensionReadout';
import TypeProfile from '../components/TypeProfile';
import ShareCard from '../components/ShareCard';
import ResultSummary from '../components/ResultSummary';
import Celebration from '../components/Celebration';
import StickyActions from '../components/StickyActions';
import BackToTop from '../components/BackToTop';

export default function ResultPage() {
  const navigate = useNavigate();
  const { personality } = useQuizStore();
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    if (!personality) navigate('/', { replace: true });
  }, [personality, navigate]);

  if (!personality) return null;

  const { code, faction, typeName, dimensions } = personality;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-24">
      {/* Confetti burst on first visit */}
      <Celebration />

      {/* ① Faction Banner */}
      <FactionBanner faction={faction} typeName={typeName} />

      <div className="px-6">
        {/* ② Faction Profile — what this faction means */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="-mt-4 relative z-10"
        >
          <FactionProfileCard faction={faction} typeName={typeName} />
        </motion.div>

        {/* ③ DNA Code Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 bg-white rounded-card shadow-sm px-4 py-3 border border-[#f0ebe4]"
        >
          <p className="text-[11px] text-[#8a7a6a] text-center mb-2">你的财务DNA代码</p>
          <CodeDisplay code={code} />
        </motion.div>

        {/* ④ Character Illustration */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <CharacterIllustration personality={personality} />
        </motion.div>

        {/* ⑤ Share Card — visible without scrolling */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <ShareCard code={code} faction={faction} typeName={typeName} />
        </motion.div>

        {/* ⑥ Result Summary — one-liner identity */}
        <ResultSummary code={code} faction={faction} typeName={typeName} />

        {/* ⑦ Type Profile (full report) */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <TypeProfile personality={personality} />
        </motion.div>

        {/* ⑧ Collapsible Dimension Readouts */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.15 }}
          className="mt-8"
        >
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className="w-full flex items-center justify-between py-2 hover:opacity-70 transition-opacity duration-150"
          >
            <h2 className="text-[18px] font-bold text-[#2c2c2c]">四维深度解读</h2>
            <span
              className="text-[#8a7a6a] text-lg transition-transform duration-200"
              style={{ transform: showDimensions ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          </button>

          <AnimatePresence>
            {showDimensions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 pt-4">
                  <DimensionReadout dimension="SC" pValue={dimensions.P_SC} />
                  <DimensionReadout dimension="IG" pValue={dimensions.P_IG} />
                  <DimensionReadout dimension="FV" pValue={dimensions.P_FV} />
                  <DimensionReadout dimension="EO" pValue={dimensions.P_EO} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* ⑨ Sticky bottom actions */}
      <StickyActions />

      {/* ⑩ Back to top (appears on scroll) */}
      <BackToTop />
    </motion.div>
  );
}
