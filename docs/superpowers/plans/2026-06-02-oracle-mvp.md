# Oracle (Wealth DNA) MVP Implementation Plan (v2 · Simplified)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Oracle MVP — a 40-question H5 quiz (SC/IG/FV/EO × 10 each) with Duolingo-style UX that calculates a 4-digit financial personality code and displays a rich results page.

**Architecture:** Monorepo with two shared packages (`engine-core`, `design-tokens`) and the Oracle app. Oracle is client-side only — questions load from local JSON, answers are scored in-browser via engine-core, results rendered from pre-written content. No backend, no parameter calculations.

**Tech Stack:** pnpm Workspaces, Turborepo, TypeScript, React 18, Vite, Tailwind CSS, Zustand, React Router v6, Framer Motion

**Spec Reference:** `跨产品共享基础设计文档.md` v1.1 (project root)

---

## File Structure Map

```
fire-journey/
├── pnpm-workspace.yaml          [NEW]
├── turbo.json                   [NEW]
├── package.json                 [NEW]
├── .gitignore                   [NEW]
├── tsconfig.base.json           [NEW]
├── packages/
│   ├── engine-core/
│   │   ├── package.json         [NEW]
│   │   ├── tsconfig.json        [NEW]
│   │   └── src/
│   │       ├── index.ts         [NEW] barrel
│   │       ├── types.ts         [NEW] Answer, QuestionJSON, PersonalityResult, Faction
│   │       ├── scoring.ts       [NEW] calculatePersonality()
│   │       └── scoring.test.ts  [NEW] unit tests
│   └── design-tokens/
│       ├── package.json         [NEW]
│       └── src/
│           ├── colors.css       [NEW]
│           ├── typography.css   [NEW]
│           ├── spacing.css      [NEW]
│           ├── animations.css   [NEW]
│           └── tokens.ts        [NEW]
├── apps/
│   └── oracle/
│       ├── package.json         [NEW]
│       ├── vite.config.ts       [NEW]
│       ├── tsconfig.json        [NEW]
│       ├── tailwind.config.ts   [NEW]
│       ├── postcss.config.js    [NEW]
│       ├── index.html           [NEW]
│       └── src/
│           ├── main.tsx         [NEW]
│           ├── App.tsx          [NEW]
│           ├── index.css        [NEW]
│           ├── data/
│           │   ├── questions.json  [EXISTS] 40 questions at wealth-dna/questions.json
│           │   └── factions.ts     [NEW] faction content + dimension interpretations
│           ├── store/
│           │   └── quizStore.ts    [NEW] Zustand
│           ├── pages/
│           │   ├── HomePage.tsx    [NEW]
│           │   ├── QuizPage.tsx    [NEW]
│           │   └── ResultPage.tsx  [NEW]
│           └── components/
│               ├── ProgressBar.tsx       [NEW]
│               ├── QuestionCard.tsx      [NEW]
│               ├── DnaReveal.tsx         [NEW]
│               ├── FactionBanner.tsx        [NEW]
│               ├── CodeDisplay.tsx          [NEW]
│               ├── CharacterIllustration.tsx [NEW]
│               ├── DimensionReadout.tsx     [NEW]
│               ├── TypeProfile.tsx          [NEW]
│               └── ShareCard.tsx            [NEW]
```

---

## Phase 0: Monorepo Scaffolding

### Task 0.1: Root workspace and config

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "fire-journey",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {}
  }
}
```

- [ ] **Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.turbo/
.superpowers/
*.local
.env
```

- [ ] **Step 6: Initialize**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey
pnpm install
```

Expected: completes without errors.

---

## Phase 1: engine-core

### Task 1.1: Package setup + types

- [ ] **Step 1: Create packages/engine-core/package.json**

```json
{
  "name": "@fj/engine-core",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create packages/engine-core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src"]
}
```

- [ ] **Step 3: Create packages/engine-core/src/types.ts**

```typescript
export type Answer = 'A' | 'B' | 'C' | 'D';

export type Dimension = 'SC' | 'IG' | 'FV' | 'EO';

export type Faction =
  | 'FE 拓荒者流派'
  | 'FO 离岸者流派'
  | 'VE 征服者流派'
  | 'VO 守夜人流派';

export interface QuestionJSON {
  id: string;
  type: Dimension;
  text: string;
  options: {
    label: Answer;
    text: string;
  }[];
}

