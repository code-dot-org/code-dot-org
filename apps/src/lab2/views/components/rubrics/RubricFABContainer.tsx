import React, {useEffect, useMemo} from 'react';

import {isLabLoading} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {isUsingResourcePanel} from '@cdo/apps/lab2/utils';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useRubric} from './RubricWrapper';

/**
 * Lab2 container for the teacher-facing rubrics entrypoint {@link RubricFloatingActionButton}
 * which provides rubric data from {@link useRubric} and provides student progress information from
 * redux (as opposed to page script data which is only refreshed on page load.)
 */
const RubricFABContainer: React.FC = () => {
  const {rubricData, showRubric, isLoading: isLoadingRubric} = useRubric();

  const currentLevelName = useAppSelector(
    state => state.lab.levelProperties?.name
  );
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
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
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const isProjectLevel = useAppSelector(
    state => state.lab.levelProperties?.isProjectLevel
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

  const reportingData = useMemo(
    () => ({
      unitName,
      courseName,
      levelName: currentLevelName,
    }),
    [unitName, courseName, currentLevelName]
  );

  const canShow =
    appName &&
    isTeacher &&
    showRubric &&
    !labLoading &&
    !isLoadingRubric &&
    rubricData &&
    // Only show the rubric FAB is the resource panel is enabled
    isUsingResourcePanel(appName, isProjectLevel || false);

  // Temporary hack: show/hide the AI Differentiation FAB based on if the Rubric FAB is showing.
  // Note that currently, the AI Diff FAB will be out of date on Lab2 levels since it relies on
  // script data only fetched on page load.
  // Longer term, we should fetch data for the AI Diff FAB asynchronously and conditionally mount it
  // like we do for the Rubric FAB.
  useEffect(() => {
    const aiDiffFab = document.getElementById(
      'ai-differentiation-fab-mount-point'
    );
    if (!aiDiffFab || aiDiffFab.children.length === 0) {
      return;
    }

    aiDiffFab.style.visibility = canShow ? 'hidden' : 'visible';
  }, [canShow]);

  if (!canShow) {
    return null;
  }

  const {rubric, canShowTaScoresAlert} = rubricData!;

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

export default RubricFABContainer;
