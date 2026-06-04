import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuizStore } from '../store/quizStore';

export default function StickyActions() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const { personality } = useQuizStore.getState();
    if (!personality) return;
    const text = `我的财务DNA是 ${personality.code}（${personality.typeName}） 来测测你的：`;

    if (navigator.share) {
      await navigator.share({ title: '我的财务DNA代码', text, url: window.location.origin });
    } else {
      await navigator.clipboard.writeText(text + ' ' + window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
    >
      <div className="mx-auto max-w-[480px] px-4 pb-4">
        <div className="bg-white/90 backdrop-blur-md border border-[#f0ebe4] rounded-card shadow-lg p-3 flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-primary text-[#2c2c2c] font-semibold text-sm py-3 rounded-btn
                       active:scale-[0.97] transition-all duration-150
                       hover:bg-primary/90 hover:shadow-md"
          >
            {copied ? '已复制！' : '分享我的DNA'}
          </button>
          <button
            onClick={() => {
              useQuizStore.getState().reset();
              navigate('/quiz');
            }}
            className="flex-1 bg-[#f6f1eb] text-[#6b6258] font-semibold text-sm py-3 rounded-btn
                       active:scale-[0.97] transition-all duration-150
                       hover:bg-[#ede4d6]"
          >
            重新测试
          </button>
        </div>
      </div>
    </motion.div>
  );
}