export interface PersonalityResult {
  code: string;              // "S-I-F-E" (may contain ̃ or /)
  faction: Faction;
  typeName: string;          // "远航-拓荒者"
  dimensions: {
    P_SC: number;            // 0–100
    P_IG: number;
    P_FV: number;
    P_EO: number;
  };
}
```

### Task 1.2: Scoring algorithm + tests

- [ ] **Step 1: Create packages/engine-core/src/scoring.test.ts**

```typescript
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

  it('handles mild forward (6A+2B+2D = P~62.5)', () => {
    // 6A(+12) + 2B(+2) = +14 forward; 2D(+4) = +4 reverse
    // total=18, P = 50 + (14-4)/18*50 ≈ 77.8
    // Actually with 10 questions per dim, formula: 
    // forward = 6*2 + 2*1 = 14, reverse = 2*2 = 4, total = 18
    // P = 50 + (14-4)/18*50 = 50 + 10/18*50 = 50 + 27.8 = 77.8
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/engine-core && pnpm test -- --run
```

Expected: FAIL — `calculatePersonality` not found.

- [ ] **Step 3: Implement packages/engine-core/src/scoring.ts**

```typescript
import type { QuestionJSON, PersonalityResult, Faction } from './types';

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
  if (p >= 50 && p < 60) return `${fwd}̃`;
  if (p === 50) return `${fwd}/${rev}`;
  if (p > 40 && p < 50) return `${rev}̃`;
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

  return {
    code,
    faction,
    typeName,
    dimensions: { P_SC, P_IG, P_FV, P_EO },
  };
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/engine-core && pnpm test -- --run
```

Expected: All tests PASS.

### Task 1.3: Barrel export

- [ ] **Step 1: Create packages/engine-core/src/index.ts**

```typescript
export { calculatePersonality } from './scoring';
export type { Answer, Dimension, Faction, QuestionJSON, PersonalityResult } from './types';
```

- [ ] **Step 2: Verify**

```bash
cd packages/engine-core && pnpm lint && pnpm test -- --run
```

Expected: No errors.

---

## Phase 2: design-tokens

### Task 2.1: CSS tokens + TS mirror

- [ ] **Step 1: Create packages/design-tokens/package.json**

```json
{
  "name": "@fj/design-tokens",
  "version": "0.0.1",
  "private": true,
  "main": "./src/tokens.ts",
  "exports": {
    "./colors.css": "./src/colors.css",
    "./typography.css": "./src/typography.css",
    "./spacing.css": "./src/spacing.css",
    "./animations.css": "./src/animations.css",
    ".": "./src/tokens.ts"
  }
}
```

- [ ] **Step 2: Create colors.css**

```css
:root {
  --color-primary: #c8a882;
  --color-primary-hover: #b8976e;
  --color-primary-light: #f6f1eb;
  --color-surface: #f9f6f0;
  --color-card: #ffffff;
  --color-muted: #f0ebe4;
  --color-text: #2c2c2c;
  --color-text-secondary: #6b6258;
  --color-text-caption: #8a7a6a;
  --color-positive: #b95757;
  --color-negative: #8b9c7e;
  --color-danger: #c27b6b;
  --color-faction-fe: #d4a04a;
  --color-faction-fo: #7a9ca8;
  --color-faction-ve: #8b5a4a;
  --color-faction-vo: #6b7a5c;
  --color-faction-fe-light: #faf5e8;
  --color-faction-fo-light: #f0f5f6;
  --color-faction-ve-light: #f8f2ef;
  --color-faction-vo-light: #f2f4f0;
}

:root[lang="en"], :root[data-locale="en"] {
  --color-positive: #8b9c7e;
  --color-negative: #b95757;
}
```

- [ ] **Step 3: Create typography.css**

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
  --text-display: 32px; --text-h1: 24px; --text-h2: 18px;
  --text-body: 16px; --text-label: 14px; --text-caption: 13px; --text-micro: 11px;
  --leading-tight: 1.3; --leading-normal: 1.5; --leading-relaxed: 1.7;
  --weight-bold: 700; --weight-semibold: 600; --weight-medium: 500; --weight-regular: 400;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
  background-color: var(--color-surface);
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 4: Create spacing.css**

```css
:root {
  --space-xs: 4px; --space-sm: 8px; --space-md: 12px;
  --space-lg: 16px; --space-xl: 24px; --space-2xl: 32px; --space-3xl: 48px;
}
```

- [ ] **Step 5: Create animations.css**

```css
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-fade-up: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --duration-fast: 150ms; --duration-normal: 300ms; --duration-slow: 2000ms;
  --stagger-delay: 50ms;
}
```

- [ ] **Step 6: Create tokens.ts**

```typescript
export const colors = {
  primary: '#c8a882', primaryHover: '#b8976e', primaryLight: '#f6f1eb',
  surface: '#f9f6f0', card: '#ffffff', muted: '#f0ebe4',
  text: '#2c2c2c', textSecondary: '#6b6258', textCaption: '#8a7a6a',
  positive: '#b95757', negative: '#8b9c7e', danger: '#c27b6b',
  faction: { fe: '#d4a04a', fo: '#7a9ca8', ve: '#8b5a4a', vo: '#6b7a5c' },
} as const;

export const spacing = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px',
  xl: '24px', '2xl': '32px', '3xl': '48px',
} as const;

