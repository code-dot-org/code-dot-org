import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ShapeNodeType} from '../types';

import LockedNotice from './components/LockedNotice';
import ToolbarSection from './components/ToolbarSection';
import ToolbarShell from './components/ToolbarShell';
import AlignmentDropdownRow from './sections/AlignmentDropdownRow';
import ColorDropdownRow from './sections/ColorDropdownRow';
import NodeActionsGroup from './sections/NodeActionsGroup';
import RotationGroup from './sections/RotationGroup';
import SizeDropdownRow from './sections/SizeDropdownRow';
import {
  BACKGROUND_PALETTE,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_STROKE_COLOR,
  DEFAULT_TEXT_ALIGN,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ShapeNodeToolbarProps {
  nodeId: string;
}

export default function ShapeNodeToolbar({nodeId}: ShapeNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ShapeNodeType>(nodeId);
  const {backgroundColor, strokeColor, fontSize, fontColor, textAlign} = data;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Shape"
      ariaLabel="Shape style"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <ToolbarSection title="Appearance">
            <ColorDropdownRow
              label="Background"
              swatches={BACKGROUND_PALETTE}
              value={backgroundColor ?? DEFAULT_BACKGROUND_COLOR}
              onSelect={next => patchNodeData({backgroundColor: next})}
            />
            <ColorDropdownRow
              label="Border"
              swatches={STROKE_FONT_PALETTE}
              value={strokeColor ?? DEFAULT_STROKE_COLOR}
              onSelect={next => patchNodeData({strokeColor: next})}
            />
          </ToolbarSection>
          <ToolbarSection title="Text">
            <SizeDropdownRow
              value={fontSize ?? DEFAULT_FONT_SIZE}
              onSelect={next => patchNodeData({fontSize: next})}
            />
            <AlignmentDropdownRow
              value={textAlign ?? DEFAULT_TEXT_ALIGN}
              onSelect={next => patchNodeData({textAlign: next})}
            />
            <ColorDropdownRow
              label="Color"
              swatches={STROKE_FONT_PALETTE}
              value={fontColor ?? DEFAULT_FONT_COLOR}
              onSelect={next => patchNodeData({fontColor: next})}
            />
          </ToolbarSection>
          <RotationGroup
            value={data.rotation ?? DEFAULT_ROTATION}
            onChange={degrees => patchNodeData({rotation: degrees})}
          />
          <NodeActionsGroup nodeId={nodeId} />
        </>
      )}
    </ToolbarShell>
  );
}
