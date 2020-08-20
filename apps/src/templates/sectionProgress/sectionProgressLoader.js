import {ViewType} from './sectionProgressConstants';
import {
  startLoadingProgress,
  setCurrentView,
  finishLoadingProgress,
  addDataByScript
} from './sectionProgressRedux';
import {processedLevel} from '@cdo/apps/templates/progress/progressHelpers';
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
    studentLevelTimeSpentByScript: {},
    studentLevelPairingByScript: {},
    scriptDataByScript: {}
  };

  // Get the script data
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
            ...sectionProgress.studentLevelProgressByScript,
            ...getInfoByStudentByLevel(data.students, getLevelResult)
          }
        };

        sectionProgress.studentTimestampsByScript = {
          [scriptId]: {
            ...sectionProgress.studentTimestampsByScript,
            ...processStudentTimestamps(data.student_timestamps)
          }
        };

        sectionProgress.studentLevelTimeSpentByScript = {
          [scriptId]: {
            ...sectionProgress.studentLevelTimeSpentByScript,
            ...getInfoByStudentByLevel(data.students, level => level.time_spent)
          }
        };

        sectionProgress.studentLevelPairingByScript = {
          [scriptId]: {
            ...sectionProgress.studentLevelPairingByScript,
            ...processStudentPairing(data.students)
          }
        };
      });
  });

  // Combine and transform the data
  requests.push(scriptRequest);
  Promise.all(requests).then(() => {
    sectionProgress.levelsByLessonByScript = postProcessLevelsByLesson(
      scriptId,
      sectionProgress
    );
    sectionProgress.scriptDataByScript[scriptId] = postProcessDataByScript(
      sectionProgress.scriptDataByScript[scriptId]
    );
    getStore().dispatch(addDataByScript(sectionProgress));
    getStore().dispatch(finishLoadingProgress());
  });
}

function processStudentTimestamps(timestamps) {
  const studentTimestamps = _.mapValues(timestamps, seconds => seconds * 1000);
  return studentTimestamps;
}

function processStudentPairing(students) {
  const studentPairing = getStudentPairing(students);
  const isValid = Object.keys(studentPairing).every(userId =>
    Object.keys(studentPairing[userId]).every(
      levelId => typeof studentPairing[userId][levelId] === 'boolean'
    )
  );
  if (!isValid) {
    throw new Error('Input is invalid');
  }
  return studentPairing;
}

function postProcessDataByScript(scriptData) {
  if (!scriptData.stages) {
    return scriptData;
  }
  return {
    ...scriptData,
    stages: scriptData.stages.map(stage => {
      return {
        ...stage,
        levels: stage.levels.map(level => processedLevel(level))
      };
    })
  };
}

function postProcessLevelsByLesson(scriptId, progress) {
  const studentLevelProgress =
    progress.studentLevelProgressByScript[scriptId] || {};
  const studentTimeSpent =
    progress.studentLevelTimeSpentByScript[scriptId] || {};
  const pairing = progress.studentLevelPairingByScript[scriptId];
  const scriptData = progress.scriptDataByScript[scriptId];
  let levelsByLessonByStudent = {};
  for (const studentId of Object.keys(studentLevelProgress)) {
    levelsByLessonByStudent[studentId] = levelsByLesson({
      stages: scriptData.stages,
      levelProgress: studentLevelProgress[studentId],
      levelTimeSpent: studentTimeSpent[studentId],
      levelPairing: pairing[studentId],
      currentLevelId: null
    });
  }
  return {[scriptId]: levelsByLessonByStudent};
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
