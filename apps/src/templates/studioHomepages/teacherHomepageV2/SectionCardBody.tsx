import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {
  TEACHER_NAVIGATION_SECTIONS_URL,
  TEACHER_NAVIGATION_PATHS,
} from '@cdo/apps/templates/teacherNavigation/TeacherNavigationPaths';
import i18n from '@cdo/locale';

import {CourseContentDropdown} from './CourseContentDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

export const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  const navigate = useNavigate();
  return (
    <div className={styles.sectionCardBody}>
      <CourseContentDropdown section={section} />
      <div className={styles.sectionCardBodyRight}>
        <button
          type={'button'}
          className={styles.taskButtons}
          onClick={() =>
            navigate(
              `${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.progress}`
            )
          }
        >
          <div className={styles.taskButtonLeft}>
            <FontAwesomeV6Icon
              className={styles.taskButtonIcons}
              iconName={'chart-line'}
              iconStyle={'solid'}
            />
            <BodyThreeText style={{marginBottom: 0}}>
              {i18n.viewProgressButton()}
            </BodyThreeText>
          </div>
          <FontAwesomeV6Icon
            className={styles.taskButtonArrow}
            iconName={'arrow-right'}
            iconStyle={'solid'}
          />
        </button>
        <button
          type={'button'}
          className={styles.taskButtons}
          onClick={() =>
            navigate(
              `${TEACHER_NAVIGATION_SECTIONS_URL}/${section.id}/${TEACHER_NAVIGATION_PATHS.lessonMaterials}`
            )
          }
        >
          <div className={styles.taskButtonLeft}>
            <FontAwesomeV6Icon
              className={styles.taskButtonIcons}
              iconName={'folder-open'}
              iconStyle={'solid'}
            />
            <BodyThreeText style={{marginBottom: 0}}>
              {i18n.viewLessonMaterialsButton()}
            </BodyThreeText>
          </div>
          <FontAwesomeV6Icon
            className={styles.taskButtonArrow}
            iconName={'arrow-right'}
            iconStyle={'solid'}
          />
        </button>
      </div>
    </div>
  );
};
