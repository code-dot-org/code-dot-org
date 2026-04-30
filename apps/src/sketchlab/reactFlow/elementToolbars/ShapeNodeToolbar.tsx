import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ShapeNodeType} from '../types';

import ActionsGroup from './ActionsGroup';
import FontSizeGroup from './FontSizeGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import LockedNotice from './LockedNotice';
import RotationGroup from './RotationGroup';
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
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ShapeNodeToolbarProps {
  nodeId: string;
}

export default function ShapeNodeToolbar({nodeId}: ShapeNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ShapeNodeType>(nodeId);

  const {backgroundColor, strokeColor, fontSize, fontColor} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      anchorNodeId={nodeId}
      ariaLabel="Shape style"
    >
      {data.locked ? (
        <LockedNotice nodeId={nodeId} />
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
            onSelect={value =>
              patchNodeData({fontSize: value as FontSizeValue})
            }
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
          <ActionsGroup nodeId={nodeId} />
          <HandleVisibilityToggle
            visible={handlesVisible}
            onToggle={() => patchNodeData({showHandles: !handlesVisible})}
          />
        </>
      )}
    </ToolbarShell>
  );
}
