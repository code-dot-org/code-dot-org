export interface UserLevelEvaluation {
  userId: number | undefined;
  levelId: number | undefined;
  unitId: number | undefined;
  schoolYear?: string;
  evaluationCriteria: string;
  aiEvaluation: string;
  aiReasoning: string;
  codeVersion?: string;
}
