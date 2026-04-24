import React from 'react';

import {TextNodeType} from '../types';

import FontSizeGroup from './FontSizeGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import NodeToolbarShell from './NodeToolbarShell';
import SwatchGroup from './SwatchGroup';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  FontSizeValue,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import {useNodeToolbarData} from './useNodeToolbarData';

interface TextNodeToolbarProps {
  nodeId: string;
}

export default function TextNodeToolbar({nodeId}: TextNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<TextNodeType>(nodeId);

  const {fontSize, fontColor} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <NodeToolbarShell
      target={{type: 'node', id: nodeId}}
      anchorNodeId={nodeId}
      ariaLabel="Text style"
    >
      <FontSizeGroup
        selectedValue={fontSize ?? DEFAULT_FONT_SIZE}
        onSelect={value => patchNodeData({fontSize: value as FontSizeValue})}
      />
      <SwatchGroup
        groupLabel="Font color"
        swatches={STROKE_FONT_PALETTE}
        selectedValue={fontColor ?? DEFAULT_FONT_COLOR}
        onSelect={value => patchNodeData({fontColor: value})}
      />
      <HandleVisibilityToggle
        visible={handlesVisible}
        onToggle={() => patchNodeData({showHandles: !handlesVisible})}
      />
    </NodeToolbarShell>
  );
}
