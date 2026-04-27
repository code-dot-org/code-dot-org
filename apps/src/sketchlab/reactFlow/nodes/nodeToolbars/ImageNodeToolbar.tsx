import React from 'react';

import {ImageNodeType} from '../../types';

import ActionsGroup from './ActionsGroup';
import HandleVisibilityToggle from './HandleVisibilityToggle';
import NodeToolbarShell from './NodeToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
}

export default function ImageNodeToolbar({nodeId}: ImageNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);
  const handlesVisible = data.showHandles !== false;

  return (
    <NodeToolbarShell nodeId={nodeId} ariaLabel="Image options">
      <ActionsGroup nodeId={nodeId} />
      <HandleVisibilityToggle
        visible={handlesVisible}
        onToggle={() => patchNodeData({showHandles: !handlesVisible})}
      />
    </NodeToolbarShell>
  );
}
