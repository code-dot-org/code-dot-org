import Alert from '@code-dot-org/component-library/alert';
import React, {useMemo} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './teacherViewingStudentProjectAlert.module.scss';

type TeacherViewingStudentProjectAlertProps = {
  viewAsUserId: number | null;
};

const TeacherViewingStudentProjectAlert: React.FC<
  TeacherViewingStudentProjectAlertProps
> = ({viewAsUserId}) => {
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
    const student = studentsInSection?.find(s => s.id === viewAsUserId);
    return student?.name;
  }, [viewAsUserId, studentsInSection]);

  const alertText = levelNotStarted ? (
    <>
      <strong>{selectedStudentName}</strong> has not started the level.
    </>
  ) : (
    <>
      You are viewing <strong>{selectedStudentName}'s</strong> project in read
      only mode.
    </>
  );

  return (
    <Alert
      className={moduleStyles.alertBanner}
      text={alertText}
      type="info"
      size="xs"
    />
  );
};

export default TeacherViewingStudentProjectAlert;
