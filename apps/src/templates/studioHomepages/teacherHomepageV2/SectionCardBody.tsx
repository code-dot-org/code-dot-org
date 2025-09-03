import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
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

const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
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
            path={'/catalog'}
          />
        )}
      </div>
      <div className={styles.sectionCardBodyRight}>
        {section.studentCount > 0 && section.courseId ? (
          <TaskButton
            buttonText={i18n.viewProgressButton()}
            icon={'chart-line'}
            sectionId={section.id}
            sectionName={section.name}
            path={TEACHER_NAVIGATION_PATHS.progress}
          />
        ) : section.studentCount > 0 && !section.courseId ? (
          <div className={styles.studentsAddedAlert}>
            <div className={styles.taskButtonLeft}>
              <FontAwesomeV6Icon
                className={styles.studentAddedAlertIcon}
                iconName={'check-circle'}
                iconStyle={'solid'}
              />
              <BodyThreeText>
                {i18n.studentsAdded({numStudents: section.studentCount})}
              </BodyThreeText>
            </div>
          </div>
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
            sectionName={section.name}
            path={TEACHER_NAVIGATION_PATHS.lessonMaterials}
          />
        )}
      </div>
    </div>
  );
};

export default SectionCardBody;
