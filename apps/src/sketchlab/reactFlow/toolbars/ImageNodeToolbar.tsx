import React from 'react';

import {ImageNodeType} from '../types';

import HandleVisibilityToggle from './HandleVisibilityToggle';
import ToolbarShell from './ToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
}

export default function ImageNodeToolbar({nodeId}: ImageNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);
  const handlesVisible = data.showHandles !== false;

  return (
    <ToolbarShell
      target={{type: 'node', id: nodeId}}
      anchorNodeId={nodeId}
      ariaLabel="Image options"
    >
      <HandleVisibilityToggle
        visible={handlesVisible}
        onToggle={() => patchNodeData({showHandles: !handlesVisible})}
      />
    </ToolbarShell>
  );
}
