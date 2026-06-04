import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionJSON, Answer } from '@fj/engine-core';

interface Props {
  question: QuestionJSON;
  selectedAnswer?: Answer;
  isLocked: boolean;
  onSelect: (answer: Answer) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export default function QuestionCard({ question, selectedAnswer, isLocked, onSelect }: Props) {
  return (
    <div className="flex-1 flex flex-col px-6 pb-6" role="radiogroup" aria-label="选项">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          {/* Question text — generous min-height reserves consistent space */}
          <div className="min-h-[140px] pt-6 flex items-start">
            <h2 className="text-[24px] font-bold text-[#2c2c2c] leading-tight">
              {question.text}
            </h2>
          </div>

          {/* Options — mt-auto pins them to the bottom, position never moves */}
          <div className="mt-auto flex flex-col gap-3">
            {question.options.map((opt, i) => {
              const label = OPTION_LABELS[i];
              const isSelected = selectedAnswer === label;

              return (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onClick={() => !isLocked && onSelect(label)}
                  disabled={isLocked && !isSelected}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`选项 ${label}: ${opt.text}`}
                  className={`w-full text-left p-4 rounded-btn border-2 transition-all duration-150
                    ${isSelected
                      ? 'border-primary bg-[#f6f1eb] text-[#2c2c2c] scale-[1.01]'
                      : isLocked
                        ? 'border-[#f0ebe4] bg-white text-[#6b6258]/40 cursor-default'
                        : 'border-[#f0ebe4] bg-white text-[#6b6258] hover:border-primary/30 hover:bg-[#faf8f4] active:scale-[0.98]'
                    }`}
                >
                  <span className="text-[11px] font-semibold text-primary mr-2">{label}.</span>
                  {opt.text}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
