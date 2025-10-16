export interface EvidenceLevel {
  id: number;
  understanding: number;
  teacherDescription: string;
}

export interface LearningGoal {
  id: number;
  learningGoal: string;
  key: string;
  evidenceLevels: Array<EvidenceLevel>;
  tips?: string;
}

export interface Rubric {
  id: number;
  learningGoals: Array<LearningGoal>;
}

export interface TeacherEvaluation {
  user_name: string;
  user_family_name: string;
  [key: number]: string;
}

export type TeacherEvaluations = Array<TeacherEvaluation>;
