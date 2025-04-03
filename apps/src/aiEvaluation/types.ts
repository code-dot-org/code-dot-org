export interface Evaluation {
  evaluator: string;
  evaluationCriteria: string;
  evaluation: string;
  reasoning: string;
  type: string;
}

export interface UserLevelSkillEvaluation extends Evaluation {
  type: 'UserLevelSkillEvaluation';
  studentId: number;
  levelId: number;
  unitId: number;
  // TODO: Add skillId
}

export interface UserLevelEvaluation extends Evaluation {
  type: 'UserLevelEvaluation';
  studentId: number;
  levelId: number;
  unitId: number;
  codeVersion?: string;
}
