import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip, Divider} from '@mui/material';
import {Panel, useReactFlow} from '@xyflow/react';
import React, {useEffect, useState} from 'react';

import {TOUR_GROUP, TOUR_GROUP_ATTR} from '../constants';

import styles from './toolbar.module.scss';

interface CanvasControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
}

export default function CanvasControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isReadOnly,
}: CanvasControlsProps) {
  const {zoomIn, zoomOut, fitView} = useReactFlow();
  const [undoTooltipOpen, setUndoTooltipOpen] = useState(false);
  const [redoTooltipOpen, setRedoTooltipOpen] = useState(false);

  useEffect(() => {
    if (!canUndo) setUndoTooltipOpen(false);
  }, [canUndo]);

  useEffect(() => {
    if (!canRedo) setRedoTooltipOpen(false);
  }, [canRedo]);

  useEffect(() => {
    if (isReadOnly) {
      setUndoTooltipOpen(false);
      setRedoTooltipOpen(false);
    }
  }, [isReadOnly]);

  return (
    <Panel position="bottom-right">
      <Paper
        className={styles.canvasControls}
        elevation={0}
        role="toolbar"
        aria-label="Canvas controls"
        aria-orientation="vertical"
      >
        {!isReadOnly && (
          <>
            <div
              className={styles.toolbarGroup}
              role="group"
              aria-label="Undo and redo"
              {...{[TOUR_GROUP_ATTR]: TOUR_GROUP.undoRedo}}
            >
              <Tooltip
                title="Undo"
                placement="left"
                open={undoTooltipOpen}
                onOpen={() => setUndoTooltipOpen(true)}
                onClose={() => setUndoTooltipOpen(false)}
              >
                <span>
                  <IconButton
                    aria-label="Undo"
                    onClick={onUndo}
                    disabled={!canUndo}
                    size="extraSmall"
                    color="tertiary"
                    variant="text"
                  >
                    <FontAwesomeV6Icon iconName="rotate-left" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip
                title="Redo"
                placement="left"
                open={redoTooltipOpen}
                onOpen={() => setRedoTooltipOpen(true)}
                onClose={() => setRedoTooltipOpen(false)}
              >
                <span>
                  <IconButton
                    aria-label="Redo"
                    onClick={onRedo}
                    disabled={!canRedo}
                    size="extraSmall"
                    color="tertiary"
                    variant="text"
                  >
                    <FontAwesomeV6Icon iconName="rotate-right" />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
            <Divider flexItem className={styles.divider} />
          </>
        )}
        <div
          className={styles.toolbarGroup}
          role="group"
          aria-label="Zoom"
          {...{[TOUR_GROUP_ATTR]: TOUR_GROUP.zoom}}
        >
          <Tooltip title="Zoom in" placement="left">
            <span>
              <IconButton
                aria-label="Zoom in"
                onClick={() => zoomIn()}
                size="extraSmall"
                color="tertiary"
                variant="text"
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
                size="extraSmall"
                color="tertiary"
                variant="text"
              >
                <FontAwesomeV6Icon iconName="minus" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Zoom to fit" placement="left">
            <span>
              <IconButton
                aria-label="Zoom to fit"
                onClick={() => fitView()}
                size="extraSmall"
                color="tertiary"
                variant="text"
              >
                <FontAwesomeV6Icon iconName="expand" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </Paper>
    </Panel>
  );
}
