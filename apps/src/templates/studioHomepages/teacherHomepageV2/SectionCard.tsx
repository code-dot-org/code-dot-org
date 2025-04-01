import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import {SectionCardBody} from './SectionCardBody';
import {SectionOptionsDropdown} from './SectionOptionsDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onDeleteClickCallback,
}) => {
  return (
    <div className={styles.sectionCardWrapper}>
      <div className={styles.sectionCardHeader}>
        <div className={styles.sectionCardHeaderLeft}>
          <Heading5 className={styles.sectionCardHeaderText}>
            {section.name}
          </Heading5>
          <OverlineOneText className={styles.sectionCardCode}>
            {i18n.classCode()}
            <a href={`/join/${section.code}`} target="_blank" rel="noreferrer">
              {section.code}
            </a>
          </OverlineOneText>
        </div>
        <div className={styles.sectionCardHeaderRight}>
          <SectionOptionsDropdown
            section={section}
            onDeleteClickCallback={onDeleteClickCallback}
          />
        </div>
      </div>
      {!section.hidden && <SectionCardBody section={section} />}
    </div>
  );
};
