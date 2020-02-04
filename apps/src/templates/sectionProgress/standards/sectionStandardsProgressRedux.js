import {
  unpluggedLessonList,
  lessonCompletedByStandard
} from './standardsTestHelpers';

const ADD_STANDARDS_DATA = 'sectionStandardsProgress/ADD_STANDARDS_DATA';
const SET_TEACHER_COMMENT_FOR_REPORT =
  'sectionStandardsProgress/SET_TEACHER_COMMENT_FOR_REPORT';

// Action creators
export const addStandardsData = standardsData => {
  return {type: ADD_STANDARDS_DATA, standardsData: standardsData};
};
export const setTeacherCommentForReport = teacherComment => ({
  type: SET_TEACHER_COMMENT_FOR_REPORT,
  teacherComment
});

// Initial State
const initialState = {
  standardsData: [],
  teacherComment: null
};

export default function sectionStandardsProgress(state = initialState, action) {
  if (action.type === ADD_STANDARDS_DATA) {
    return {
      ...state,
      standardsData: action.standardsData
    };
  }
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

export const lessonsByStandard = state => {
  let lessonsByStandardId = {};
  if (
    state.sectionProgress.scriptDataByScript &&
    state.scriptSelection.scriptId &&
    state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId] &&
    state.sectionStandardsProgress.standardsData
  ) {
    const standards = state.sectionStandardsProgress.standardsData;

    const stages =
      state.sectionProgress.scriptDataByScript[state.scriptSelection.scriptId]
        .stages;

    const numStudents =
      state.teacherSections.sections[state.teacherSections.selectedSectionId]
        .studentCount;

    standards.forEach(standard => {
      let lessons = [];
      stages.forEach(stage => {
        if (standard.lesson_ids.includes(stage.id)) {
          let lessonDetails = {};
          lessonDetails['name'] = stage.name;
          lessonDetails['lessonNumber'] = stage.relative_position;
          lessonDetails['numStudents'] = numStudents;
          lessonDetails['url'] = stage.lesson_plan_html_url;
          lessons.push(lessonDetails);
        }
      });
      lessonsByStandardId[standard.id] = lessons;
    });
  }
  return lessonsByStandardId;
};

export function getStandardsCoveredForScript(scriptId) {
  return (dispatch, getState) => {
    $.ajax({
      method: 'GET',
      dataType: 'json',
      url: `/dashboardapi/script_standards/${scriptId}`
    }).then(data => {
      const standardsData = data;
      dispatch(addStandardsData(standardsData));
    });
  };
}
