import React, {useEffect, useState} from 'react';

import {
  getCurrentLesson,
  getCurrentLevel,
  levelById,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {RootState} from '@cdo/apps/types/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// TODO: Can we dedupe these with rubricShapes.js?
interface EvidenceLevel {
  understanding: number;
  teacherDescription: string;
}

interface LearningGoal {
  key: string;
  learningGoal: string;
  aiEnabled: boolean;
  tips: string | null;
  evidenceLevels: EvidenceLevel[];
}

interface Rubric {
  learningGoals: LearningGoal[];
  script: {id: number};
  lesson: {
    position: number;
    name: string;
  };
  level: {id: number};
}

interface StudentLevelInfo {
  name: string;
  attempts: number;
  timeSpent: number;
  lastAttempt: string;
  user_id: number;
}

interface RubricResponse {
  rubric: Rubric;
  canShowTaScoresAlert: boolean;
}

// TODO: Dedupe with progressReduxSelectors.js
const getStudentLevelInfoPath = (state: RootState) => {
  if (!state.progress.lessons || !state.progress.viewAsUserId) {
    return;
  }
  const viewAsUserId = state.progress.viewAsUserId;
  const scriptName = state.progress.scriptName;
  const currentLesson = getCurrentLesson(state);
  if (!currentLesson) {
    return;
  }
  const lessonPosition = currentLesson.relative_position;

  let levelPosition, sublevelPosition;
  const currentLevel = getCurrentLevel(state);
  levelPosition = currentLevel.levelNumber;

  // Use the sublevel position if we're on a sublevel
  if (currentLevel.parentLevelId) {
    const parentLevel = levelById(
      state.progress,
      state.progress.currentLessonId,
      currentLevel.parentLevelId
    );
    levelPosition = parentLevel.levelNumber;
    sublevelPosition = currentLevel.levelNumber;
  }

  const sublevelSegment =
    sublevelPosition === undefined ? '' : `sublevel/${sublevelPosition}/`;

  // TODO: TEACH-1864
  // use /courses/:course_name/units/:unit_position/... instead of /s/
  return `/s/${scriptName}/lessons/${lessonPosition}/levels/${levelPosition}/${sublevelSegment}rubric_student_level_info?user_id=${viewAsUserId}`;
};

function useFetchData<T>(path?: string) {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!path) {
      return;
    }

    setData(undefined);
    setIsLoading(true);
    HttpClient.fetchJson<T>(path)
      .then(response => setData(response.value))
      .catch(error =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError(`Error fetching data from ${path}`, error)
      )
      .finally(() => setIsLoading(false));
  }, [path]);

  return {data, isLoading};
}

const RubricWrapper: React.FC = () => {
  const rubricPath = useAppSelector(state =>
    state.progress.currentLessonId
      ? `/lessons/${state.progress.currentLessonId}/rubric`
      : undefined
  );
  const studentLevelInfoPath = useAppSelector(getStudentLevelInfoPath);
  const currentLevelName = useAppSelector(
    state => getCurrentLevel(state)?.name
  );
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const showRubric = useAppSelector(
    state => state.lab.levelProperties?.showRubric
  );

  const {data: rubricData, isLoading: isLoadingRubric} =
    useFetchData<RubricResponse>(rubricPath);

  const {data: studentLevelInfo, isLoading: isLoadingStudentLevelInfo} =
    useFetchData<StudentLevelInfo>(studentLevelInfoPath);

  if (
    !isTeacher ||
    !showRubric ||
    isLoadingRubric ||
    isLoadingStudentLevelInfo ||
    !rubricData
  ) {
    return null;
  }

  const {rubric, canShowTaScoresAlert} = rubricData;

  // FIX
  const reportingData = {
    unitName: 'config.script_name',
    courseName: 'config.course_name',
    levelName: currentLevelName,
  };

  return (
    <div data-theme="Light">
      <RubricFloatingActionButton
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        currentLevelName={currentLevelName}
        aiEnabled={rubric.learningGoals.some(lg => lg.aiEnabled)}
        canShowTaScoresAlert={canShowTaScoresAlert}
      />
    </div>
  );
};

export default RubricWrapper;
