import {Button} from '@mui/material';
import React from 'react';

import ToolbarSection from './components/ToolbarSection';
import ToolbarShell from './components/ToolbarShell';

import styles from './group-toolbar.module.scss';

interface GroupNodeToolbarProps {
  nodeId: string;
  onUngroup: () => void;
}

export default function GroupNodeToolbar({
  nodeId,
  onUngroup,
}: GroupNodeToolbarProps) {
  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Group"
      ariaLabel="Group actions"
    >
      <ToolbarSection title="Actions">
        <Button
          onClick={onUngroup}
          color="secondary"
          variant="outlined"
          size="small"
          className={styles.actionButton}
        >
          Ungroup
        </Button>
      </ToolbarSection>
    </ToolbarShell>
  );
}
