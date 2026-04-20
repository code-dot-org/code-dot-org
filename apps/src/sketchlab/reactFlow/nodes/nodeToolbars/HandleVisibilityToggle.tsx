import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

import styles from './node-toolbar.module.scss';

export interface HandleVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export default function HandleVisibilityToggle({
  visible,
  onToggle,
}: HandleVisibilityToggleProps) {
  const actionLabel = visible
    ? 'Hide connection handles'
    : 'Show connection handles';
  return (
    <div className={styles.group} role="group" aria-label="Connection handles">
      <span className={styles.groupLabel} aria-hidden="true">
        Handles
      </span>
      <div className={styles.fontSizeButtons}>
        <Tooltip title={actionLabel} placement="top">
          <IconButton
            size="small"
            className={styles.fontSizeButton}
            aria-label={actionLabel}
            aria-pressed={visible}
            onClick={onToggle}
          >
            <FontAwesomeV6Icon iconName={visible ? 'eye' : 'eye-slash'} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
