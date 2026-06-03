import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2c2c2c] via-[#3a3028] to-[#4a4035] text-white px-6 pt-16 pb-14 text-center">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #c8a882 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-[11px] tracking-[0.25em] text-primary uppercase mb-4 font-medium">
          The FIRE Journey
        </p>
        <h1 className="text-[32px] font-bold leading-tight mb-3">
          财富自由之旅
        </h1>
        <p className="text-sm text-[#d4c8b8] leading-relaxed max-w-[280px] mx-auto">
          从财务认知觉醒，到人生沙盘推演，<br />最终掌控真实资产
        </p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-[#f9f6f0]" />
    </section>
  );
}
