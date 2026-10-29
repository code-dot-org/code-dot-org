// The adaptive level's header: an optional way back to the skill tree, a
// title with the project's save status, and an optional way to the final
// project. It draws into the page header's slot, or inline above the lab
// until that slot exists.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useSelector} from 'react-redux';

import {ADAPTIVE_HEADER_ID} from '@cdo/apps/code-studio/components/header/AdaptiveHeaderPortal';
import {ProjectState} from '@cdo/apps/code-studio/projectRedux';

import styles from './adaptiveHeader.module.scss';

const SAVE_ICONS: Record<
  ProjectState['projectUpdatedStatus'],
  {iconName: string; title: string}
> = {
  default: {iconName: 'cloud', title: 'Not saved'},
  saving: {iconName: 'cloud-arrow-up', title: 'Saving'},
  saved: {iconName: 'cloud-check', title: 'Saved'},
  error: {iconName: 'cloud-exclamation', title: 'Save failed'},
};

function useHeaderSlot(): HTMLElement | null {
  const [slot, setSlot] = useState(() =>
    document.getElementById(ADAPTIVE_HEADER_ID)
  );
  useEffect(() => {
    if (slot) return;
    const observer = new MutationObserver(() => {
      const found = document.getElementById(ADAPTIVE_HEADER_ID);
      if (found) {
        observer.disconnect();
        setSlot(found);
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
    return () => observer.disconnect();
  }, [slot]);
  return slot;
}

interface AdaptiveHeaderProps {
  title: string;
  /** Shows "View skill tree" when given. */
  onViewSkillTree?: () => void;
  /** Shows "I'm finished!" when given. */
  onFinish?: () => void;
}

const AdaptiveHeader: React.FunctionComponent<AdaptiveHeaderProps> = ({
  title,
  onViewSkillTree,
  onFinish,
}) => {
  const slot = useHeaderSlot();
  const status = useSelector(
    (state: {project: ProjectState}) => state.project.projectUpdatedStatus
  );
  const saveIcon = SAVE_ICONS[status];

  const bar = (
    <div className={styles.bar} data-theme="Light">
      {onViewSkillTree && (
        <MuiButton
          variant="contained"
          color="secondary"
          size="extraSmall"
          startIcon={<FontAwesomeV6Icon iconName="sitemap" />}
          onClick={onViewSkillTree}
        >
          View skill tree
        </MuiButton>
      )}
      <div className={styles.title}>
        <MuiTypography
          variant="body3"
          component="span"
          className={styles.titleText}
          title={title}
        >
          {title}
        </MuiTypography>
        <FontAwesomeV6Icon
          iconName={saveIcon.iconName}
          title={saveIcon.title}
          className={styles.saveIcon}
        />
      </div>
      {onFinish && (
        <MuiButton
          variant="outlined"
          color="tertiary"
          size="extraSmall"
          endIcon={<FontAwesomeV6Icon iconName="arrow-right" />}
          onClick={onFinish}
        >
          I'm finished!
        </MuiButton>
      )}
    </div>
  );

  return slot ? (
    createPortal(bar, slot)
  ) : (
    <div className={styles.inline}>{bar}</div>
  );
};

export default AdaptiveHeader;
