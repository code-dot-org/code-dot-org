import Alert from '@code-dot-org/component-library/alert';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './teacherViewingStudentProjectAlert.module.scss';

type TeacherViewingStudentProjectAlertProps = {
  /** Is alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
  /** Optional custom className */
  className?: string;
};

const TeacherViewingStudentProjectAlert: React.FC<
  TeacherViewingStudentProjectAlertProps
> = ({inWorkspaceContainer, className}) => {
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

  // Get the name of the student being viewed to use in the alert text.
  const selectedStudentName = useMemo(() => {
    if (viewAsUserId === null) {
      return undefined;
    }

    const student = studentsInSection?.find(s => s.id === viewAsUserId);
    return student?.name;
  }, [viewAsUserId, studentsInSection]);

  const alertText = levelNotStarted ? (
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
        className
      )}
      text={alertText}
      type="info"
      size="xs"
    />
  );
};

export default TeacherViewingStudentProjectAlert;
