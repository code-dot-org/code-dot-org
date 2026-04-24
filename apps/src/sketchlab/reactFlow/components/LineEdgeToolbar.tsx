import React from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import NodeToolbarShell from '../nodes/nodeToolbars/NodeToolbarShell';
import SwatchGroup from '../nodes/nodeToolbars/SwatchGroup';
import {
  DEFAULT_STROKE_COLOR,
  STROKE_FONT_PALETTE,
} from '../nodes/nodeToolbars/toolbarPalettes';

interface LineEdgeToolbarProps {
  edge: SketchlabReactFlowEdge;
  anchorNodeId: string;
  onSelectColor: (value: string) => void;
}

export default function LineEdgeToolbar({
  edge,
  anchorNodeId,
  onSelectColor,
}: LineEdgeToolbarProps) {
  const selectedValue =
    (typeof edge.style?.stroke === 'string' && edge.style.stroke) ||
    DEFAULT_STROKE_COLOR;

  return (
    <NodeToolbarShell
      target={{type: 'edge', id: edge.id}}
      anchorNodeId={anchorNodeId}
      ariaLabel="Line style"
    >
      <SwatchGroup
        groupLabel="Line color"
        swatches={STROKE_FONT_PALETTE}
        selectedValue={selectedValue}
        onSelect={onSelectColor}
      />
    </NodeToolbarShell>
  );
}
