import {PUZZLE_PAGE_NONE} from '@cdo/apps/templates/progress/progressTypes';

interface ProgressState {
  currentLevelId: string | null;
  currentLessonId: number | null;
  deeperLearningCourse: boolean | null;
  saveAnswersBeforeNavigation: boolean | null;
  lessons: Lesson[] | null;
  lessonGroups: LessonGroup[] | null;
  scriptId: number | null;
  scriptName: string | null;
  unitTitle: string | null;
  courseId: number | null;
  isLessonExtras: boolean;
  unitProgress: {
    [key: number]: UnitProgress;
  };
  unitProgressHasLoaded: boolean;
  // levelResults is a map of levelId -> TestResult. TestResult is a number.
  levelResults: {
    [key: number]: number;
  };
  focusAreaLessonIds: number[];
  peerReviewLessonInfo: PeerReviewLessonInfo | null;
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
  courseVersionId: number | undefined;
}

interface Lesson {
  assessment: boolean;
  description_student: string;
  description_teacher: string;
  hasLessonPlan: boolean;
  id: number;
  key: string;
  lessonEditPath: string;
  lessonNumber: number;
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

interface LessonGroup {
  big_questions: string | null;
  description: string | null;
  display_name: string;
  id: number;
  key: string;
  position: number;
  user_facing: boolean;
}

interface Level {
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
}

interface UnitProgress {
  lastTimestamp: number | undefined;
  locked: boolean;
  pages: UnitProgress[] | null;
  paired: boolean;
  result: number;
  status: string;
  teacherFeedbackReviewState: keyof typeof ReviewStates | undefined; // TODO: is this a string?
  timeSpent: number | undefined;
}

interface PeerReviewLessonInfo {
  name: string;
  lesson_group_display_name: string;
  levels: PeerReveiwLevelInfo[];
  lockable: boolean;
}

interface PeerReveiwLevelInfo {
  id: number;
  kind: string;
  title: string;
  url: string;
  name: string;
  icon: string;
  locked: boolean;
}

interface PeerReviewSummary {
  status: string;
  name: string;
  result: string;
  icon: string;
  locked: boolean;
}

const ReviewStates = {
  completed: 'completed',
  keepWorking: 'keepWorking',
  awaitingReview: 'awaitingReview',
};

const initialState: ProgressState = {
  currentLevelId: null,

  // These first fields never change after initialization
  currentLessonId: null,
  deeperLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  lessons: null,
  lessonGroups: null,
  scriptId: null,
  scriptName: null,
  unitTitle: null,
  courseId: null,
  isLessonExtras: false,

  // The remaining fields do change after initialization
  // unitProgress is of type unitProgressType (a map of levelId ->
  // studentLevelProgressType)
  unitProgress: {},
  unitProgressHasLoaded: false,
  // levelResults is a map of levelId -> TestResult
  // note: eventually, we expect usage of this field to be replaced with unitProgress
  levelResults: {},
  focusAreaLessonIds: [],
  peerReviewLessonInfo: null,
  peerReviewsPerformed: [],
  postMilestoneDisabled: false,
  isAge13Required: false,
  // Do students see summary view by default?
  studentDefaultsSummaryView: true,
  isSummaryView: true,
  isMiniView: false,
  hasFullProgress: false,
  lessonExtrasEnabled: false,
  // Note: usingDbProgress === "user is logged in". However, it is
  // possible that we can get the user progress back from the DB
  // prior to having information about the user login state.
  // TODO: Use sign in state to determine where to source user progress from
  usingDbProgress: false,
  currentPageNumber: PUZZLE_PAGE_NONE,
  courseVersionId: undefined,
};
