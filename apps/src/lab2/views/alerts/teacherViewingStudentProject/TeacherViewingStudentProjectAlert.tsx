import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef, useState} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './teacherViewingStudentProjectAlert.module.scss';

type TeacherViewingStudentProjectAlertProps = {
  /** Is alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
  /** Optional custom className */
  className?: string;
  /**
   * For a quiz level, the state of the student's attempt. Takes
   * the place of level progress, which can't tell in progress from submitted.
   */
  attemptStatus?: 'notStarted' | 'inProgress' | 'submitted';
};

const TeacherViewingStudentProjectAlert: React.FC<
  TeacherViewingStudentProjectAlertProps
> = ({inWorkspaceContainer, className, attemptStatus}) => {
  // Get the user ID of the student whose project is being viewed.
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  // Get the list of students in the selected section.
  const studentsInSection = useAppSelector(
    state => state.teacherSections.selectedStudents
  );

  // Determine if the current level has not been started.
  const levelNotStarted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.not_tried
  );

  // Get unitProgress to detect when progress data has been updated.
  const unitProgress = useAppSelector(state => state.progress.unitProgress);

  // Track loading state when switching between students.
  // Progress data (levelNotStarted) may lag behind viewAsUserId updates.
  const previousViewAsUserIdRef = useRef<number | null | undefined>(undefined);
  const [isLoadingLevelProgress, setIsLoadingLevelProgress] = useState(true);

  // When viewAsUserId changes, mark as loading until progress catches up.
  useEffect(() => {
    if (previousViewAsUserIdRef.current !== viewAsUserId) {
      setIsLoadingLevelProgress(true);
      previousViewAsUserIdRef.current = viewAsUserId;
    }
  }, [viewAsUserId]);

  // When unitProgress updates, progress has loaded for the new student.
  useEffect(() => {
    if (isLoadingLevelProgress) {
      setIsLoadingLevelProgress(false);
    }
  }, [unitProgress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get the name of the student being viewed to use in the alert text.
  const selectedStudentName = useMemo(() => {
    if (viewAsUserId === null) {
      return undefined;
    }

    const student = studentsInSection?.find(s => s.id === viewAsUserId);
    return student?.name;
  }, [viewAsUserId, studentsInSection]);

  const attemptAlertText =
    attemptStatus === 'notStarted' ? (
      <>
        <strong>{selectedStudentName ?? 'This student'}</strong> hasn't started
        this level.
      </>
    ) : attemptStatus === 'inProgress' ? (
      <>
        <strong>{selectedStudentName ?? 'This student'}</strong> is still
        working on this assessment.
      </>
    ) : (
      <>
        You are viewing{' '}
        <strong>{selectedStudentName ?? 'this student'}'s</strong> work in read
        only mode.
      </>
    );

  // Show a generic message while loading to avoid toggling stale status.
  const alertText = attemptStatus ? (
    attemptAlertText
  ) : isLoadingLevelProgress ? (
    <>
      Loading <strong>{selectedStudentName ?? 'student'}'s</strong> project...
    </>
  ) : levelNotStarted ? (
    <>
      <strong>{selectedStudentName ?? 'This student'}</strong> has not started
      the level.
    </>
  ) : (
    <>
      You are viewing <strong>{selectedStudentName ?? 'this student'}'s</strong>{' '}
      project in read only mode.
    </>
  );

  return (
    <Alert
      className={classNames(
        inWorkspaceContainer && moduleStyles.inWorkspaceContainer,
        attemptStatus === 'inProgress' && moduleStyles.warningBorder,
        className
      )}
      text={alertText}
      type={attemptStatus === 'inProgress' ? 'warning' : 'info'}
      size="xs"
    />
  );
};

export default TeacherViewingStudentProjectAlert;
