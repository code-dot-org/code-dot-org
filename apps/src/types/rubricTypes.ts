import type {InferProps} from 'prop-types';

import {
  evidenceLevelShape,
  learningGoalShape,
  reportingDataShape,
  rubricShape,
  studentLevelInfoShape,
} from '../templates/rubrics/rubricShapes';

// Types derived from rubricShapes.js

export type EvidenceLevel = InferProps<typeof evidenceLevelShape>['isRequired'];
export type LearningGoal = InferProps<typeof learningGoalShape>['isRequired'];
export type Rubric = InferProps<typeof rubricShape>['isRequired'];
export type ReportingData = InferProps<typeof reportingDataShape>['isRequired'];
export type StudentLevelInfo = InferProps<
  typeof studentLevelInfoShape
>['isRequired'];
export interface RubricData {
  rubric: Rubric;
  canShowTaScoresAlert: boolean;
}
export interface TeacherEvaluations {
  id: number;
  feedback: string | null;
  understanding: number | null;
}
