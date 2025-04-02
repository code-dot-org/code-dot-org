import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
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
  const onClickClassCode = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_CARD_CLASS_CODE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
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
              <a
                href={`/join/${section.code}`}
                target="_blank"
                rel="noreferrer"
                onClick={onClickClassCode}
              >
                {section.code}
              </a>
            </OverlineOneText>
          </div>
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
