import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {SectionCardBody} from './SectionCardBody';
import {SectionOptionsDropdown} from './SectionOptionsDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  section: Section;
}

export const SectionCard: React.FC<SectionCardProps> = ({section}) => {
  return (
    <div className={styles.sectionCardWrapper}>
      <div className={styles.sectionCardHeader}>
        <div className={styles.sectionCardHeaderLeft}>
          <div className={styles.sectionCardHeaderText}>
            <Heading5>{section.name}</Heading5>
          </div>
          <div className={styles.sectionCardCode}>
            <OverlineOneText>
              {i18n.classCode()}
              <a href={teacherDashboardUrl(section.id, '/login_info')}>
                {section.code}
              </a>
            </OverlineOneText>
          </div>
        </div>
        <div className={styles.sectionCardHeaderRight}>
          <SectionOptionsDropdown sectionId={section.id} />
        </div>
      </div>
      {!section.hidden && <SectionCardBody section={section} />}
    </div>
  );
};
