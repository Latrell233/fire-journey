import { motion } from 'framer-motion';

interface Props {
  code: string;
}

export default function CodeDisplay({ code }: Props) {
  const letters = code.split('-');

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {letters.map((letter, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: i * 0.12,
          }}
          className="w-14 h-14 bg-[#f6f1eb] border-2 border-primary rounded-btn flex items-center justify-center"
        >
          <span className="font-mono text-[18px] font-bold text-primary">{letter}</span>
        </motion.div>
      ))}
    </div>
  );
}
