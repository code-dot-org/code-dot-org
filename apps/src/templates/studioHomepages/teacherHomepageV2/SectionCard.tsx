import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Typography, IconButton as MuiIconButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import DemoChip from '@cdo/apps/templates/DemoChip';
import {Section} from '@cdo/apps/templates/teacherDashboard/types/teacherSectionTypes';
import i18n from '@cdo/locale';

import JoinLinkCopyButton from './JoinLink/JoinLinkCopyButton';
import SectionAvatar from './sectionAvatars/SectionAvatar';
import SectionCardBody from './SectionCardBody';
import SectionOptionsDropdown from './SectionOptionsDropdown';

import styles from './teacherHomepage.module.scss';

interface SectionCardProps {
  studioUrlPrefix: string;
  section: Section;
  onDeleteClickCallback: (sectionId: number) => void;
  id: number;
}

// NOTE: DemoSectionCard mirrors this component's layout for the
// pre-creation practice card. When changing this card's structure,
// styles, or actions, mirror the change in DemoSectionCard.tsx so the
// two stay visually and behaviorally consistent.
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
      className={classNames(styles.sectionCardWrapper, {
        [styles.demoSectionCardWrapper]: Boolean(section.demoType),
      })}
      ref={setNodeRef}
      style={{cursor: isDragging ? 'grabbing' : 'inherit', ...style}}
      aria-labelledby={`section-card-title-${section.id}`}
    >
      <div className={styles.sectionCardHeader}>
        <div className={styles.sectionCardHeaderLeft}>
          {!section.hidden && (
            <MuiIconButton
              {...attributes}
              {...listeners}
              variant="text"
              color="tertiary"
              size="small"
              onClick={() => {}} // Uses attributes and listeners to make the button draggable
              aria-label={i18n.dragSection()}
              type="button"
            >
              <FontAwesomeV6Icon iconName="grip-vertical" />
            </MuiIconButton>
          )}
          <SectionAvatar
            color={section.avatar_color || 0}
            emoji={section.avatar_emoji || 0}
            size={'s'}
          />
          <div className={styles.sectionCardHeaderText}>
            <div className={styles.demoSectionTitleRow}>
              <Typography
                className={styles.sectionCardTitle}
                id={`section-card-title-${section.id}`}
                variant="h5"
              >
                <span className={styles.sectionCardTitleText}>
                  {section.name}
                </span>
                {section.demoType && (
                  <DemoChip className={styles.sectionCardDemoChip} />
                )}
              </Typography>
            </div>
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
