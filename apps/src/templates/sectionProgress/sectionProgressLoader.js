import {ViewType} from './sectionProgressConstants';
import {
  startLoadingProgress,
  setCurrentView,
  finishLoadingProgress,
  addDataByUnit,
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
import logToCloud from '@cdo/apps/logToCloud';

const NUM_STUDENTS_PER_PAGE = 20;

export function loadScriptProgress(scriptId, sectionId) {
  const state = getStore().getState().sectionProgress;
  const sectionData = getStore().getState().teacherSections.sections[sectionId];
  const students = getStore().getState().teacherSections.selectedStudents;

  // TODO: Save Standards data in a way that allows us
  // not to reload all data to get correct standards data
  if (
    state.studentLevelProgressByUnit[scriptId] &&
    state.unitDataByUnit[scriptId] &&
    state.currentView !== ViewType.STANDARDS
  ) {
    if (state.isRefreshingProgress) {
      return;
    }
    // Continue displaying the UI while updating the data
    getStore().dispatch(startRefreshingProgress());
  } else {
    getStore().dispatch(startLoadingProgress());
    logToCloud.addPageAction(logToCloud.PageAction.LoadScriptProgressStarted, {
      sectionId,
      scriptId
    });
  }

  let sectionProgress = {
    unitDataByUnit: {},
    studentLevelProgressByUnit: {},
    studentLessonProgressByUnit: {},
    studentLastUpdateByUnit: {}
  };

  // Get the script data
  const scriptRequest = fetch(`/dashboardapi/script_structure/${scriptId}`, {
    credentials: 'include'
  })
    .then(response => response.json())
    .then(scriptData => {
      sectionProgress.unitDataByUnit = {
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

  const numPages = Math.ceil(students.length / NUM_STUDENTS_PER_PAGE);

  const requests = _.range(1, numPages + 1).map(currentPage => {
    const url = `/dashboardapi/section_level_progress/${
      sectionData.id
    }?script_id=${scriptId}&page=${currentPage}&per=${NUM_STUDENTS_PER_PAGE}`;
    return fetch(url, {credentials: 'include'})
      .then(response => response.json())
      .then(data => {
        sectionProgress.studentLevelProgressByUnit = {
          [scriptId]: {
            ...sectionProgress.studentLevelProgressByUnit[scriptId],
            ...processServerSectionProgress(data.student_progress)
          }
        };
        sectionProgress.studentLastUpdateByUnit = {
          [scriptId]: {
            ...sectionProgress.studentLastUpdateByUnit[scriptId],
            ...data.student_last_updates
          }
        };
      });
  });

  // Combine and transform the data
  requests.push(scriptRequest);
  Promise.all(requests).then(() => {
    logToCloud.addPageAction(logToCloud.PageAction.LoadScriptProgressFinished, {
      sectionId,
      scriptId
    });

    sectionProgress.studentLessonProgressByUnit = {
      ...sectionProgress.studentLessonProgressByUnit,
      [scriptId]: lessonProgressForSection(
        sectionProgress.studentLevelProgressByUnit[scriptId],
        sectionProgress.unitDataByUnit[scriptId].lessons
      )
    };
    getStore().dispatch(addDataByUnit(sectionProgress));
    getStore().dispatch(finishLoadingProgress());
    getStore().dispatch(finishRefreshingProgress());

    if (sectionProgress.unitDataByUnit[scriptId].hasStandards) {
      getStore().dispatch(fetchStandardsCoveredForScript(scriptId));
      getStore().dispatch(fetchStudentLevelScores(scriptId, sectionId));
    }
  });
}

function postProcessDataByScript(scriptData, includeBonusLevels) {
  // Filter to match scriptDataPropType
  const filteredScriptData = {
    id: scriptData.id,
    csf: !!scriptData.csf,
    isCsd: scriptData.isCsd,
    isCsp: scriptData.isCsp,
    hasStandards: scriptData.hasStandards,
    title: scriptData.title,
    path: scriptData.path,
    lessons: scriptData.lessons,
    family_name: scriptData.family_name,
    version_year: scriptData.version_year,
    name: scriptData.name
  };
  if (!filteredScriptData.lessons) {
    return filteredScriptData;
  }
  return {
    ...filteredScriptData,
    lessons: filteredScriptData.lessons.map(lesson =>
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
