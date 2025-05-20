import {Button} from '@code-dot-org/component-library/button';
import {Heading5} from '@code-dot-org/component-library/typography';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import React from 'react';

import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import JoinLinkCopyButton from './JoinLink/JoinLinkCopyButton';
import SectionAvatar from './SectionAvatar';
import SectionCardBody from './SectionCardBody';
import SectionOptionsDropdown from './SectionOptionsDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  studioUrlPrefix: string;
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
  id: number;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  studioUrlPrefix,
  section,
  onDeleteClickCallback,
  id,
}) => {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} =
    useSortable({id});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <li
      className={styles.sectionCardWrapper}
      ref={setNodeRef}
      style={{cursor: isDragging ? 'grabbing' : 'inherit', ...style}}
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
              aria-label={i18n.dragSection()}
              type="tertiary"
            />
          )}
          <SectionAvatar
            color={section.avatar_color || 0}
            emoji={section.avatar_emoji || 0}
          />
          <div className={styles.sectionCardHeaderText}>
            <Heading5 id={`section-card-title-${section.id}`}>
              {section.name}
            </Heading5>
            <JoinLinkCopyButton
              loginType={section.loginType}
              sectionCode={section.code}
              sectionId={section.id}
              studioUrlPrefix={studioUrlPrefix}
              hidden={section.hidden}
            />
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
