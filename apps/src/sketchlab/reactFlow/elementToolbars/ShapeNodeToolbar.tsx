import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ShapeNodeType} from '../types';

import FontSizeGroup from './FontSizeGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import LockedNotice from './LockedNotice';
import NodeActionsGroup from './NodeActionsGroup';
import RotationGroup from './RotationGroup';
import SwatchGroup from './SwatchGroup';
import TextAlignGroup from './TextAlignGroup';
import {
  BACKGROUND_PALETTE,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_STROKE_COLOR,
  STROKE_FONT_PALETTE,
  TextAlignValue,
} from './toolbarPalettes';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ShapeNodeToolbarProps {
  nodeId: string;
}

export default function ShapeNodeToolbar({nodeId}: ShapeNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ShapeNodeType>(nodeId);

  const {backgroundColor, strokeColor, fontSize, fontColor, textAlign} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      anchorNodeId={nodeId}
      ariaLabel="Shape style"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <SwatchGroup
            groupLabel="Background"
            swatches={BACKGROUND_PALETTE}
            selectedValue={backgroundColor ?? DEFAULT_BACKGROUND_COLOR}
            onSelect={value => patchNodeData({backgroundColor: value})}
          />
          <SwatchGroup
            groupLabel="Border"
            swatches={STROKE_FONT_PALETTE}
            selectedValue={strokeColor ?? DEFAULT_STROKE_COLOR}
            onSelect={value => patchNodeData({strokeColor: value})}
          />
          <FontSizeGroup
            selectedValue={fontSize ?? DEFAULT_FONT_SIZE}
            onSelect={value => patchNodeData({fontSize: value})}
          />
          <TextAlignGroup
            selectedValue={textAlign ?? DEFAULT_TEXT_ALIGN}
            onSelect={value =>
              patchNodeData({textAlign: value as TextAlignValue})
            }
            isLongLabel={true}
          />
          <SwatchGroup
            groupLabel="Font color"
            swatches={STROKE_FONT_PALETTE}
            selectedValue={fontColor ?? DEFAULT_FONT_COLOR}
            onSelect={value => patchNodeData({fontColor: value})}
          />
          <RotationGroup
            value={data.rotation ?? DEFAULT_ROTATION}
            onChange={degrees => patchNodeData({rotation: degrees})}
          />
          <NodeActionsGroup nodeId={nodeId} />
          <HandleVisibilityToggle
            visible={handlesVisible}
            onToggle={() => patchNodeData({showHandles: !handlesVisible})}
          />
        </>
      )}
    </ToolbarShell>
  );
}
