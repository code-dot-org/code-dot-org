import {ViewType} from './sectionProgressConstants';
import {
  startLoadingProgress,
  setCurrentView,
  finishLoadingProgress,
  addDataByScript,
  startRefreshingProgress,
  finishRefreshingProgress
} from './sectionProgressRedux';
import {
  processedLevel,
  processServerSectionProgress,
  lessonProgressForSection
} from '@cdo/apps/templates/progress/progressHelpers';
import {
  fetchStandardsCoveredForScript,
  fetchStudentLevelScores
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import {getStore} from '@cdo/apps/redux';
import _ from 'lodash';

const NUM_STUDENTS_PER_PAGE = 50;

export function loadScriptProgress(scriptId, sectionId) {
  const state = getStore().getState().sectionProgress;
  const sectionData = getStore().getState().sectionData.section;

  // TODO: Save Standards data in a way that allows us
  // not to reload all data to get correct standards data
  if (
    state.studentLevelProgressByScript[scriptId] &&
    state.scriptDataByScript[scriptId] &&
    state.currentView !== ViewType.STANDARDS
  ) {
    if (state.isRefreshingProgress) {
      return;
    }
    // Continue displaying the UI while updating the data
    getStore().dispatch(startRefreshingProgress());
  } else {
    getStore().dispatch(startLoadingProgress());
  }

  let sectionProgress = {
    scriptDataByScript: {},
    studentLevelProgressByScript: {},
    studentLessonProgressByScript: {},
    studentLastUpdateByScript: {}
  };

  // Get the script data
  const scriptRequest = fetch(`/dashboardapi/script_structure/${scriptId}`, {
    credentials: 'include'
  })
    .then(response => response.json())
    .then(scriptData => {
      sectionProgress.scriptDataByScript = {
        [scriptId]: postProcessDataByScript(
          scriptData,
          sectionData.lessonExtras
        )
      };

      if (
        state.currentView === ViewType.STANDARDS &&
        !scriptData.hasStandards
      ) {
        getStore().dispatch(setCurrentView(ViewType.SUMMARY));
      }
    });

  // get the student data
  const numStudents = sectionData.students.length;
  const numPages = Math.ceil(numStudents / NUM_STUDENTS_PER_PAGE);

  const requests = _.range(1, numPages + 1).map(currentPage => {
    const url = `/dashboardapi/section_level_progress/${
      sectionData.id
    }?script_id=${scriptId}&page=${currentPage}&per=${NUM_STUDENTS_PER_PAGE}`;
    return fetch(url, {credentials: 'include'})
      .then(response => response.json())
      .then(data => {
        sectionProgress.studentLevelProgressByScript = {
          [scriptId]: {
            ...sectionProgress.studentLevelProgressByScript[scriptId],
            ...processServerSectionProgress(data.student_progress)
          }
        };
        sectionProgress.studentLastUpdateByScript = {
          [scriptId]: {
            ...sectionProgress.studentLastUpdateByScript[scriptId],
            ...data.student_last_updates
          }
        };
      });
  });

  // Combine and transform the data
  requests.push(scriptRequest);
  Promise.all(requests).then(() => {
    sectionProgress.studentLessonProgressByScript = {
      ...sectionProgress.studentLessonProgressByScript,
      [scriptId]: lessonProgressForSection(
        sectionProgress.studentLevelProgressByScript[scriptId],
        sectionProgress.scriptDataByScript[scriptId].lessons
      )
    };
    getStore().dispatch(addDataByScript(sectionProgress));
    getStore().dispatch(finishLoadingProgress());
    getStore().dispatch(finishRefreshingProgress());

    if (sectionProgress.scriptDataByScript[scriptId].hasStandards) {
      getStore().dispatch(fetchStandardsCoveredForScript(scriptId));
      getStore().dispatch(fetchStudentLevelScores(scriptId, sectionId));
    }
  });
}

function postProcessDataByScript(scriptData, includeBonusLevels) {
  // Filter to match scriptDataPropType
  const filteredScriptData = {
    id: scriptData.id,
    csf: scriptData.csf,
    hasStandards: scriptData.hasStandards,
    title: scriptData.title,
    path: scriptData.path,
    stages: scriptData.lessons,
    family_name: scriptData.family_name,
    version_year: scriptData.version_year,
    name: scriptData.name
  };
  if (!filteredScriptData.stages) {
    return filteredScriptData;
  }
  return {
    ...filteredScriptData,
    stages: filteredScriptData.stages.map(lesson =>
      postProcessLessonData(lesson, includeBonusLevels)
    )
  };
}

function postProcessLessonData(lesson, includeBonusLevels) {
  const levels = includeBonusLevels
    ? lesson.levels
    : lesson.levels.filter(level => !level.bonus);
  return {
    ...lesson,
    levels: levels.map(level => processedLevel(level))
  };
}
