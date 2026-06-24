import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PairingNavigatorAlert from '../pairingNavigator';
import PreviousVersionAlert from '../previousVersion';
import TeacherViewingStudentProjectAlert from '../teacherViewingStudentProject';

type WorkspaceAlertsProps = {
  /** Is the alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
};

// Bundles the alerts shown at the top of a lab2 workspace: the
// teacher-viewing-student banner (gated on viewing a student's project) and
// the previous-version banner (self-gating).
const WorkspaceAlerts: React.FC<WorkspaceAlertsProps> = ({
  inWorkspaceContainer,
}) => {
  const teacherViewingStudent = Boolean(
    useAppSelector(state => state.progress.viewAsUserId)
  );

  return (
    <>
      {teacherViewingStudent && (
        <TeacherViewingStudentProjectAlert
          inWorkspaceContainer={inWorkspaceContainer}
        />
      )}
      {teacherViewingStudent ? (
        <PairingNavigatorAlert
          inWorkspaceContainer={inWorkspaceContainer}
          isTeacherViewingStudent={true}
        />
      ) : (
        <PairingNavigatorAlert inWorkspaceContainer={inWorkspaceContainer} />
      )}
      <PreviousVersionAlert />
    </>
  );
};

export default WorkspaceAlerts;
