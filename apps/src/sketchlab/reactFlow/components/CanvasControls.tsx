import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import {Panel, useReactFlow} from '@xyflow/react';
import React from 'react';

import styles from './toolbar.module.scss';

interface CanvasControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function CanvasControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  const {zoomIn, zoomOut, fitView} = useReactFlow();

  return (
    <Panel position="bottom-right">
      <Paper
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label="Canvas controls"
        aria-orientation="vertical"
        style={{position: 'static', transform: 'none'}}
      >
        <Tooltip title="Zoom in" placement="left">
          <span>
            <IconButton
              aria-label="Zoom in"
              onClick={() => zoomIn()}
              size="small"
              color="tertiary"
              variant="outlined"
            >
              <FontAwesomeV6Icon iconName="plus" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Zoom out" placement="left">
          <span>
            <IconButton
              aria-label="Zoom out"
              onClick={() => zoomOut()}
              size="small"
              color="tertiary"
              variant="outlined"
            >
              <FontAwesomeV6Icon iconName="minus" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Fit view" placement="left">
          <span>
            <IconButton
              aria-label="Fit view"
              onClick={() => fitView()}
              size="small"
              color="tertiary"
              variant="outlined"
            >
              <FontAwesomeV6Icon iconName="expand" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Undo" placement="left">
          <span>
            <IconButton
              aria-label="Undo"
              onClick={onUndo}
              disabled={!canUndo}
              size="small"
              color="tertiary"
              variant="outlined"
            >
              <FontAwesomeV6Icon iconName="rotate-left" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo" placement="left">
          <span>
            <IconButton
              aria-label="Redo"
              onClick={onRedo}
              disabled={!canRedo}
              size="small"
              color="tertiary"
              variant="outlined"
            >
              <FontAwesomeV6Icon iconName="rotate-right" />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>
    </Panel>
  );
}
