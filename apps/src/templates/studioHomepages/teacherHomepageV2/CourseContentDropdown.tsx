import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
}

export const CourseContentDropdown: React.FC<CourseContentDropdownProps> = ({
  section,
}) => {
  return (
    <div className={styles.courseContentDropdownContainer}>
      {section.courseDisplayName}
    </div>
  );
};
