import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionJSON, Answer, PersonalityResult } from '@fj/engine-core';

interface QuizState {
  questions: QuestionJSON[];
  currentIndex: number;
  answers: Record<number, Answer>;
  isComplete: boolean;
  personality: PersonalityResult | null;
  isCalculating: boolean;

  setQuestions: (questions: QuestionJSON[]) => void;
  submitAnswer: (index: number, answer: Answer) => void;
  nextQuestion: () => void;
  setResult: (personality: PersonalityResult) => void;
  setIsCalculating: (val: boolean) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      questions: [],
      currentIndex: 0,
      answers: {},
      isComplete: false,
      personality: null,
      isCalculating: false,

      setQuestions: (questions) =>
        set({ questions, currentIndex: 0, answers: {}, isComplete: false }),

      submitAnswer: (index, answer) =>
        set((state) => ({
          answers: { ...state.answers, [index]: answer },
          isComplete:
            Object.keys({ ...state.answers, [index]: answer }).length ===
            state.questions.length,
        })),

      nextQuestion: () =>
        set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
        })),

      setResult: (personality) => set({ personality }),
      setIsCalculating: (val) => set({ isCalculating: val }),

      reset: () =>
        set({
          questions: [],
          currentIndex: 0,
          answers: {},
          isComplete: false,
          personality: null,
          isCalculating: false,
        }),
    }),
    {
      name: 'fj-quiz',
      partialize: (state) => ({
        questions: state.questions,
        currentIndex: state.currentIndex,
        answers: state.answers,
        isComplete: state.isComplete,
        personality: state.personality,
      }),
    }
  )
);
