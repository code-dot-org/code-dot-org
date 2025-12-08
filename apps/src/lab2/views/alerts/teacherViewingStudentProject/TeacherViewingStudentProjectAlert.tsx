import Alert from '@code-dot-org/component-library/alert';
import React, {useMemo} from 'react';

import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import moduleStyles from './teacherViewingStudentProjectAlert.module.scss';

const TeacherViewingStudentProjectAlert: React.FC = () => {
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);
  const studentsInSection = useAppSelector(
    state => state.teacherSections.selectedStudents
  );

  // Get the name of the student being viewed to use in the alert text.
  const selectedStudentName = useMemo(() => {
    const student = studentsInSection?.find(s => s.id === viewAsUserId);
    return student?.name;
  }, [viewAsUserId, studentsInSection]);

  // Determine if the current level has not been started.
  const levelNotStarted = useAppSelector(
    state => getCurrentLevel(state)?.status === LevelStatus.not_tried
  );

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
