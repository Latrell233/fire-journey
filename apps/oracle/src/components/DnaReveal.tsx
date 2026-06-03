import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MESSAGES = [
  '正在解码你的财务基因...',
  '分析资源分配模式...',
  '测算风险耐受阈值...',
  '识别深层财富动机...',
  '生成专属 DNA 报告...',
];

export default function DnaReveal() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Animated helix-like rings */}
      <div className="relative w-24 h-24 mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-primary/30"
        />
        <motion.div
          animate={{ rotate: -360, scale: [0.85, 0.95, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-2 rounded-full border-2 border-primary/50"
        />
        <motion.div
          animate={{ rotate: 360, scale: [0.7, 0.8, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-4 rounded-full border-2 border-primary/70"
        />
        {/* Center dot */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-3 h-3 bg-primary rounded-full" />
        </motion.div>
      </div>

      {/* Message cycle */}
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        className="text-[15px] text-[#6b6258] font-medium"
      >
        {MESSAGES[msgIndex]}
      </motion.p>

      {/* Subtle progress dots */}
      <div className="flex gap-2 mt-8">
        {MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === msgIndex ? 1.3 : 0.7,
              opacity: i === msgIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
}
