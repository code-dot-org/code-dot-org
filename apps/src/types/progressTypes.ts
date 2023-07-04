// Typescript definitions for types relating to progress. Note that many
// of these are "duplicated" by `/templates/progress/progressTypes, which defined
// these using PropTypes for usage in Javascript React components. As we move towards
// typescript we can deprecate the PropTypes definitions and use these instead.

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
export const PUZZLE_PAGE_NONE = -1;

export interface Lesson {
  assessment: boolean;
  description_student: string;
  description_teacher: string;
  hasLessonPlan: boolean;
  id: number;
  key: string;
  lessonEditPath: string;
  lessonNumber: number | undefined;
  lessonStartUrl: string;
  lesson_extras_level_url: string;
  lesson_group_display_name: string;
  levels: Level[];
  lockable: boolean;
  name: string;
  num_script_lessons: number;
  numberedLesson: boolean;
  position: number;
  relative_position: number;
  script_id: number;
  script_name: string;
  title: string;
  unplugged: boolean | null;
}

export interface LessonGroup {
  big_questions: string | null;
  description: string | null;
  display_name: string;
  id: number;
  key: string;
  position: number;
  user_facing: boolean;
}

export interface Level {
  activeId: string;
  app: string;
  bonus: boolean;
  display_as_unplugged: boolean;
  freePlay: boolean;
  icon: string | null;
  id: number;
  ids: string[];
  inactiveIds: string[];
  is_concept_level: boolean;
  kind: string;
  position: number;
  title: number;
  url: string;
  status?: string;
  usesLab2: boolean;
}

export interface LevelWithProgress extends Level {
  status: string;
  paired?: boolean;
  isLocked?: boolean;
  isCurrentLevel?: boolean;
}

export interface UnitProgress {
  lastTimestamp: number | undefined;
  locked: boolean;
  pages: UnitProgress[] | null;
  paired: boolean;
  result: number;
  status: string;
  teacherFeedbackReviewState: keyof typeof ReviewStates | undefined;
  timeSpent: number | undefined;
}

export interface PeerReviewLessonInfo {
  name: string;
  lesson_group_display_name: string;
  levels: PeerReviewLevelInfo[];
  lockable: boolean;
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

export interface PeerReviewSummary {
  status: string;
  name: string;
  result: string;
  icon: string;
  locked: boolean;
}

export const ReviewStates = {
  completed: 'completed',
  keepWorking: 'keepWorking',
  awaitingReview: 'awaitingReview',
};

export interface InitProgressPayload {
  currentLevelId: string | null;
  deeperLearningCourse: boolean;
  saveAnswersBeforeNavigation: boolean | null;
  lessons: Lesson[];
  lessonGroups: LessonGroup[] | null;
  scriptId: number | null;
  scriptName: string | null;
  scriptDisplayName: string | undefined;
  unitTitle: string | null;
  unitDescription: string | undefined;
  unitStudentDescription: string | undefined;
  courseId: number | null;
  courseVersionId: number | undefined;
  isLessonExtras: boolean;
  peerReviewLessonInfo: PeerReviewLessonInfo | null;
  isFullProgress: boolean;
  currentPageNumber: number;
}

// LevelResults is a map of levelId -> TestResult. TestResult is a number.
export type LevelResults = {[key: number]: number};

export const ViewType = {
  Participant: 'Participant',
  Instructor: 'Instructor',
};
