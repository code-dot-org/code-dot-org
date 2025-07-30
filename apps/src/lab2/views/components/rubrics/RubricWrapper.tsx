import React, {useEffect, useMemo, useState} from 'react';

import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isLabLoading} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {RubricData} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Lab2 wrapper around the teacher-facing rubrics entrypoint {@link RubricFloatingActionButton}
 * which loads the lesson rubric asynchronously and provides student progress information from
 * redux (as opposed to page script data which is only refreshed on page load.)
 */
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
  const courseName = useAppSelector(state => state.progress.courseName);
  const unitName = useAppSelector(state => state.progress.scriptName);

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

  const reportingData = useMemo(
    () => ({
      unitName,
      courseName,
      levelName: currentLevelName,
    }),
    [unitName, courseName, currentLevelName]
  );

  const [rubricData, setRubricData] = useState<RubricData>();
  const [isLoadingRubric, setIsLoadingRubric] = useState(false);

  useEffect(() => {
    if (!rubricPath) {
      return;
    }

    setRubricData(undefined);
    setIsLoadingRubric(true);
    HttpClient.fetchJson<RubricData>(rubricPath)
      .then(response => setRubricData(response.value))
      .catch(error =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError(`Error fetching rubric data`, error)
      )
      .finally(() => setIsLoadingRubric(false));
  }, [rubricPath]);

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

  return (
    // Force light mode for the rubric FAB and dialog as they are not fully themed currently.
    <div data-theme="Light">
      <RubricFloatingActionButton
        rubric={rubric}
        studentLevelInfo={studentLevelInfo}
        reportingData={reportingData}
        currentLevelName={currentLevelName}
        aiEnabled={rubric.learningGoals?.some(lg => lg?.aiEnabled)}
        canShowTaScoresAlert={canShowTaScoresAlert}
        reloadOnStudentChange={false}
      />
    </div>
  );
};

export default RubricWrapper;
