import React from 'react';

import {ShapeNodeType} from '../../types';

import FontSizeGroup from './FontSizeGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import NodeToolbarShell from './NodeToolbarShell';
import SwatchGroup from './SwatchGroup';
import {
  BACKGROUND_PALETTE,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_COLOR,
  FontSizeValue,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ShapeNodeToolbarProps {
  nodeId: string;
}

export default function ShapeNodeToolbar({nodeId}: ShapeNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ShapeNodeType>(nodeId);

  const {backgroundColor, strokeColor, fontSize, fontColor} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <NodeToolbarShell nodeId={nodeId} ariaLabel="Shape style">
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