export const radius = { sm: '4px', md: '8px', lg: '12px', xl: '16px' } as const;

export const fontSize = {
  display: '32px', h1: '24px', h2: '18px',
  body: '16px', label: '14px', caption: '13px', micro: '11px',
} as const;

export const animation = {
  easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeFadeUp: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  fast: '150ms', normal: '300ms', slow: '2000ms',
} as const;
```

---

## Phase 3: Oracle App Scaffold

### Task 3.1: Vite + React + Tailwind project

- [ ] **Step 1: Create apps/oracle/package.json**

```json
{
  "name": "@fj/oracle",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@fj/engine-core": "workspace:*",
    "@fj/design-tokens": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create apps/oracle/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
});
```

- [ ] **Step 3: Create apps/oracle/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "types": ["react", "react-dom"]
  },
  "include": ["src"],
  "references": [
    { "path": "../../packages/engine-core" },
    { "path": "../../packages/design-tokens" }
  ]
}
```

- [ ] **Step 4: Create apps/oracle/tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#c8a882',
        'primary-hover': '#b8976e',
        'primary-light': '#f6f1eb',
        surface: '#f9f6f0',
        muted: '#f0ebe4',
        danger: '#c27b6b',
        positive: 'var(--color-positive)',
        negative: 'var(--color-negative)',
        faction: { fe: '#d4a04a', fo: '#7a9ca8', ve: '#8b5a4a', vo: '#6b7a5c' },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Roboto Mono"', 'monospace'],
      },
      borderRadius: { card: '16px', btn: '12px', input: '8px' },
      animation: {
        'fade-up': 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 5: Create apps/oracle/postcss.config.js**

```javascript
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 6: Create apps/oracle/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="description" content="测测你的财务DNA — 40道题解锁你的财富人格" />
    <title>Wealth DNA · 财务基因解码</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧬</text></svg>" />
  </head>
  <body class="bg-surface text-text antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create apps/oracle/src/main.tsx**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '@fj/design-tokens/colors.css';
import '@fj/design-tokens/typography.css';
import '@fj/design-tokens/spacing.css';
import '@fj/design-tokens/animations.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 8: Create apps/oracle/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { -webkit-tap-highlight-color: transparent; }
html { scroll-behavior: smooth; }
body { min-height: 100dvh; }
#root { min-height: 100dvh; }
```

- [ ] **Step 9: Create apps/oracle/src/App.tsx**

```typescript
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  );
}
```

- [ ] **Step 10: Install and verify**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey && pnpm install
cd apps/oracle && pnpm dev
```

Expected: Vite starts on port 3000. No build errors.

---

## Phase 4: Quiz Data & Store

### Task 4.1: Copy questions + create factions data

- [ ] **Step 1: Copy questions.json into the app**

The user has already transcribed 40 questions at `wealth-dna/questions.json`.

```bash
cp /Users/leiwencheng/Coding/indiedev/fire-journey/wealth-dna/questions.json \
   /Users/leiwencheng/Coding/indiedev/fire-journey/apps/oracle/src/data/questions.json
```

- [ ] **Step 2: Create apps/oracle/src/data/factions.ts**

```typescript
import type { Faction } from '@fj/engine-core';

export interface FactionContent {
  name: string;
  slogan: string;
  guide: string;
  overview: string;
  color: string;
  colorLight: string;
}

export const FACTION_CONTENT: Record<string, FactionContent> = {
  'FE 拓荒者流派': {
    name: 'FE 拓荒者流派',
    slogan: '我宁愿在风暴里航行，也不愿在港口里腐烂。',
    guide: '你不是不爱安稳，你只是更怕没活过。当别人在计算退休倒计时的时候，你正在寻找改写人生剧本的工具。',
    overview: '拓荒者相信金钱的本质是对人生剧本的改写权。你们对未被定义的可能性充满兴奋，认为真正的财富绝不来自线性的顺从，而是来自对时代势能的自主掌控。',
    color: '#d4a04a',
    colorLight: '#faf5e8',
  },
  'FO 离岸者流派': {
    name: 'FO 离岸者流派',
    slogan: '真正的自由，是不再需要向世界证明什么。',
    guide: '你看穿了消费主义的赌场和永无止境的内卷系统。你搞钱不是为了向谁证明成功，也不是为了征服世界，而是为了买一张安静的门票。',
    overview: '离岸者相信财富的终极意义不是拥有更多，而是需要更少。你们对主流成功学叙事保持天然警惕，崇尚极简主义与精神空间的完整性。',
    color: '#7a9ca8',
    colorLight: '#f0f5f6',
  },
  'VE 征服者流派': {
    name: 'VE 征服者流派',
    slogan: '世界不会奖励脆弱，只会奖励赢家。',
    guide: '人生是一场高压驱动的阶层跃迁赛。你从不掩饰自己的胜负欲与对社会化尊严的渴望。',
    overview: '征服者坚信人生的本质就是竞争与资源争夺。你们搞钱的驱动力源自深层的社会认同与家庭责任。',
    color: '#8b5a4a',
    colorLight: '#f8f2ef',
  },
  'VO 守夜人流派': {
    name: 'VO 守夜人流派',
    slogan: '真正的强大，是让风险永远进不了家门。',
    guide: '世界动荡不堪，而你是那个在风暴来临前默默加固城墙的人。',
    overview: '守夜人是天然的长期主义者，将财富视为抵御不确定性的终极城墙。你们不相信暴富神话，只相信跨越周期的稳定秩序。',
    color: '#6b7a5c',
    colorLight: '#f2f4f0',
  },
};

export const DIMENSION_LABELS: Record<string, { name: string; forward: string; reverse: string }> = {
  SC: { name: '资源分配观', forward: '蓄水型 (S)', reverse: '体验型 (C)' },
  IG: { name: '风险耐受力', forward: '进取型 (I)', reverse: '防守型 (G)' },
  FV: { name: '核心内驱力', forward: '自由自决型 (F)', reverse: '认同尊严型 (V)' },
  EO: { name: '终极价值观', forward: '奇旅激荡型 (E)', reverse: '秩序安稳型 (O)' },
};

export function getDimensionInterpretation(dimension: string, pValue: number): string {
  const interpretations: Record<string, Record<string, string>> = {
    SC: {
      strong_forward: '你是一个坚定的蓄水型。储蓄对你来说不是对物欲的压抑，而是另一种形式的消费——你从资产数字的稳步增长中获得最真实的满足与高确定性的安全感。',
      mild_forward: '你整体偏向蓄水型，但保留了一定的消费弹性。你习惯通过资产沉淀换取踏实感，但也能在特定时刻享受悦己的体验。',
      balanced: '你在蓄水和现时体验之间处于罕见的平衡状态。你的消费决策更多取决于具体的情境与实际收入。',
      mild_reverse: '你偏向现时体验型，但绝非毫无节制的月光族。你愿意为当下的生命质量买单，但内心始终保留着一根不容逾越的财务底线。',
      strong_reverse: '你是一个坚定的现时体验型。你深信钱只有被花掉、转换成亲身经历的那一刻，才真正属于你。',
    },
    IG: {
      strong_forward: '你是坚定的进取型风控人格。你拥有极高的风险耐受力，能从容直面甚至享受巨大的市场波动。',
      mild_forward: '你偏向进取型，并不排斥市场风险，但在面对单年回撤时仍会保持警惕。',
      balanced: '你在风险进取与防守之间处于罕见的中间地带，会根据牛熊周期或个人资产多寡灵活切换。',
      mild_reverse: '你偏向防守型，对账面波动保持天然的敏感与轻度损失厌恶。',
      strong_reverse: '你是坚定的防守型守护者，追求本金的绝对安全，稳字对你高于一切。',
    },
    FV: {
      strong_forward: '你是坚定的自由自决型。金钱对你而言只有两个字——"赎身金"。你搞钱的唯一目标就是买回自己的时间主权。',
      mild_forward: '你偏向自由自决型，对职场规训耐受度较低，但在现实压力下仍保留了一定的隐忍空间。',
      balanced: '你在追求绝对自由与渴望社会认同之间处于平衡状态。这是一场长期的精神拔河。',
      mild_reverse: '你偏向认同尊严型，搞钱在你眼里具有外向的社会化投射。',
      strong_reverse: '你是坚定的认同尊严型。金钱的本质是你的"责任装甲"，你所有的搞钱动力都指向赢得社会尊严与守护家人。',
    },
    EO: {
      strong_forward: '你是坚定的奇旅激荡型。你将人生视为一场高能阶的实验，对不确定性表现为兴奋而非焦虑。',
      mild_forward: '你偏向奇旅激荡型，渴望财富自由后去折腾跨界项目，但在积累充分前仍会小心评估不确定性。',
      balanced: '你在激荡与秩序之间保持着微妙的动态平衡——在职场追求刺激，但在财富终局上渴望平静。',
      mild_reverse: '你偏向秩序安稳型，财富对你的首要诱惑在于清除生命中多余的噪音。',
      strong_reverse: '你是坚定的秩序安稳型，财富自由后的理想终局是获得完全可控、内心纯粹的平静。',
    },
  };

  const key = pValue >= 60 ? 'strong_forward'
    : pValue > 50 ? 'mild_forward'
    : pValue === 50 ? 'balanced'
    : pValue > 40 ? 'mild_reverse'
    : 'strong_reverse';

  return interpretations[dimension]?.[key] ?? '';
}
```

### Task 4.2: Zustand store

- [ ] **Step 1: Create apps/oracle/src/store/quizStore.ts**

```typescript
import { create } from 'zustand';
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

export const useQuizStore = create<QuizState>((set) => ({
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
}));
```

---

## Phase 5: Quiz Pages

### Task 5.1: HomePage

- [ ] **Step 1: Create apps/oracle/src/pages/HomePage.tsx**

```typescript
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-sm"
      >
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-primary-light rounded-card flex items-center justify-center">
            <span className="text-4xl">🧬</span>
          </div>
        </div>

        <h1 className="text-[32px] font-bold text-[#2c2c2c] mb-3 leading-tight">
          财务基因解码
        </h1>
        <p className="text-[#6b6258] text-base mb-2">Wealth DNA</p>

        <p className="text-[#8a7a6a] text-[13px] mb-10 leading-relaxed">
          40 道情景迫选题，挖掘你潜意识中的财务人格。
          <br />
          获得专属四维 DNA 代码与完整的财富人格报告。
        </p>

        <button
          onClick={() => navigate('/quiz')}
          className="w-full bg-primary text-[#2c2c2c] font-semibold text-sm py-4 rounded-btn
                     active:scale-[0.97] transition-transform duration-150"
        >
          开始答题
        </button>

        <p className="text-[#8a7a6a] text-[11px] mt-4">
          约需 6 分钟 · 全程无需注册
        </p>
      </motion.div>
    </div>
  );
}
```

### Task 5.2: ProgressBar + QuestionCard

- [ ] **Step 1: Create apps/oracle/src/components/ProgressBar.tsx**

```typescript
import { motion } from 'framer-motion';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] text-[#8a7a6a]">第 {current} / {total} 题</span>
        <span className="text-[11px] text-[#8a7a6a]">{pct}%</span>
      </div>
      <div className="w-full h-1 bg-[#f0ebe4] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/oracle/src/components/QuestionCard.tsx**

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionJSON, Answer } from '@fj/engine-core';

