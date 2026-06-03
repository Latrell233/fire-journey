import * as fs from 'fs';

const INPUT = '/Users/leiwencheng/Coding/indiedev/fire-journey/wealth-dna/ProjDoc/16人格全量文案Fin.md';
const OUTPUT = '/Users/leiwencheng/Coding/indiedev/fire-journey/apps/oracle/src/data/typeProfiles.ts';

const raw = fs.readFileSync(INPUT, 'utf-8');

const FACTION_MAP: Record<string, string> = {
  'FE': 'FE 拓荒者流派', 'FO': 'FO 离岸者流派',
  'VE': 'VE 征服者流派', 'VO': 'VO 守夜人流派',
};

interface ParsedType {
  code: string; typeName: string; faction: string;
  corePortrait: string; coreFormula: string;
  decisionPriorities: string[]; behavioralTraits: string[];
  complementaryType: string; complementaryDesc: string;
  conflictType: string; conflictDesc: string;
  pressureMode: string; pressureDesc: string;
  darkSides: string[];
  idealEndgame: string; idealEndgameDesc: string;
}

function sectionAfter(text: string, headerPattern: RegExp): string | null {
  const idx = text.search(headerPattern);
  if (idx === -1) return null;
  return text.slice(idx);
}

function extractBetween(text: string, startPattern: RegExp, endPattern: RegExp | null): string {
  const start = text.search(startPattern);
  if (start === -1) return '';
  let slice = text.slice(start).replace(startPattern, '');
  if (endPattern) {
    const end = slice.search(endPattern);
    if (end !== -1) slice = slice.slice(0, end);
  }
  return slice.trim();
}

function parseListItems(block: string, prefix: string): string[] {
  const items: string[] = [];
  const lines = block.split('\n');
  let current: string | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(new RegExp(`^${prefix}\\s+\\*\\*(.+?)\\*\\*[：:](.*)`));
    if (m) {
      if (current) items.push(current.trim());
      current = m[1] + '：' + m[2].trim();
    } else if (current) {
      current += line;
    }
  }
  if (current) items.push(current.trim());
  return items;
}

function stripBlockquote(text: string): string {
  return text.replace(/^>\s*/gm, '').replace(/\*\*/g, '').trim();
}

