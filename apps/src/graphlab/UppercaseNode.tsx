import {
  Position,
  Handle,
  useReactFlow,
  useNodeConnections,
  useNodesData,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {isTextNode, type MyNode} from './initialElements';

function UppercaseNode({id}: NodeProps) {
  const {updateNodeData} = useReactFlow();
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(connections[0]?.source);
  const textNode = isTextNode(nodesData) ? nodesData : null;

  useEffect(() => {
    updateNodeData(id, {text: textNode?.data.text.toUpperCase()});
  }, [id, textNode, updateNodeData]);

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={connections.length === 0}
      />
      <div>uppercase transform</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(UppercaseNode);
