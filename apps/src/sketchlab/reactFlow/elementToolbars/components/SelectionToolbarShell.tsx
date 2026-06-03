import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip, Typography} from '@mui/material';
import React from 'react';

import styles from './toolbar-shell.module.scss';

interface SelectionToolbarShellProps {
  ariaLabel: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SelectionToolbarShell({
  ariaLabel,
  title,
  onClose,
  children,
}: SelectionToolbarShellProps) {
  return (
    <Paper
      className={styles.toolbar}
      elevation={0}
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div className={styles.header}>
        <Typography
          variant="overline3"
          className={styles.headerTitle}
          aria-hidden="true"
        >
          {title}
        </Typography>
        <Tooltip title="Close toolbar" placement="top">
          <IconButton
            size="small"
            className={styles.closeButton}
            aria-label="Close toolbar"
            onClick={onClose}
          >
            <FontAwesomeV6Icon
              iconName="xmark"
              iconStyle="solid"
              aria-hidden="true"
            />
          </IconButton>
        </Tooltip>
      </div>
      <div className={styles.scrollContent}>{children}</div>
    </Paper>
  );
}