function parseTypeBlock(block: string): ParsedType | null {
  const headerMatch = block.match(/^(\d{2})\.\s*([\w̃～\/-]+)\s*\|\s*(.+)$/m);
  if (!headerMatch) return null;
  const code = headerMatch[2].trim();
  const typeName = headerMatch[3].trim();

  const fv = (code.split('-')[2] || '').startsWith('F') ? 'F' : 'V';
  const eo = (code.split('-')[3] || '').startsWith('E') ? 'E' : 'O';
  const faction = FACTION_MAP[fv + eo] || '';

  // --- Core Portrait ---
  const portraitBlock = extractBetween(block, /### ✦ 核心画像[^\n]*\n/, /### ✦ 搞钱思维/);
  const formulaMatch = portraitBlock.match(/> \*\*核心驱动力公式\*\*\s*\n>\s*(.+)$/m);
  const coreFormula = formulaMatch ? formulaMatch[1].replace(/\*\*/g, '').trim() : '';
  const corePortrait = portraitBlock
    .replace(/> \*\*核心驱动力公式\*\*[\s\S]*$/, '')
    .replace(/\n{3,}/g, '\n\n').trim();

  // --- Decision Flow ---
  const decisionBlock = extractBetween(block, /### ✦ 搞钱思维[^\n]*\n/, /### ✦ 人际引力/);
  const prioBlock = extractBetween(decisionBlock, /#### 1\. 决策优先级排序/, /#### 2\. 日常行事风格/);
  const decisionPriorities = parseListItems(prioBlock, '\\d+\\.');

  const traitBlock = extractBetween(decisionBlock, /#### 2\. 日常行事风格/, null);
  const behavioralTraits = parseListItems(traitBlock, '-');

  // --- Interpersonal Gravity ---
  const gravityBlock = extractBetween(block, /### ✦ 人际引力[^\n]*\n/, /### ✦ 精神危机/);
  let complementaryType = '', complementaryDesc = '', conflictType = '', conflictDesc = '';

  const cMatch = gravityBlock.match(/-\s+\*\*天然互补\s*\|\s*(.+?)\*\*[：:]\s*\n{2,}\s*(.+?)(?=\n{2,}\s*- \*\*潜在冲突)/s);
  if (cMatch) { complementaryType = cMatch[1].replace(/\*\*/g, '').trim(); complementaryDesc = cMatch[2].replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim(); }

  const oMatch = gravityBlock.match(/-\s+\*\*潜在冲突\s*\|\s*(.+?)\*\*[：:]\s*\n{2,}\s*(.+?)$/s);
  if (oMatch) { conflictType = oMatch[1].replace(/\*\*/g, '').trim(); conflictDesc = oMatch[2].replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim(); }

  // --- Crisis ---
  const crisisBlock = extractBetween(block, /### ✦ 精神危机[^\n]*\n/, /### ✦ 理想终局/);
  let pressureMode = '', pressureDesc = '';
  const pBlock = extractBetween(crisisBlock, /#### 1\. 压力下[^\n]*\n/, /#### 2\. 你必须直面的潜在暗面/);
  const pMatch = pBlock.match(/^>\s*(.+?)(?:\n\n|\n$)/s);
  if (pMatch) {
    const parts = pMatch[1].split(/\n(?=>)/);
    pressureMode = parts[0].replace(/\n/g, '').trim();
  }
  // Get the paragraph after the blockquote
  const afterBq = pBlock.replace(/^>\s*[\s\S]+?\n\n/, '').trim();
  pressureDesc = afterBq;

  const darkBlock = extractBetween(crisisBlock, /#### 2\. 你必须直面的潜在暗面/, null);
  const darkSides = parseListItems(darkBlock, '-');

  // --- Ideal Endgame ---
  const endgameBlock = extractBetween(block, /### ✦ 理想终局[^\n]*\n/, null);
  let idealEndgame = '', idealEndgameDesc = '';
  const eqMatch = endgameBlock.match(/^>\s*(.+?)\n\n(.+)$/s);
  if (eqMatch) {
    idealEndgame = eqMatch[1].replace(/\n>\s*/g, '').trim();
    idealEndgameDesc = eqMatch[2].trim();
  } else {
    idealEndgameDesc = endgameBlock.replace(/^>\s*/gm, '').replace(/^### ✦ 理想终局[^\n]*\n/, '').trim();
    // Remove trailing cross-faction summary tables
    const cutoff = idealEndgameDesc.search(/\n\s*\n## ✦|\n\s*\n# VE|\n\s*\n# FO|\n\s*\n# FE|\n\s*\n# VO/);
    if (cutoff !== -1) idealEndgameDesc = idealEndgameDesc.slice(0, cutoff).trim();
  }

  return {
    code, typeName, faction,
    corePortrait, coreFormula,
    decisionPriorities, behavioralTraits,
    complementaryType, complementaryDesc,
    conflictType, conflictDesc,
    pressureMode, pressureDesc,
    darkSides,
    idealEndgame, idealEndgameDesc,
  };
}

// Split by type sections
const typeBlocks = raw.split(/^## (?=\d{2}\.)/m).slice(1);

const results: ParsedType[] = [];
for (const block of typeBlocks) {
  const parsed = parseTypeBlock(block);
  if (parsed && parsed.code) results.push(parsed);
}

// Generate TypeScript
const ts = `// Auto-generated from 16人格全量文案Fin.md
// DO NOT EDIT MANUALLY

import type { Faction } from '@fj/engine-core';

export interface TypeProfileData {
  code: string;
  typeName: string;
  faction: Faction;
  corePortrait: string;
  coreFormula: string;
  decisionPriorities: string[];
  behavioralTraits: string[];
  complementaryType: string;
  complementaryDesc: string;
  conflictType: string;
  conflictDesc: string;
  pressureMode: string;
  pressureDesc: string;
  darkSides: string[];
  idealEndgame: string;
  idealEndgameDesc: string;
}

export const TYPE_PROFILES: Record<string, TypeProfileData> = {
${results.map(t => `  '${t.code}': {
    code: '${t.code}',
    typeName: '${t.typeName}',
    faction: '${t.faction}' as Faction,
    corePortrait: ${JSON.stringify(t.corePortrait)},
    coreFormula: ${JSON.stringify(t.coreFormula)},
    decisionPriorities: ${JSON.stringify(t.decisionPriorities)},
    behavioralTraits: ${JSON.stringify(t.behavioralTraits)},
    complementaryType: ${JSON.stringify(t.complementaryType)},
    complementaryDesc: ${JSON.stringify(t.complementaryDesc)},
    conflictType: ${JSON.stringify(t.conflictType)},
    conflictDesc: ${JSON.stringify(t.conflictDesc)},
    pressureMode: ${JSON.stringify(t.pressureMode)},
    pressureDesc: ${JSON.stringify(t.pressureDesc)},
    darkSides: ${JSON.stringify(t.darkSides)},
    idealEndgame: ${JSON.stringify(t.idealEndgame)},
    idealEndgameDesc: ${JSON.stringify(t.idealEndgameDesc)},
  }`).join(',\n')}
};
`;

fs.writeFileSync(OUTPUT, ts, 'utf-8');
console.log(`✅ Written ${results.length} type profiles to ${OUTPUT}`);
for (const t of results) {
  const prios = t.decisionPriorities.length;
  const traits = t.behavioralTraits.length;
  const darks = t.darkSides.length;
  const hasPressure = t.pressureMode.length > 0;
  console.log(`  ${t.code} | ${t.typeName} | prio:${prios} trait:${traits} dark:${darks} pressure:${hasPressure}`);
}
