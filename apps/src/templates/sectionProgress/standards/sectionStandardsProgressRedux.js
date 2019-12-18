import {
  unpluggedLessonList,
  lessonCompletedByStandard,
  fakeStandards
} from './standardsTestHelpers';

// Action creators

// Initial State
const initialState = {};

export default function sectionStandardsProgress(state = initialState, action) {
  return state;
}

export function getUnpluggedLessonsForScript(script) {
  return unpluggedLessonList;
}

export function getLessonsCompletedByStandardForScript(script) {
  return lessonCompletedByStandard;
}

export function getStandardsCoveredForScript(script) {
  return fakeStandards;
}
