import type {LessonGroup} from '@code-dot-org/api/models/lessonGroups';
import type {Lesson} from '@code-dot-org/api/models/lessons';
import type {Level} from '@code-dot-org/api/models/levels';

import type {TestResults} from './constants';
import {LevelStatus} from './constants';

// LevelResults is a map of levelId -> TestResults. TestResults is a number.
export type LevelResults = {[key: number]: TestResults};

export type NumberedLevel = Level & {
  ids: number[];
  activeId: number;
  levelNumber: number;
  isCurrentLevel: boolean;
  sublevels?: NumberedLevel[];
  status?: LevelStatus;
};

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
  pages_completed?: TestResults[];
  paired?: boolean;
  result?: TestResults;
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
  result: TestResults;
  status: LevelStatus;
  teacherFeedbackCommented: boolean;
  teacherFeedbackReviewState: keyof typeof ReviewStates | undefined;
  teacherFeedbackNew: boolean;
  timeSpent: number | undefined;
}

export interface ProgressState {
  currentLevelId?: number;
  currentLessonId?: number;
  standaloneProjectType?: string;
  deeperLearningCourse?: boolean;
  saveAnswersBeforeNavigation?: boolean;
  lessons?: Lesson[];
  lessonGroups?: LessonGroup[];
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
  lessonGroups?: LessonGroup[];
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

export const ViewType = {
  Participant: 'Participant',
  Instructor: 'Instructor',
};

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
  testResult: number;
}

/**
 * Returns whether we appear to be in a script level or a standalone level.
 * A script level is identified because it has lessons.
 * A standalone level doesn't have lessons, but it does have a level ID.
 */
export enum ProgressLevelType {
  SCRIPT_LEVEL = 'script_level',
  LEVEL = 'level',
}
