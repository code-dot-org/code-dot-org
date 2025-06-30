import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
} from '@xyflow/react';
import React, {memo} from 'react';

function TextNode({id, data}: NodeProps<Node<{text: string}>>) {
  const {updateNodeData} = useReactFlow();

  return (
    <div>
      <div>node {id}</div>
      <div>
        <input
          onChange={evt => updateNodeData(id, {text: evt.target.value})}
          value={data.text}
          className="xy-theme__input"
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(TextNode);
