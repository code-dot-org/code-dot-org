import {
  Heading5,
  OverlineOneText,
} from '@code-dot-org/component-library/typography';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
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
  id: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onDeleteClickCallback,
  id,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id});

  const onClickClassCode = () => {
    analyticsReporter.sendEvent(
      EVENTS.SECTION_CARD_CLASS_CODE_CLICKED,
      {},
      PLATFORMS.BOTH
    );
  };

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <li
      className={styles.sectionCardWrapper}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
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
    </li>
  );
};
