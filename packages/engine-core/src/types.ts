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
  code: string;              // "S-I-F-E"
  faction: Faction;
  typeName: string;          // "远航-拓荒者"
  dimensions: {
    P_SC: number;            // 0–100
    P_IG: number;
    P_FV: number;
    P_EO: number;
  };
  borderline: Dimension[];   // which dims are borderline (50-60 or 40-50)
  balanced: Dimension[];     // which dims are perfectly balanced (50)
}
