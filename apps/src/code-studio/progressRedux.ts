import {
  Lesson,
  LessonGroup,
  UnitProgress,
  PeerReviewLessonInfo,
  PeerReviewSummary,
  PUZZLE_PAGE_NONE,
  InitProgressPayload,
} from '@cdo/apps/types/progressTypes';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import _ from 'lodash';
import {
  processedLevel,
  processServerStudentProgress,
  getLevelResult,
} from '@cdo/apps/templates/progress/progressHelpers';

interface ProgressState {
  currentLevelId: string | null;
  currentLessonId: number | undefined;
  deeperLearningCourse: boolean | null;
  saveAnswersBeforeNavigation: boolean | null;
  lessons: Lesson[] | null;
  lessonGroups: LessonGroup[] | null;
  scriptId: number | null;
  scriptName: string | null;
  scriptDisplayName: string | undefined;
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
  unitDescription: string | undefined;
  unitStudentDescription: string | undefined;
}

const initialState: ProgressState = {
  currentLevelId: null,

  // These first fields never change after initialization
  currentLessonId: undefined,
  deeperLearningCourse: null,
  // used on multi-page assessments
  saveAnswersBeforeNavigation: null,
  lessons: null,
  lessonGroups: null,
  scriptId: null,
  scriptName: null,
  scriptDisplayName: undefined,
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
  unitDescription: undefined,
  unitStudentDescription: undefined,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    initProgress(state, action: PayloadAction<InitProgressPayload>) {
      const lessons = action.payload.lessons;
      // Re-initializing with full set of lessons shouldn't blow away currentLessonId
      const currentLessonId =
        state.currentLessonId ||
        (lessons.length === 1 ? lessons[0].id : undefined);
      state.currentLevelId ||= action.payload.currentLevelId;
      state.deeperLearningCourse = action.payload.deeperLearningCourse;
      state.saveAnswersBeforeNavigation =
        action.payload.saveAnswersBeforeNavigation;
      state.lessons = processedLessons(
        lessons,
        action.payload.deeperLearningCourse
      );
      state.lessonGroups = action.payload.lessonGroups;
      state.peerReviewLessonInfo = action.payload.peerReviewLessonInfo;
      state.scriptId = action.payload.scriptId;
      state.scriptName = action.payload.scriptName;
      state.scriptDisplayName = action.payload.scriptDisplayName;
      state.unitTitle = action.payload.unitTitle;
      state.unitDescription = action.payload.unitDescription;
      state.courseId = action.payload.courseId;
      state.courseVersionId = action.payload.courseVersionId;
      state.currentLessonId = currentLessonId;
      state.hasFullProgress = action.payload.isFullProgress;
      state.isLessonExtras = action.payload.isLessonExtras;
      state.currentPageNumber = action.payload.currentPageNumber;
    },
    setCurrentLevelId(state, action: PayloadAction<string>) {
      state.currentLevelId = action.payload;
    },
    setScriptProgress(
      state,
      action: PayloadAction<{
        [levelId: number]: UnitProgress;
      }>
    ) {
      state.unitProgress = processServerStudentProgress(action.payload);
      state.unitProgressHasLoaded = true;
    },
  },
});

// Helpers

/**
 * Does some processing of our passed in lesson, namely
 * - Removes 'hidden' field
 * - Adds 'lessonNumber' field for non-PLC lessons which
 * are not lockable or have a lesson plan
 */
export function processedLessons(lessons: Lesson[], isPlc: boolean) {
  let numLessonsWithLessonPlan = 0;

  return lessons.map(lesson => {
    let lessonNumber;
    if (!isPlc && lesson.numberedLesson) {
      numLessonsWithLessonPlan++;
      lessonNumber = numLessonsWithLessonPlan;
    }
    return {
      ..._.omit(lesson, 'hidden'),
      lessonNumber,
    };
  });
}

export default progressSlice.reducer;
