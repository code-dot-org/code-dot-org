import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ImageNodeType} from '../types';

import LockedNotice from './LockedNotice';
import NodeActionsGroup from './NodeActionsGroup';
import RotationGroup from './RotationGroup';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
}

export default function ImageNodeToolbar({nodeId}: ImageNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell target={{type: 'node', id: nodeId}} ariaLabel="Image options">
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
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
