import React from 'react';

import {ImageNodeType} from '../../types';

import HandleVisibilityToggle from './HandleVisibilityToggle';
import NodeToolbarShell from './NodeToolbarShell';
import {useNodeToolbarData} from './useNodeToolbarData';

interface ImageNodeToolbarProps {
  nodeId: string;
  nodeElementRef: React.RefObject<HTMLDivElement>;
}

export default function ImageNodeToolbar({
  nodeId,
  nodeElementRef,
}: ImageNodeToolbarProps) {
  const {data, patchNodeData} = useNodeToolbarData<ImageNodeType>(nodeId);
  const handlesVisible = data.showHandles !== false;

  return (
    <NodeToolbarShell
      nodeId={nodeId}
      nodeElementRef={nodeElementRef}
      ariaLabel="Image options"
    >
      <HandleVisibilityToggle
        visible={handlesVisible}
        onToggle={() => patchNodeData({showHandles: !handlesVisible})}
      />
    </NodeToolbarShell>
  );
}
