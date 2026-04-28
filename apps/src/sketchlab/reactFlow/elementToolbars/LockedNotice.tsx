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

// Shown in place of the regular toolbar groups when a node is locked.
// The Close button comes from ToolbarShell's header, so this component
// only shows the lock state and (in start_sources mode) an Unlock button.
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
        >
          Unlock
        </Button>
      )}
    </div>
  );
}
