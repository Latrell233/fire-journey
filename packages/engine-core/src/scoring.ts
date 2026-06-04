import type { QuestionJSON, PersonalityResult, Faction, Dimension } from './types';

// A=+2 (strong forward), B=+1 (weak forward), C=+1 (weak reverse), D=+2 (strong reverse)
const SCORE_MAP: Record<string, number> = { A: 2, B: 1, C: 1, D: 2 };
const FORWARD = new Set(['A', 'B']);

function computeP(forwardSum: number, reverseSum: number): number {
  const total = forwardSum + reverseSum;
  if (total === 0) return 50;
  return Math.round(Math.max(0, Math.min(100, 50 + ((forwardSum - reverseSum) / total) * 50)));
}

function codeForDim(p: number, fwd: string, rev: string): string {
  if (p > 60) return fwd;
  if (p === 50) return `${fwd}/${rev}`;
  if (p >= 50 && p < 60) return fwd;
  if (p > 40 && p < 50) return rev;
  return rev;
}

function getFaction(pFV: number, pEO: number, pSC: number, pIG: number): Faction {
  const fv = pFV === 50 ? (pSC > 50 ? 'F' : 'V') : pFV >= 50 ? 'F' : 'V';
  const eo = pEO === 50 ? (pIG > 50 ? 'E' : 'O') : pEO >= 50 ? 'E' : 'O';
  if (fv === 'F' && eo === 'E') return 'FE 拓荒者流派';
  if (fv === 'F' && eo === 'O') return 'FO 离岸者流派';
  if (fv === 'V' && eo === 'E') return 'VE 征服者流派';
  return 'VO 守夜人流派';
}

const TYPE_NAMES: Record<string, Record<string, Record<string, string>>> = {
  FE: {
    I: { S: '远航-拓荒者', C: '烈焰-拓荒者' },
    G: { S: '筑城-拓荒者', C: '逍遥-拓荒者' },
  },
  FO: {
    I: { S: '蓄海-离岸者', C: '巡游-离岸者' },
    G: { S: '锚泊-离岸者', C: '栖枝-离岸者' },
  },
  VE: {
    I: { S: '铸碑-征服者', C: '烈焰-征服者' },
    G: { S: '磐石-征服者', C: '聚光-征服者' },
  },
  VO: {
    I: { S: '铸垒-守夜人', C: '破局-守夜人' },
    G: { S: '沉锚-守夜人', C: '织光-守夜人' },
  },
};

export function calculatePersonality(
  answers: string[],
  questions: QuestionJSON[]
): PersonalityResult {
  // Accumulate per dimension
  const fwd: Record<string, number> = { SC: 0, IG: 0, FV: 0, EO: 0 };
  const rev: Record<string, number> = { SC: 0, IG: 0, FV: 0, EO: 0 };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const ans = answers[i];
    if (!ans || !q.type) continue;
    const score = SCORE_MAP[ans] ?? 0;
    if (FORWARD.has(ans)) {
      fwd[q.type] += score;
    } else {
      rev[q.type] += score;
    }
  }

  const P_SC = computeP(fwd.SC, rev.SC);
  const P_IG = computeP(fwd.IG, rev.IG);
  const P_FV = computeP(fwd.FV, rev.FV);
  const P_EO = computeP(fwd.EO, rev.EO);

  const code = [
    codeForDim(P_SC, 'S', 'C'),
    codeForDim(P_IG, 'I', 'G'),
    codeForDim(P_FV, 'F', 'V'),
    codeForDim(P_EO, 'E', 'O'),
  ].join('-');

  const faction = getFaction(P_FV, P_EO, P_SC, P_IG);
  const factionKey = faction.slice(0, 2);
  const scKey = P_SC >= 50 ? 'S' : 'C';
  const igKey = P_IG >= 50 ? 'I' : 'G';
  const typeName = TYPE_NAMES[factionKey]?.[igKey]?.[scKey] ?? '';

  // Detect borderline (50-60 or 40-50) and balanced (exactly 50) dimensions
  const borderline: Dimension[] = [];
  const balanced: Dimension[] = [];
  const dims: [Dimension, number][] = [['SC', P_SC], ['IG', P_IG], ['FV', P_FV], ['EO', P_EO]];
  for (const [dim, p] of dims) {
    if (p === 50) balanced.push(dim);
    else if (p > 40 && p < 60) borderline.push(dim);
  }

  return {
    code,
    faction,
    typeName,
    dimensions: { P_SC, P_IG, P_FV, P_EO },
    borderline,
    balanced,
  };
}
