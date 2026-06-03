import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Paper, Typography} from '@mui/material';
import React from 'react';

import styles from './multi-node-selection-toolbar.module.scss';

interface MultiNodeSelectionToolbarProps {
  count: number;
  onGroup: () => void;
}

export default function MultiNodeSelectionToolbar({
  count,
  onGroup,
}: MultiNodeSelectionToolbarProps) {
  return (
    <Paper
      className={styles.toolbar}
      elevation={0}
      role="toolbar"
      aria-label="Multi-node selection"
    >
      <div className={styles.header}>
        <Typography
          variant="overline3"
          className={styles.headerTitle}
          aria-hidden="true"
        >
          {count} selected
        </Typography>
      </div>
      <div className={styles.body}>
        <Button
          onClick={onGroup}
          aria-label="Group selected nodes"
          color="secondary"
          variant="outlined"
          size="small"
          startIcon={
            <FontAwesomeV6Icon iconName="object-group" aria-hidden="true" />
          }
        >
          Group Nodes
        </Button>
      </div>
    </Paper>
  );
}
