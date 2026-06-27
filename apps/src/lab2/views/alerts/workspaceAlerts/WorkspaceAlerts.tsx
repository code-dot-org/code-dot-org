import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import PairingNavigatorAlert from '../pairingNavigator';
import PreviousVersionAlert from '../previousVersion';
import TeacherViewingStudentProjectAlert from '../teacherViewingStudentProject';

type WorkspaceAlertsProps = {
  /** Is the alert displayed within the workspace area */
  inWorkspaceContainer?: boolean;
  /** Does the app type have a standalone project level? */
  hasStandaloneProjectLevel?: boolean;
};

// Bundles the alerts shown at the top of a lab2 workspace: the
// teacher-viewing-student banner (gated on viewing a student's project) and
// the previous-version banner (self-gating).
const WorkspaceAlerts: React.FC<WorkspaceAlertsProps> = ({
  inWorkspaceContainer,
  hasStandaloneProjectLevel = true,
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
      <PairingNavigatorAlert
        inWorkspaceContainer={inWorkspaceContainer}
        isTeacherViewingStudent={teacherViewingStudent}
        doesAppTypeHaveStandaloneProjectLevel={hasStandaloneProjectLevel}
      />
      <PreviousVersionAlert />
    </>
  );
};

export default WorkspaceAlerts;
