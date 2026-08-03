import React from 'react';

import {DEFAULT_ROTATION} from '../constants';
import {ImageNodeType} from '../types';

import LockedNotice from './components/LockedNotice';
import ToolbarShell from './components/ToolbarShell';
import AltTextRow from './sections/AltTextRow';
import NodeActionsGroup from './sections/NodeActionsGroup';
import RotationGroup from './sections/RotationGroup';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
}

export default function ImageNodeToolbar({nodeId}: ImageNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      title="Image"
      ariaLabel="Image options"
    >
      {data.locked ? (
        <LockedNotice onUnlock={() => patchNodeData({locked: false})} />
      ) : (
        <>
          <AltTextRow
            value={data.altText ?? ''}
            onChange={next => patchNodeData({altText: next})}
          />
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
