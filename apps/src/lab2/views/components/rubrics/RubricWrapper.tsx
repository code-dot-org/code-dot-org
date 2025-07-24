import React, {useEffect, useMemo, useState} from 'react';

import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isLabLoading} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {RubricData} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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
  const rubricPath = useAppSelector(state => {
    const rubricId = getCurrentLesson(state)?.rubric?.id;
    if (rubricId) {
      return `/rubrics/${rubricId}`;
    }
  });
  const currentLevelName = useAppSelector(
    state => state.lab.levelProperties?.name
  );
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const showRubric = useAppSelector(
    state => state.lab.levelProperties?.showRubric
  );
  const labLoading = useAppSelector(isLabLoading);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const levelsWithProgress = useAppSelector(
    state => state.teacherPanel.levelsWithProgress
  );
  const students = useAppSelector(
    state => state.teacherSections.selectedStudents
  );
  const studentLevelInfo = useMemo(() => {
    const userLevel = levelsWithProgress?.find(
      ul => ul.userId === viewAsUserId
    );
    const selectedStudent = students?.find(s => s.id === viewAsUserId);

    if (!viewAsUserId || !userLevel || !selectedStudent) {
      return;
    }

    return {
      name: selectedStudent.name,
      user_id: viewAsUserId,
      timeSpent: userLevel.timeSpent,
      attempts: userLevel.attempts,
      lastAttempt: userLevel.updatedAt,
    };
  }, [viewAsUserId, levelsWithProgress, students]);

  const {data: rubricData, isLoading: isLoadingRubric} =
    useFetchData<RubricData>(rubricPath);

  if (
    !isTeacher ||
    !showRubric ||
    labLoading ||
    isLoadingRubric ||
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
        aiEnabled={rubric.learningGoals?.some(lg => lg?.aiEnabled)}
        canShowTaScoresAlert={canShowTaScoresAlert}
      />
    </div>
  );
};

export default RubricWrapper;
