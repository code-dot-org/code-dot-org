import React from 'react';
import {generatePath} from 'react-router';
import {Navigate} from 'react-router-dom';

import {
  getSectionRouterPath,
  TEACHER_DASHBOARD_PATHS,
} from './TeacherDashboardPaths';

interface DefaultPageRedirectProps {
  sectionId: number;
  studentCount: number;
}

const DefaultTeacherNavRedirect: React.FC<DefaultPageRedirectProps> = ({
  sectionId,
  studentCount,
}) => {
  return (
    <Navigate
      to={generatePath(
        getSectionRouterPath(
          studentCount === 0
            ? TEACHER_DASHBOARD_PATHS.manageStudents
            : TEACHER_DASHBOARD_PATHS.progress
        ),
        {sectionId: sectionId}
      )}
      replace={true}
    />
  );
};

export default DefaultTeacherNavRedirect;
