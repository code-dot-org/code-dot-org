import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface CourseContentDropdownProps {
  section: Section;
}

export const CourseContentDropdown: React.FC<CourseContentDropdownProps> = ({
  section,
}) => {
  return (
    <div className={styles.courseContentDropdownContainer}>
      <BodyThreeText>
        <b>{`${i18n.course()}: `}</b>
        {section.courseDisplayName}
      </BodyThreeText>
    </div>
  );
};
