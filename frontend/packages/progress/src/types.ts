import type {
  Lesson,
  LessonGroupSummary,
  UnitLevel,
  Sublevel,
} from '@code-dot-org/core/api';

import type {ProgressLevelTypes, TestResults} from './constants';
import {LevelStatuses, ViewTypes} from './constants';

export type TestResult = (typeof TestResults)[keyof typeof TestResults];
export type LevelStatus = (typeof LevelStatuses)[keyof typeof LevelStatuses];

// LevelResults is a map of levelId -> TestResult. TestResult is a number.
export type LevelResults = {[key: number]: TestResult};

export const ReviewStates = {
  completed: 'completed',
  keepWorking: 'keepWorking',
  awaitingReview: 'awaitingReview',
};

/**
 * The schema for the unit progress as returned by our backend API.
 */
export interface UnitProgressDefinition {
  status: LevelStatus;
  last_progress_at?: number;
  locked?: boolean;
  pages_completed?: TestResult[];
  paired?: boolean;
  result?: TestResult;
  teacher_feedback_commented?: boolean;
  teacher_feedback_review_state?: keyof typeof ReviewStates;
  teacher_feedback_new?: boolean;
  time_spent?: number;
}

export interface UnitProgress {
  lastTimestamp: number | undefined;
  locked: boolean;
  pages?: UnitProgress[];
  paired: boolean;
  result: TestResult;
  status: LevelStatus;
  teacherFeedbackCommented: boolean;
  teacherFeedbackReviewState: keyof typeof ReviewStates | undefined;
  teacherFeedbackNew: boolean;
  timeSpent: number | undefined;
}

export interface NumberedLevelFields {
  ids: number[];
  activeId: number;
  levelNumber: number;
  isCurrentLevel: boolean;
  sublevels?: NumberedLevel[];
  bubbleText?: string;
  scriptLevelId?: number;
  parentLevelId?: number;
  // TODO: these are user_progress API return values. replace them with something in core/api
  status?: LevelStatus;
  paired?: boolean;
  isLocked?: boolean;
  timeSpent?: number;
  teacherFeedbackReviewState?: string;
  teacherFeedbackNew?: boolean;
  teacherFeedbackCommented?: boolean;
  lastTimestamp?: string;
  pages?: UnitProgress[];
}

export type NumberedSublevel = Sublevel & NumberedLevelFields;

export type NumberedLevel =
  | (UnitLevel & NumberedLevelFields)
  | NumberedSublevel;

export interface ProgressState {
  currentLevelId?: number;
  currentLessonId?: number;
  standaloneProjectType?: string;
  deeperLearningCourse?: boolean;
  saveAnswersBeforeNavigation?: boolean;
  lessons?: Lesson[];
  lessonGroups?: LessonGroupSummary[];
  scriptId?: number;
  viewAsUserId?: number;
  scriptName?: string;
  scriptDisplayName?: string;
  unitTitle?: string;
  courseId?: number;
  isLessonExtras: boolean;
  unitProgress: {
    [key: number]: UnitProgress;
  };
  unitProgressHasLoaded: boolean;
  levelResults: LevelResults;
  focusAreaLessonIds: number[];
  peerReviewLessonInfo?: PeerReviewLessonInfo;
  peerReviewsPerformed: PeerReviewSummary[];
  postMilestoneDisabled: boolean;
  isAge13Required: boolean;
  studentDefaultsSummaryView: boolean;
  isSummaryView: boolean;
  isMiniView: boolean;
  hasFullProgress: boolean;
  lessonExtrasEnabled: boolean;
  usingDbProgress: boolean;
  currentPageNumber: number;
  courseVersionId?: number;
  unitDescription?: string;
  unitStudentDescription?: string;
  unitHasUnnumberedLessons: boolean;
  changeFocusAreaPath?: string;
  unitCompleted?: boolean;
}

export interface InitProgressPayload {
  currentLevelId?: number;
  standaloneProjectType?: string;
  deeperLearningCourse: boolean;
  saveAnswersBeforeNavigation?: boolean;
  lessons: Lesson[];
  lessonGroups?: LessonGroupSummary[];
  scriptId?: number;
  scriptName?: string;
  scriptDisplayName?: string;
  unitTitle?: string;
  unitDescription?: string;
  unitStudentDescription: string;
  unitHasUnnumberedLessons: boolean;
  courseId?: number;
  courseVersionId?: number;
  isLessonExtras: boolean;
  peerReviewLessonInfo?: PeerReviewLessonInfo;
  isFullProgress: boolean;
  currentPageNumber: number;
}

export interface PeerReviewSummary {
  status: string;
  name: string;
  result: string;
  icon: string;
  locked: boolean;
}

export interface PeerReviewLevelInfo {
  id: number;
  kind: string;
  title: string;
  url: string;
  name: string;
  icon: string;
  locked: boolean;
  status?: string;
}

export interface PeerReviewLessonInfo {
  name: string;
  lesson_group_display_name: string;
  levels: PeerReviewLevelInfo[];
  lockable: boolean;
}

export type ViewType = (typeof ViewTypes)[keyof typeof ViewTypes];

// A validation condition.
export interface Condition {
  name: string;
  value?: string | number;
}

// Validation in the level.
export interface Validation {
  conditions: Condition[];
  message: string;
  callout?: string;
  next: boolean;
  key: string;
  comment?: string;
}

// Abstract class that validates a set of conditions. How
// the validation works is up to the implementor.
export abstract class Validator {
  abstract shouldCheckConditions(): boolean;
  abstract shouldCheckNextConditionsOnly(): boolean;
  abstract checkConditions(): void;
  abstract conditionsMet(conditions: Condition[]): boolean;
  abstract clear(): void;
  abstract getValidationResults(): ValidationResult[] | undefined;
  didPassExemplarValidation(): boolean {
    return false;
  }
}

// The current progress validation state.
export interface ValidationState {
  hasConditions: boolean;
  satisfied: boolean;
  message: string | null;
  callout?: string;
  index: number;
  validationResults?: ValidationResult[];
}

export interface ValidationResult {
  message: string;
  result: TestStatus;
}

// Test results for upper-grade labs (labs that use levelbuilder-written unit tests for validation)
export type TestStatus =
  | 'PASS'
  | 'FAIL'
  | 'SKIP'
  | 'ERROR'
  | 'PENDING'
  | 'EXPECTED_FAILURE'
  | 'UNEXPECTED_SUCCESS';

// Exemplar settings for a level.
export interface ExemplarSettings {
  validationEnabled: boolean;
  validationSuccessMessage: string;
  validationFailureMessage: string;
}

export interface OptionalMilestoneData {
  program?: string;
  // Submitted is a boolean, which the server expects as a string.
  submitted?: string;
}

export interface MilestoneReport extends OptionalMilestoneData {
  app: string;
  result: boolean;
  testResult: TestResult;
}

export type ProgressLevelType =
  (typeof ProgressLevelTypes)[keyof typeof ProgressLevelTypes];
