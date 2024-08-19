import React from 'react';
import {generatePath, Navigate} from 'react-router-dom';

import {TEACHER_NAVIGATION_PATHS} from './TeacherNavigationPaths';

interface DefaultTeacherNavRedirectProps {
  sectionId: number | undefined;
  studentCount: number;
}

const DefaultTeacherNavRedirect: React.FC<DefaultTeacherNavRedirectProps> = ({
  sectionId,
  studentCount,
}) => {
  return (
    <Navigate
      to={generatePath(
        studentCount === 0
          ? TEACHER_NAVIGATION_PATHS.manageStudents
          : TEACHER_NAVIGATION_PATHS.progress,
        {sectionId: sectionId}
      )}
      replace={true}
    />
  );
};

export default DefaultTeacherNavRedirect;
