import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Paper} from '@mui/material';
import React from 'react';

import styles from './multi-node-selection-toolbar.module.scss';

interface MultiNodeSelectionToolbarProps {
  onGroup: () => void;
}

export default function MultiNodeSelectionToolbar({
  onGroup,
}: MultiNodeSelectionToolbarProps) {
  return (
    <Paper
      className={styles.toolbar}
      elevation={0}
      role="toolbar"
      aria-label="Multi-node selection"
    >
      <div className={styles.body}>
        <Button
          onClick={onGroup}
          aria-label="Group selected elements"
          color="secondary"
          variant="outlined"
          size="small"
          startIcon={
            <FontAwesomeV6Icon iconName="object-group" aria-hidden="true" />
          }
        >
          Group Elements
        </Button>
      </div>
    </Paper>
  );
}
