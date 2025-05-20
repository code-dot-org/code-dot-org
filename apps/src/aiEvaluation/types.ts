export interface Evaluation {
  evaluator: string;
  evaluationCriteria: string;
  evaluation: string;
  reasoning: string;
  type: string;
  studentId: number;
  levelId: number;
  unitId: number;
  codeVersion?: string;
}

export interface UserLevelSkillEvaluation extends Evaluation {
  type: 'UserLevelSkillEvaluation';
  // TODO: Add skillId
}

export interface UserLevelEvaluation extends Evaluation {
  type: 'UserLevelEvaluation';
}
