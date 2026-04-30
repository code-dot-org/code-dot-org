import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import React from 'react';

import styles from './element-toolbar.module.scss';

interface ActionsGroupProps {
  onDelete?: () => void;
  onLock?: () => void;
}

export default function ActionsGroup({onDelete, onLock}: ActionsGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label="Actions">
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        Actions
      </Typography>
      <div className={styles.fontSizeButtons}>
        {onDelete && (
          <Tooltip title="Delete" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Delete"
              onClick={onDelete}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </Tooltip>
        )}
        {onLock && (
          <Tooltip title="Lock element" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Lock element"
              onClick={onLock}
            >
              <FontAwesomeV6Icon iconName="lock" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
