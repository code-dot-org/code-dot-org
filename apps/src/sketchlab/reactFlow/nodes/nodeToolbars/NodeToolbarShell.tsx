import {Paper} from '@mui/material';
import {NodeToolbar, Position} from '@xyflow/react';
import React from 'react';

import {useSketchLabReadOnly} from '../../context';

import styles from './node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;

interface NodeToolbarShellProps {
  nodeId: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export default function NodeToolbarShell({
  nodeId,
  ariaLabel,
  children,
}: NodeToolbarShellProps) {
  const readOnly = useSketchLabReadOnly();
  if (readOnly) {
    return null;
  }
  return (
    <NodeToolbar
      nodeId={nodeId}
      position={Position.Left}
      offset={TOOLBAR_OFFSET_PX}
    >
      <Paper
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label={ariaLabel}
      >
        {children}
      </Paper>
    </NodeToolbar>
  );
}
