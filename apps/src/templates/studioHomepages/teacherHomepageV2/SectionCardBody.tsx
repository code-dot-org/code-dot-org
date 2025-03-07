import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import {CourseContentDropdown} from './CourseContentDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardBodyProps {
  section: Section;
}

export const SectionCardBody: React.FC<SectionCardBodyProps> = ({section}) => {
  return (
    <div className={styles.sectionCardBody}>
      <CourseContentDropdown section={section} />
      <div className={styles.sectionCardBodyRight}>
        <button type={'button'} className={styles.taskButtons}>
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
        <button type={'button'} className={styles.taskButtons}>
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
