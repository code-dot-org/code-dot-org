import {
  unpluggedLessonList,
  lessonCompletedByStandard,
  fakeStandards
} from './standardsTestHelpers';

const SET_TEACHER_COMMENT_FOR_REPORT =
  'sectionStandardsProgress/SET_TEACHER_COMMENT_FOR_REPORT';

// Action creators
export const setTeacherCommentForReport = teacherComment => ({
  type: SET_TEACHER_COMMENT_FOR_REPORT,
  teacherComment
});

// Initial State
const initialState = {
  teacherComment: null
};

export default function sectionStandardsProgress(state = initialState, action) {
  console.log(action);
  console.log(state);
  if (action.type === SET_TEACHER_COMMENT_FOR_REPORT) {
    return {
      ...state,
      teacherComment: action.teacherComment
    };
  }
  return state;
}

export function getUnpluggedLessonsForScript(script) {
  return unpluggedLessonList;
}

export function getLessonsCompletedByStandardForScript(script) {
  return lessonCompletedByStandard;
}

export function getNumberLessonsCompleted(script) {
  return 5;
}

export function getNumberLessonsInCourse(script) {
  return 10;
}

export function getStandardsCoveredForScript(script) {
  return fakeStandards;
}
