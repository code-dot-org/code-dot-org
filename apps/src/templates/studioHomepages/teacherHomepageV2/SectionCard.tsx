import Button from '@code-dot-org/component-library/button';
import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import {teacherDashboardUrl} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  section: Section;
}

export const SectionCard: React.FC<SectionCardProps> = ({section}) => {
  const onDropdownButtonClick = () => {
    // open dropdown modal
  };

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
          <Button
            isIconOnly
            icon={{iconName: 'ellipsis-vertical'}}
            onClick={onDropdownButtonClick}
            color={'gray'}
            type={'tertiary'}
            size={'s'}
            className={styles.dropdownButton}
            ariaLabel={i18n.sectionOptionsDropdown()}
          />
        </div>
      </div>
    </div>
  );
};
