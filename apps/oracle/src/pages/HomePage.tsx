import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* CSS-only geometric background: radial gradient + repeating pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,160,74,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(122,156,168,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 20% 60%, rgba(107,122,92,0.04) 0%, transparent 70%)
          `,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #2c2c2c 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm relative z-10"
      >
        {/* Brand mark — CSS-only DNA-like double helix abstract */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="w-20 h-20 mx-auto rounded-[24px] bg-gradient-to-br from-[#d4a04a]/20 to-[#d4a04a]/5 border border-[#d4a04a]/20 flex items-center justify-center relative">
            {/* Abstract helix rings */}
            <div className="absolute inset-2 rounded-full border border-[#d4a04a]/15" />
            <div className="absolute inset-5 rounded-full border border-[#d4a04a]/20" />
            <span className="text-3xl relative z-10">⚡</span>
          </div>
        </motion.div>

        {/* Headline stack */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <h1 className="text-[30px] font-bold text-[#2c2c2c] mb-2 leading-tight tracking-tight">
            财务基因解码
          </h1>
          <p className="text-[#8a7a6a] text-[13px] tracking-widest uppercase mb-6">
            Wealth DNA
          </p>
        </motion.div>

        {/* Taglines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10 space-y-2"
        >
          <p className="text-[15px] text-[#6b6258] leading-relaxed">
            看穿你的金钱潜意识
          </p>
          <p className="text-[15px] text-[#6b6258] leading-relaxed">
            探索你的财富自由之旅
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <motion.button
            onClick={() => navigate('/quiz')}
            animate={{ boxShadow: ['0 1px 3px rgba(0,0,0,0.08)', '0 4px 14px rgba(212,160,74,0.25)', '0 1px 3px rgba(0,0,0,0.08)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full bg-primary text-[#2c2c2c] font-bold text-[15px] py-4 rounded-btn
                       active:scale-[0.97] transition-transform duration-150
                       shadow-sm hover:shadow-md"
          >
            破译我的搞钱 DNA
          </motion.button>

          <p className="text-[#8a7a6a] text-[11px] mt-4">
            28 道情景迫选题 · 约 4 分钟 · 全程无需注册
          </p>
        </motion.div>

        {/* Social proof hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[11px] text-[#8a7a6a]/60 mt-8"
        >
          已有超过 10,000 人破译了自己的财务 DNA
        </motion.p>
      </motion.div>
    </div>
  );
}
