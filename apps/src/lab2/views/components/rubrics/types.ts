// TODO: dupe of rubricShapes.jsx - can we share?

export type EvidenceLevel = {
  understanding: number;
  teacherDescription: string;
};
export type LearningGoal = {
  key: string;
  learningGoal: string;
  aiEnabled: boolean;
  tips: string;
  evidenceLevels: EvidenceLevel[];
};

export type Rubric = {
  id: number;
  learningGoals: LearningGoal[];
  lesson: {position: number; name: string};
  script: {id: number};
  level: {id: number};
};

export interface SubmittedEvaluation {
  id: number;
  feedback: string | null;
  understanding: number | null;
}
