import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { calculatePersonality } from '@fj/engine-core';
import type { Answer, QuestionJSON } from '@fj/engine-core';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import DnaReveal from '../components/DnaReveal';
import questionsData from '../data/questions.json';

function shuffleQuestions(qs: QuestionJSON[]): QuestionJSON[] {
  const byType: Record<string, QuestionJSON[]> = {};
  for (const q of qs) {
    (byType[q.type] ??= []).push(q);
  }

  for (const type of ['SC', 'IG', 'FV', 'EO']) {
    const group = byType[type] ?? [];
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  }

  const groups = [
    byType.SC ?? [], byType.IG ?? [],
    byType.FV ?? [], byType.EO ?? [],
  ];
  const result: QuestionJSON[] = [];
  const maxLen = Math.max(...groups.map(g => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const group of groups) {
      if (i < group.length) result.push(group[i]);
    }
  }
  return result;
}

const TRANSITION_MS = 180;

export default function QuizPage() {
  const navigate = useNavigate();
  const [isFinishing, setIsFinishing] = useState(false);
  const {
    questions, currentIndex, answers, isComplete, isCalculating,
    setQuestions, submitAnswer, nextQuestion, setResult, setIsCalculating,
  } = useQuizStore();

  useEffect(() => {
    // Only init fresh quiz if not resuming from persisted state
    if (questions.length === 0) {
      setQuestions(shuffleQuestions(questionsData as QuestionJSON[]));
    }
  }, []);

  // Prevent body scroll during quiz
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Beforeunload warning
  useEffect(() => {
    if (questions.length === 0 || isComplete) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [questions.length, isComplete]);

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (answers[currentIndex] !== undefined) return;
      submitAnswer(currentIndex, answer);
      setTimeout(() => nextQuestion(), TRANSITION_MS);
    },
    [currentIndex, answers, submitAnswer, nextQuestion]
  );

  // Keyboard shortcuts (1-4 or A-D)
  useEffect(() => {
    const KEY_MAP: Record<string, Answer> = {
      '1': 'A', '2': 'B', '3': 'C', '4': 'D',
      'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D',
    };
    const handler = (e: KeyboardEvent) => {
      if (isComplete || isCalculating || questions.length === 0) return;
      const answer = KEY_MAP[e.key.toLowerCase()];
      if (answer && answers[currentIndex] === undefined) {
        handleAnswer(answer);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, answers, isComplete, isCalculating, questions.length, handleAnswer]);

  useEffect(() => {
    if (!isComplete || questions.length === 0) return;

    // Guard: if we already have a result (back-button re-entry from result page),
    // skip the DnaReveal animation and go straight to result
    if (useQuizStore.getState().personality) {
      navigate('/result', { replace: true });
      return;
    }

    // Stage 1: DnaReveal animation (250ms delay)
    const t1 = setTimeout(() => setIsCalculating(true), 250);

    // Stage 2: calculate result (1450ms after completion)
    let t3 = 0;
    const t2 = setTimeout(() => {
      const answerValues = questions.map((_, i) => answers[i] ?? 'B');
      setResult(calculatePersonality(answerValues, questions));

      // Stage 3: switch to finishing overlay → navigate
      // Inner setTimeout survives StrictMode double-mount cleanup
      t3 = window.setTimeout(() => {
        setIsCalculating(false);
        setIsFinishing(true);
        // Brief delay so the overlay renders before AnimatePresence exit
        setTimeout(() => navigate('/result'), 80);
      }, 500);
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [isComplete]);

  // Route guard: no questions → show loading
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-[13px] text-[#8a7a6a]">正在准备题目...</p>
      </div>
    );
  }

  if (isCalculating) return <DnaReveal />;

  // Transition overlay — replaces quiz UI flash with a clean static page
  // so AnimatePresence mode="wait" can exit smoothly
  if (isFinishing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #faf8f4 0%, #f5f0e8 40%, #faf8f4 100%)',
        }}
      >
        <p className="text-[15px] text-[#6b6258] font-medium">报告已生成</p>
      </div>
    );
  }

  const isLocked = answers[currentIndex] !== undefined;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(180deg, #faf8f4 0%, #f5f0e8 40%, #faf8f4 100%)`,
      }}
    >
      <div className="px-6 pt-6 pb-2">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>
      <QuestionCard
        question={questions[currentIndex]}
        selectedAnswer={answers[currentIndex]}
        isLocked={isLocked}
        onSelect={handleAnswer}
      />
    </div>
  );
}
