import {ViewType} from './sectionProgressConstants';
import {
  startLoadingProgress,
  setCurrentView,
  finishLoadingProgress,
  addDataByScript
} from './sectionProgressRedux';
import {
  fetchStandardsCoveredForScript,
  fetchStudentLevelScores
} from '@cdo/apps/templates/sectionProgress/standards/sectionStandardsProgressRedux';
import {
  levelsByLesson,
  getLevelResult
} from '@cdo/apps/code-studio/progressRedux';
import {getStore} from '@cdo/apps/redux';
import _ from 'lodash';

const NUM_STUDENTS_PER_PAGE = 50;

export function loadScript(scriptId, sectionId) {
  const state = getStore().getState().sectionProgress;
  const sectionData = getStore().getState().sectionData.section;

  // Don't load data if it's already stored in redux.
  // TODO: Save Standards data in a way that allows us
  // not to reload all data to get correct standards data
  if (
    state.studentLevelProgressByScript[scriptId] &&
    state.scriptDataByScript[scriptId] &&
    state.currentView !== ViewType.STANDARDS
  ) {
    return;
  }

  let sectionProgress = {
    studentLevelProgressByScript: {},
    studentTimestampsByScript: {},
    studentLevelPairingByScript: {}
  };

  getStore().dispatch(startLoadingProgress());
  const scriptRequest = fetch(`/dashboardapi/script_structure/${scriptId}`, {
    credentials: 'include'
  })
    .then(response => response.json())
    .then(scriptData => {
      // Filter to match scriptDataPropType
      const filteredScriptData = {
        id: scriptData.id,
        csf: scriptData.csf,
        hasStandards: scriptData.hasStandards,
        title: scriptData.title,
        path: scriptData.path,
        stages: scriptData.lessons,
        family_name: scriptData.family_name,
        version_year: scriptData.version_year
      };
      sectionProgress.scriptDataByScript = {[scriptId]: filteredScriptData};

      if (scriptData.hasStandards) {
        getStore().dispatch(fetchStandardsCoveredForScript(scriptId));
        getStore().dispatch(fetchStudentLevelScores(scriptId, sectionId));
      }
      if (
        state.currentView === ViewType.STANDARDS &&
        !scriptData.hasStandards
      ) {
        getStore().dispatch(setCurrentView(ViewType.SUMMARY));
      }
    });

  const numStudents = sectionData.students.length;
  const numPages = Math.ceil(numStudents / NUM_STUDENTS_PER_PAGE);

  const requests = _.range(1, numPages + 1).map(currentPage => {
    const url = `/dashboardapi/section_level_progress/${
      sectionData.id
    }?script_id=${scriptId}&page=${currentPage}&per=${NUM_STUDENTS_PER_PAGE}`;
    return fetch(url, {credentials: 'include'})
      .then(response => response.json())
      .then(data => {
        const dataByStudent = data.students;
        sectionProgress.studentLevelProgressByScript = {
          [scriptId]: {
            ...sectionProgress.studentLevelProgressByScript,
            ...getStudentLevelResult(dataByStudent)
          }
        };

        const studentTimestamps = _.mapValues(
          data.student_timestamps,
          seconds => seconds * 1000
        );
        sectionProgress.studentTimestampsByScript = {
          [scriptId]: {
            ...sectionProgress.studentTimestampsByScript,
            ...studentTimestamps
          }
        };

        const studentPairing = getStudentPairing(dataByStudent);
        const isValid = Object.keys(studentPairing).every(userId =>
          Object.keys(studentPairing[userId]).every(
            levelId => typeof studentPairing[userId][levelId] === 'boolean'
          )
        );
        if (!isValid) {
          throw new Error('Input is invalid');
        }
        sectionProgress.studentLevelPairingByScript = {
          [scriptId]: {
            ...sectionProgress.studentLevelPairingByScript,
            ...studentPairing
          }
        };
      });
  });

  requests.push(scriptRequest);
  debugger;
  Promise.all(requests).then(() => {
    debugger;
    const studentLevelProgress =
      sectionProgress.studentLevelProgressByScript[scriptId];
    const studentLevelPairing =
      sectionProgress.studentLevelPairingByScript[scriptId];
    const scriptData = sectionProgress.scriptDataByScript[scriptId];
    let levelsByLessonByStudent = {};
    for (const studentId of Object.keys(studentLevelProgress)) {
      levelsByLessonByStudent[studentId] = levelsByLesson({
        stages: scriptData.stages,
        levelProgress: studentLevelProgress[studentId],
        levelPairing: studentLevelPairing[studentId],
        currentLevelId: null
      });
    }
    sectionProgress.levelsByLessonByScript = {
      [scriptId]: levelsByLessonByStudent
    };
    getStore().dispatch(addDataByScript(scriptId, sectionProgress));
    getStore().dispatch(finishLoadingProgress());
  });
}

export function getStudentLevelResult(dataByStudent) {
  return getInfoByStudentByLevel(dataByStudent, getLevelResult);
}

function getStudentPairing(dataByStudent) {
  return getInfoByStudentByLevel(
    dataByStudent,
    levelData => !!levelData.paired
  );
}

function getInfoByStudentByLevel(dataByStudent, infoFromLevelData) {
  return _.mapValues(dataByStudent, studentData =>
    _.mapValues(studentData, infoFromLevelData)
  );
}
