import { describe, it, expect } from 'vitest';
import { calculatePersonality } from './scoring';
import type { QuestionJSON } from './types';

// Helper: generate n answers all of same choice
function makeAnswers(n: number, choice: string): string[] {
  return Array(n).fill(choice);
}

// 40 mock questions: 10 per dimension
function makeMockQuestions(): QuestionJSON[] {
  const dims: Array<'SC' | 'IG' | 'FV' | 'EO'> = ['SC', 'IG', 'FV', 'EO'];
  const qs: QuestionJSON[] = [];
  for (const dim of dims) {
    for (let i = 1; i <= 10; i++) {
      qs.push({
        id: `${dim}-${i}`,
        type: dim,
        text: `${dim} question ${i}`,
        options: [
          { label: 'A', text: 'Strong forward' },
          { label: 'B', text: 'Weak forward' },
          { label: 'C', text: 'Weak reverse' },
          { label: 'D', text: 'Strong reverse' },
        ],
      });
    }
  }
  return qs;
}

describe('calculatePersonality', () => {
  const questions = makeMockQuestions();

  it('returns extreme S-I-F-E for all A answers', () => {
    const answers = makeAnswers(40, 'A');
    const result = calculatePersonality(answers, questions);
    expect(result.code).toBe('S-I-F-E');
    expect(result.faction).toBe('FE 拓荒者流派');
    expect(result.typeName).toBe('远航-拓荒者');
    expect(result.dimensions.P_SC).toBeGreaterThan(90);
    expect(result.dimensions.P_IG).toBeGreaterThan(90);
    expect(result.dimensions.P_FV).toBeGreaterThan(90);
    expect(result.dimensions.P_EO).toBeGreaterThan(90);
  });

  it('returns extreme C-G-V-O for all D answers', () => {
    const answers = makeAnswers(40, 'D');
    const result = calculatePersonality(answers, questions);
    expect(result.code).toBe('C-G-V-O');
    expect(result.faction).toBe('VO 守夜人流派');
    expect(result.typeName).toBe('织光-守夜人');
    expect(result.dimensions.P_SC).toBeLessThan(10);
    expect(result.dimensions.P_IG).toBeLessThan(10);
    expect(result.dimensions.P_FV).toBeLessThan(10);
    expect(result.dimensions.P_EO).toBeLessThan(10);
  });

  it('returns ~50 P for perfectly mixed answers (5A + 5D per dim)', () => {
    const answers: string[] = [];
    for (let d = 0; d < 4; d++) {
      for (let i = 0; i < 5; i++) answers.push('A');
      for (let i = 0; i < 5; i++) answers.push('D');
    }
    const result = calculatePersonality(answers, questions);
    expect(result.dimensions.P_SC).toBe(50);
    expect(result.dimensions.P_FV).toBe(50);
    // Balanced => code contains "/"
    expect(result.code).toContain('/');
  });

  it('handles mild forward (6A+2B+2D = P~78)', () => {
    // 6A(+12) + 2B(+2) = +14 forward; 2D(+4) = +4 reverse
    // total=18, P = 50 + (14-4)/18*50 = 50 + 10/18*50 = 50 + 27.8 ≈ 78
    const answers: string[] = [];
    for (let d = 0; d < 4; d++) {
      for (let i = 0; i < 6; i++) answers.push('A');
      answers.push('B'); answers.push('B');
      answers.push('D'); answers.push('D');
    }
    const result = calculatePersonality(answers, questions);
    expect(result.dimensions.P_SC).toBe(78);
    expect(result.code).toBe('S-I-F-E'); // all > 60, no ̃
  });
});
