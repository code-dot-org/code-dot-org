import {Button} from '@mui/material';
import React from 'react';

import SelectionToolbarShell from './components/SelectionToolbarShell';
import ToolbarSection from './components/ToolbarSection';

import styles from './group-toolbar.module.scss';

interface MultiNodeSelectionToolbarProps {
  selectedCount: number;
  onClose: () => void;
  onGroupNodes: () => void;
}

export default function MultiNodeSelectionToolbar({
  selectedCount,
  onClose,
  onGroupNodes,
}: MultiNodeSelectionToolbarProps) {
  return (
    <SelectionToolbarShell
      title="Selection"
      ariaLabel="Selection actions"
      onClose={onClose}
    >
      <ToolbarSection title={`${selectedCount} nodes selected`}>
        <Button
          onClick={onGroupNodes}
          color="secondary"
          variant="outlined"
          size="small"
          className={styles.actionButton}
        >
          Group Nodes
        </Button>
      </ToolbarSection>
    </SelectionToolbarShell>
  );
}
