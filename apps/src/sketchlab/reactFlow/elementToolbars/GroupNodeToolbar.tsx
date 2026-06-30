import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button} from '@mui/material';
import React from 'react';

import ToolbarSection from './components/ToolbarSection';
import ToolbarShell from './components/ToolbarShell';

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
          aria-label="Ungroup"
          color="secondary"
          variant="outlined"
          size="small"
          startIcon={
            <FontAwesomeV6Icon iconName="object-ungroup" aria-hidden="true" />
          }
        >
          Ungroup
        </Button>
      </ToolbarSection>
    </ToolbarShell>
  );
}
