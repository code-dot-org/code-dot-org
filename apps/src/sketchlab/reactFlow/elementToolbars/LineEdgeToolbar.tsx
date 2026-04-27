import React from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import SwatchGroup from './SwatchGroup';
import {DEFAULT_STROKE_COLOR, STROKE_FONT_PALETTE} from './toolbarPalettes';
import ToolbarShell from './ToolbarShell';

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
    <ToolbarShell
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
    </ToolbarShell>
  );
}