interface Props {
  question: QuestionJSON;
  selectedAnswer?: Answer;
  onSelect: (answer: Answer) => void;
}

// Note: Stage labels intentionally omitted. Round-robin shuffling mixes all
// 4 dimensions throughout the quiz, making per-section labels meaningless.

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export default function QuestionCard({ question, selectedAnswer, onSelect }: Props) {
  return (
    <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <h2 className="text-[24px] font-bold text-[#2c2c2c] mb-8 leading-tight">
            {question.text}
          </h2>

          <div className="flex flex-col gap-3">
            {question.options.map((opt, i) => {
              const label = OPTION_LABELS[i];
              const isSelected = selectedAnswer === label;

              return (
                <motion.button
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  onClick={() => onSelect(label)}
                  className={`w-full text-left p-4 rounded-btn border-2 transition-all duration-150
                    ${isSelected
                      ? 'border-primary bg-[#f6f1eb] text-[#2c2c2c]'
                      : 'border-[#f0ebe4] bg-white text-[#6b6258] hover:border-primary/30 active:scale-[0.98]'
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
```

### Task 5.3: QuizPage + DnaReveal

- [ ] **Step 1: Create apps/oracle/src/components/DnaReveal.tsx**

```typescript
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MESSAGES = [
  '正在解码你的财务基因...',
  '分析消费倾向...',
  '测算风险耐受...',
  '识别深层动机...',
  '生成专属报告...',
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
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mb-8 rounded-full border-4 border-primary border-t-transparent"
      />
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-base text-[#6b6258]"
      >
        {MESSAGES[msgIndex]}
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/oracle/src/pages/QuizPage.tsx**

```typescript
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { calculatePersonality } from '@fj/engine-core';
import type { Answer, QuestionJSON } from '@fj/engine-core';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import DnaReveal from '../components/DnaReveal';
import questionsData from '../data/questions.json';

function shuffleQuestions(qs: QuestionJSON[]): QuestionJSON[] {
  // Group by type
  const byType: Record<string, QuestionJSON[]> = {};
  for (const q of qs) {
    (byType[q.type] ??= []).push(q);
  }

  // Fisher-Yates each group
  for (const type of ['SC', 'IG', 'FV', 'EO']) {
    const group = byType[type] ?? [];
    for (let i = group.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [group[i], group[j]] = [group[j], group[i]];
    }
  }

  // Round-robin interleave: avoid >2 consecutive same-type
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

export default function QuizPage() {
  const navigate = useNavigate();
  const {
    questions, currentIndex, answers, isComplete, isCalculating,
    setQuestions, submitAnswer, nextQuestion, setResult, setIsCalculating, reset,
  } = useQuizStore();

  useEffect(() => {
    reset();
    setQuestions(shuffleQuestions(questionsData as QuestionJSON[]));
  }, []);

  const handleAnswer = useCallback(
    (answer: Answer) => {
      if (answers[currentIndex] !== undefined) return;
      submitAnswer(currentIndex, answer);
      setTimeout(() => nextQuestion(), 300);
    },
    [currentIndex, answers, submitAnswer, nextQuestion]
  );

  useEffect(() => {
    if (!isComplete || questions.length === 0) return;
    setIsCalculating(true);

    const timer = setTimeout(() => {
      const answerValues = questions.map((_, i) => answers[i] ?? 'B');
      const personality = calculatePersonality(answerValues, questions);
      setResult(personality);

      setTimeout(() => {
        setIsCalculating(false);
        navigate('/result');
      }, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isComplete]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8a7a6a]">加载中...</p>
      </div>
    );
  }

  if (isCalculating) return <DnaReveal />;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-2">
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>
      <QuestionCard
        question={questions[currentIndex]}
        selectedAnswer={answers[currentIndex]}
        onSelect={handleAnswer}
      />
    </div>
  );
}
```

---

## Phase 6: Results Page

### Task 6.1: FactionBanner + CodeDisplay

- [ ] **Step 1: Create apps/oracle/src/components/FactionBanner.tsx**

```typescript
import { motion } from 'framer-motion';
import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';

interface Props {
  faction: Faction;
  typeName: string;
}

export default function FactionBanner({ faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-[240px] rounded-card px-6 py-8 text-white text-center relative overflow-hidden"
      style={{ backgroundColor: content.color }}
    >
      {/* Image asset (loaded on top of fallback color) */}
      <img
        src={`/assets/factions/${faction.slice(0, 2).toLowerCase()}.png`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
      {/* Text overlay */}
      <div className="relative z-10">
        <p className="text-[11px] uppercase tracking-widest opacity-80 mb-2 drop-shadow-sm">{faction}</p>
        <h1 className="text-[24px] font-bold mb-3 drop-shadow-sm">{typeName}</h1>
        <p className="text-base opacity-95 italic leading-relaxed drop-shadow-sm">"{content.slogan}"</p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create apps/oracle/src/components/CodeDisplay.tsx**

```typescript
interface Props {
  code: string;
}

export default function CodeDisplay({ code }: Props) {
  const letters = code.split('-');

  return (
    <div className="flex items-center justify-center gap-2 my-6">
      {letters.map((letter, i) => (
        <div
          key={i}
          className="w-14 h-14 bg-[#f6f1eb] border-2 border-primary rounded-btn flex items-center justify-center"
        >
          <span className="font-mono text-[18px] font-bold text-primary">{letter}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create apps/oracle/src/components/CharacterIllustration.tsx**

```typescript
import type { PersonalityResult } from '@fj/engine-core';

interface Props {
  personality: PersonalityResult;
}

export default function CharacterIllustration({ personality }: Props) {
  // Map typeName to image asset path
  const src = `/assets/characters/char-${personality.typeName}.png`;

  return (
    <div className="flex justify-center my-4">
      <img
        src={src}
        alt=""
        className="h-[200px] w-auto object-contain"
        loading="lazy"
        onError={(e) => {
          // Hide if image not yet available (MVP fallback)
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
```

> **MVP fallback:** 如果 `char-{typeName}.png` 不存在，`onError` 会隐藏该元素，不影响布局。

### Task 6.2: DimensionReadout

- [ ] **Step 1: Create apps/oracle/src/components/DimensionReadout.tsx**

```typescript
import { motion } from 'framer-motion';
import { DIMENSION_LABELS, getDimensionInterpretation } from '../data/factions';

interface Props {
  dimension: string;
  pValue: number;
}

export default function DimensionReadout({ dimension, pValue }: Props) {
  const label = DIMENSION_LABELS[dimension];
  const interpretation = getDimensionInterpretation(dimension, pValue);
  if (!label) return null;

  const strengthLabel =
    pValue >= 60 ? '强正向'
    : pValue > 50 ? '轻度正向'
    : pValue === 50 ? '完全平衡'
    : pValue > 40 ? '轻度反向'
    : '强反向';

  return (
    <div className="bg-white rounded-card p-5 border border-[#f0ebe4]">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="text-sm font-semibold text-[#2c2c2c]">{label.name}</h3>
        <span className="text-[11px] text-[#8a7a6a]">{strengthLabel}</span>
      </div>

      <div className="flex items-center gap-3 my-3">
        <span className="text-[11px] text-[#8a7a6a] w-16 text-right">{label.forward}</span>
        <div className="flex-1 h-2 bg-[#f0ebe4] rounded-full relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pValue}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="absolute left-0 top-0 h-full bg-primary rounded-full"
          />
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-[#8a7a6a]/30" />
        </div>
        <span className="text-[11px] text-[#8a7a6a] w-16">{label.reverse}</span>
      </div>

      <p className="text-[13px] text-[#6b6258] leading-relaxed mt-3">{interpretation}</p>
    </div>
  );
}
```

### Task 6.3: TypeProfile + ShareCard

- [ ] **Step 1: Create apps/oracle/src/components/TypeProfile.tsx**

```typescript
import { FACTION_CONTENT } from '../data/factions';
import type { PersonalityResult } from '@fj/engine-core';

interface Props {
  personality: PersonalityResult;
}

export default function TypeProfile({ personality }: Props) {
  const { faction } = personality;
  const content = FACTION_CONTENT[faction];

  return (
    <div className="bg-white rounded-card p-6 border border-[#f0ebe4]">
      <h2 className="text-[18px] font-bold text-[#2c2c2c] mb-3">流派底色</h2>
      <p className="text-base text-[#6b6258] leading-relaxed mb-4">{content.guide}</p>
      <p className="text-[13px] text-[#6b6258] leading-relaxed">{content.overview}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create apps/oracle/src/components/ShareCard.tsx**

```typescript
import { FACTION_CONTENT } from '../data/factions';
import type { Faction } from '@fj/engine-core';
import { useState } from 'react';

interface Props {
  code: string;
  faction: Faction;
  typeName: string;
}

export default function ShareCard({ code, faction, typeName }: Props) {
  const content = FACTION_CONTENT[faction];
  const [copied, setCopied] = useState(false);

  const shareText = `我的财务DNA是 ${code}（${typeName}）——${content.slogan} 来测测你的：`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '我的财务DNA代码',
        text: shareText,
        url: window.location.origin,
      });
    } else {
      await navigator.clipboard.writeText(shareText + ' ' + window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-card p-6 text-white text-center"
      style={{ backgroundColor: content.color }}
    >
      <p className="text-[11px] uppercase tracking-widest opacity-70 mb-2">{faction}</p>
      <p className="text-[24px] font-bold mb-1">{code}</p>
      <p className="text-[13px] opacity-80 mb-1">{typeName}</p>
      <p className="text-[11px] opacity-60 italic mt-2 mb-4">"{content.slogan}"</p>
      <button
        onClick={handleShare}
        className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm py-3 px-8 rounded-btn
                   active:scale-[0.97] transition-all duration-150"
      >
        {copied ? '已复制！' : '分享我的DNA'}
      </button>
    </div>
  );
}
```

### Task 6.4: ResultPage

- [ ] **Step 1: Create apps/oracle/src/pages/ResultPage.tsx**

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../store/quizStore';
import FactionBanner from '../components/FactionBanner';
import CodeDisplay from '../components/CodeDisplay';
import CharacterIllustration from '../components/CharacterIllustration';
import DimensionReadout from '../components/DimensionReadout';
import TypeProfile from '../components/TypeProfile';
import ShareCard from '../components/ShareCard';

export default function ResultPage() {
  const navigate = useNavigate();
  const { personality } = useQuizStore();
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    if (!personality) navigate('/', { replace: true });
  }, [personality, navigate]);

  if (!personality) return null;

  const { code, faction, typeName, dimensions } = personality;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-16">
      {/* ① Faction Banner (image asset + color fallback) */}
      <FactionBanner faction={faction} typeName={typeName} />

      <div className="px-6">
        {/* ② DNA Code Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-card shadow-sm -mt-4 relative z-10 px-4 py-3 border border-[#f0ebe4]"
        >
          <p className="text-[11px] text-[#8a7a6a] text-center mb-2">你的财务DNA代码</p>
          <CodeDisplay code={code} />
        </motion.div>

        {/* ③ Character Illustration (MVP: hidden if image not available) */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <CharacterIllustration personality={personality} />
        </motion.div>

        {/* ④ Faction Guide */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <TypeProfile personality={personality} />
        </motion.div>

        {/* ⑤ Share Card — visible without scrolling */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mt-6"
        >
          <ShareCard code={code} faction={faction} typeName={typeName} />
        </motion.div>

        {/* ⑥ Collapsible Dimension Readouts */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className="w-full flex items-center justify-between py-2"
          >
            <h2 className="text-[18px] font-bold text-[#2c2c2c]">四维深度解读</h2>
            <span className="text-[#8a7a6a] text-lg transition-transform duration-200"
                  style={{ transform: showDimensions ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▾
            </span>
          </button>

          <AnimatePresence>
            {showDimensions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-4 pt-4">
                  <DimensionReadout dimension="SC" pValue={dimensions.P_SC} />
                  <DimensionReadout dimension="IG" pValue={dimensions.P_IG} />
                  <DimensionReadout dimension="FV" pValue={dimensions.P_FV} />
                  <DimensionReadout dimension="EO" pValue={dimensions.P_EO} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ⑦ Retake */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
          className="mt-12 mb-8 text-center"
        >
          <button
            onClick={() => {
              useQuizStore.getState().reset();
              navigate('/quiz');
            }}
            className="text-[13px] text-[#8a7a6a] underline underline-offset-4"
          >
            重新测试
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
```

---

## Phase 7: Polish & Verification

### Task 7.1: End-to-end test

- [ ] **Step 1: Install and run**

```bash
cd /Users/leiwencheng/Coding/indiedev/fire-journey && pnpm install
cd apps/oracle && pnpm dev
```

- [ ] **Step 2: Test the complete flow**

On mobile viewport (375px width):
1. Open `http://localhost:3000` → HomePage renders
2. Click "开始答题" → QuizPage loads with shuffled 40 questions
3. Answer all 40 questions → animations smooth, progress bar updates
4. After last answer → DnaReveal animation (~3s)
5. Result page loads → correct faction, DNA code, 4 dimension readouts
6. Click "分享我的DNA" → share sheet (mobile) or clipboard copy (desktop)
7. Click "重新测试" → returns to quiz with fresh state
8. Direct access `/result` → redirects to home

- [ ] **Step 3: Verify scoring correctness**

| All Answers | Expected Code | Expected Faction |
|---|---|---|
| All A | S-I-F-E | FE 拓荒者流派 |
| All B | S̃-Ĩ-F̃-Ẽ | FE 拓荒者流派 |
| All C | C̃-G̃-Ṽ-Õ | VO 守夜人流派 |
| All D | C-G-V-O | VO 守夜人流派 |
| 5A+5D per dim | S/C-I/G-F/V-E/O | (tiebreak) |

- [ ] **Step 4: Fix any issues found**

---

## Verification Checklist

- [ ] `pnpm install` succeeds at root
- [ ] `cd packages/engine-core && pnpm test -- --run` — all tests pass
- [ ] `cd apps/oracle && pnpm dev` — Vite starts on port 3000
- [ ] Full 40-question flow: Home → Quiz → DNA Reveal → Result → Share
- [ ] All-A → S-I-F-E / FE 拓荒者, All-D → C-G-V-O / VO 守夜人
- [ ] Mobile responsive at 375px — no overflow, tappable buttons
- [ ] No `<style jsx>`, no `simParams`, no `B`/`M` question references anywhere
