import {Button} from '@code-dot-org/component-library/button';
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

import SectionAvatar from './SectionAvatar';
import SectionCardBody from './SectionCardBody';
import SectionOptionsDropdown from './SectionOptionsDropdown';

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
      aria-labelledby={`section-card-title-${section.id}`}
    >
      <div className={styles.sectionCardHeader}>
        <div className={styles.sectionCardHeaderLeft}>
          {!section.hidden && (
            <Button
              {...attributes}
              {...listeners}
              onClick={() => {}} // Uses attributes and listeners to make the button draggable
              isIconOnly
              icon={{iconName: 'grip-vertical'}}
              color="gray"
              size="s"
              type="tertiary"
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
            />
          )}
          <SectionAvatar seed={section.id} />
          <div className={styles.sectionCardHeaderText}>
            <Heading5 id={`section-card-title-${section.id}`}>
              {section.name}
            </Heading5>
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
