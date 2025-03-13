import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from '../../teacherNavigation/TeacherNavigationPaths';

import {CourseContentDropdown} from './CourseContentDropdown';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

export const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  return (
    <div className={styles.sectionCardBody}>
      <CourseContentDropdown section={section} />
      <div className={styles.sectionCardBodyRight}>
        <TaskButton
          buttonText={i18n.viewProgressButton()}
          icon={'chart-line'}
          sectionId={section.id}
          path={TEACHER_NAVIGATION_PATHS.progress}
        />
        <TaskButton
          buttonText={i18n.viewLessonMaterialsButton()}
          icon={'folder-open'}
          sectionId={section.id}
          path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
        />
      </div>
    </div>
  );
};
