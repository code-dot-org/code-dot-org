import {Paper} from '@mui/material';
import {NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {useSketchLabReadOnly} from '../../context';

import FontSizeGroup from './FontSizeGroup';
import {
  BACKGROUND_PALETTE,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_COLOR,
  STROKE_FONT_PALETTE,
} from './shapePalettes';
import SwatchGroup from './SwatchGroup';

import styles from './shape-node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;

interface ShapeNodeToolbarProps {
  nodeId: string;
  data: SketchlabReactFlowNode['data'];
}

export default function ShapeNodeToolbar({
  nodeId,
  data,
}: ShapeNodeToolbarProps) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();

  const backgroundColor = data.backgroundColor as string | undefined;
  const strokeColor = data.strokeColor as string | undefined;
  const fontSize = data.fontSize as string | undefined;
  const fontColor = data.fontColor as string | undefined;

  const patchNodeData = useCallback(
    (patch: Record<string, string>) => {
      updateNodeData(nodeId, patch);
    },
    [nodeId, updateNodeData]
  );

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
        aria-label="Shape style"
      >
        <SwatchGroup
          groupLabel="Background"
          swatches={BACKGROUND_PALETTE}
          selectedValue={backgroundColor ?? DEFAULT_BACKGROUND_COLOR}
          onSelect={value => patchNodeData({backgroundColor: value})}
        />
        <SwatchGroup
          groupLabel="Stroke"
          swatches={STROKE_FONT_PALETTE}
          selectedValue={strokeColor ?? DEFAULT_STROKE_COLOR}
          onSelect={value => patchNodeData({strokeColor: value})}
        />
        <FontSizeGroup
          selectedValue={fontSize ?? DEFAULT_FONT_SIZE}
          onSelect={value => patchNodeData({fontSize: value})}
        />
        <SwatchGroup
          groupLabel="Font color"
          swatches={STROKE_FONT_PALETTE}
          selectedValue={fontColor ?? DEFAULT_FONT_COLOR}
          onSelect={value => patchNodeData({fontColor: value})}
        />
      </Paper>
    </NodeToolbar>
  );
}
