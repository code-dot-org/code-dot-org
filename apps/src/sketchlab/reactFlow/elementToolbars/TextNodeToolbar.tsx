import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {TextNodeType} from '../types';

import LockedNotice from './components/LockedNotice';
import ToolbarSection from './components/ToolbarSection';
import ToolbarShell from './components/ToolbarShell';
import AlignmentDropdownRow from './sections/AlignmentDropdownRow';
import ColorDropdownRow from './sections/ColorDropdownRow';
import NodeActionsGroup from './sections/NodeActionsGroup';
import RotationGroup from './sections/RotationGroup';
import SizeDropdownRow from './sections/SizeDropdownRow';
import {
  DEFAULT_FONT_COLOR,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_ALIGN,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import {useNodeToolbarData} from './useNodeToolbarData';

interface TextNodeToolbarProps {
  nodeId: string;
}

export default function TextNodeToolbar({nodeId}: TextNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<TextNodeType>(nodeId);
  const {fontSize, fontColor, textAlign} = data;
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Text"
      ariaLabel="Text style"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <ToolbarSection title="Appearance">
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
