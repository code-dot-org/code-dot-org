import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button, Typography} from '@mui/material';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';

import {SketchLabNode} from '../types';

import {useNodeToolbarData} from './useNodeToolbarData';

import styles from './element-toolbar.module.scss';

interface LockedNoticeProps {
  nodeId: string;
}

// Replacement for the regular toolbar groups when a node is locked.
// In standard mode, users cannot unlock a locked node, so it only shows
// a message that the node is locked. In start mode, users can unlock nodes, so it also
// includes an unlock button.
export default function LockedNotice({nodeId}: LockedNoticeProps) {
  const {patchNodeData} = useNodeToolbarData<SketchLabNode>(nodeId);
  const isStartMode = getIsStartMode();

  const handleUnlock = () => {
    patchNodeData({locked: false});
  };

  return (
    <div
      className={styles['locked-notice']}
      role="group"
      aria-label="Locked node"
    >
      <FontAwesomeV6Icon iconName="lock" aria-hidden="true" />
      <Typography variant="body3">This node is locked.</Typography>
      {isStartMode && (
        <Button
          onClick={handleUnlock}
          aria-label="Unlock node"
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
