import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import {TEACHER_NAVIGATION_PATHS} from '../../teacherNavigation/TeacherNavigationPaths';

import {CourseContentDropdown} from './CourseContentDropdown';
import {EmptyStateButton} from './EmptyStateButton';
import {TaskButton} from './TaskButton';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

export const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  return (
    <div className={styles.sectionCardBody}>
      <div className={styles.sectionCardBodyLeft}>
        {section.courseId ? (
          <CourseContentDropdown section={section} />
        ) : (
          <EmptyStateButton
            buttonText={i18n.assignACourseButton()}
            icon={'book-open-cover'}
            sectionId={section.id}
            path={TEACHER_NAVIGATION_PATHS.settings}
          />
        )}
      </div>
      <div className={styles.sectionCardBodyRight}>
        {section.studentCount > 0 ? (
          <TaskButton
            buttonText={i18n.viewProgressButton()}
            icon={'chart-line'}
            sectionId={section.id}
            path={TEACHER_NAVIGATION_PATHS.progress}
          />
        ) : (
          <EmptyStateButton
            buttonText={i18n.addStudents()}
            icon={'users'}
            sectionId={section.id}
            path={TEACHER_NAVIGATION_PATHS.roster}
          />
        )}
        {section.courseId && (
          <TaskButton
            buttonText={i18n.viewLessonMaterialsButton()}
            icon={'folder-open'}
            sectionId={section.id}
            path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
          />
        )}
      </div>
    </div>
  );
};
