import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {TextNodeType} from '../types';

import FontSizeGroup from './FontSizeGroup';
import LockedNotice from './LockedNotice';
import NodeActionsGroup from './NodeActionsGroup';
import RotationGroup from './RotationGroup';
import SwatchGroup from './SwatchGroup';
import TextAlignGroup from './TextAlignGroup';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  STROKE_FONT_PALETTE,
  TextAlignValue,
} from './toolbarPalettes';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface TextNodeToolbarProps {
  nodeId: string;
}

export default function TextNodeToolbar({nodeId}: TextNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<TextNodeType>(nodeId);

  const {fontSize, fontColor, textAlign} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell target={{type: 'node', id: nodeId}} ariaLabel="Text style">
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <FontSizeGroup
            selectedValue={fontSize ?? DEFAULT_FONT_SIZE}
            onSelect={value => patchNodeData({fontSize: value})}
          />
          <TextAlignGroup
            selectedValue={textAlign ?? DEFAULT_TEXT_ALIGN}
            onSelect={value =>
              patchNodeData({textAlign: value as TextAlignValue})
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
          <NodeActionsGroup
            nodeId={nodeId}
            handlesVisible={handlesVisible}
            onToggleHandles={() =>
              patchNodeData({showHandles: !handlesVisible})
            }
          />
        </>
      )}
    </ToolbarShell>
  );
}
