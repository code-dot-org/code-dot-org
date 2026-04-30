import {useReactFlow} from '@xyflow/react';
import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ImageNodeType} from '../types';
import {nextBackZIndex, nextFrontZIndex} from '../utils/stacking';

import ActionsGroup from './ActionsGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import LockedNotice from './LockedNotice';
import RotationGroup from './RotationGroup';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
}

export default function ImageNodeToolbar({nodeId}: ImageNodeToolbarProps) {
  const {deleteElements, updateNode, getNodes} = useReactFlow();
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      anchorNodeId={nodeId}
      ariaLabel="Image options"
    >
      {data.locked ? (
        <LockedNotice nodeId={nodeId} />
      ) : (
        <>
          <RotationGroup
            value={data.rotation ?? DEFAULT_ROTATION}
            onChange={degrees => patchNodeData({rotation: degrees})}
          />
          <ActionsGroup
            onDelete={() => deleteElements({nodes: [{id: nodeId}]})}
            onLock={() => patchNodeData({locked: true})}
            onBringToFront={() =>
              updateNode(nodeId, {zIndex: nextFrontZIndex(getNodes())})
            }
            onSendToBack={() =>
              updateNode(nodeId, {zIndex: nextBackZIndex(getNodes())})
            }
          />
          <HandleVisibilityToggle
            visible={handlesVisible}
            onToggle={() => patchNodeData({showHandles: !handlesVisible})}
          />
        </>
      )}
    </ToolbarShell>
  );
}
