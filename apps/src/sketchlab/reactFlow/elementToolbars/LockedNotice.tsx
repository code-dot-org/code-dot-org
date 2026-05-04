import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';

import styles from './element-toolbar.module.scss';

interface LockedNoticeProps {
  onUnlock?: () => void;
}

// Replacement for the regular toolbar groups when an element is locked.
// In standard mode, users cannot unlock a locked element, so it only shows
// a message that the element is locked. In start mode, users can unlock elements, so it also
// includes an unlock button.
export default function LockedNotice({onUnlock}: LockedNoticeProps) {
  const isStartMode = getIsStartMode();

  return (
    <div
      className={styles['locked-notice']}
      role="group"
      aria-label="Locked element"
    >
      <FontAwesomeV6Icon iconName="lock" aria-hidden="true" />
      <Typography variant="body3">This element is locked.</Typography>
      {isStartMode && onUnlock && (
        <Button
          onClick={onUnlock}
          aria-label="Unlock element"
          color="secondary"
          variant="outlined"
          size="small"
          startIcon={
            <FontAwesomeV6Icon iconName="lock-open" aria-hidden="true" />
          }
        >
          Unlock
        </Button>
      )}
    </div>
  );
}
