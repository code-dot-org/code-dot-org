import {
  Position,
  Handle,
  useReactFlow,
  type NodeProps,
  type Node,
  useNodesData,
  useNodeConnections,
} from '@xyflow/react';
import React, {memo, useEffect} from 'react';

import {isTextNode, type MyNode} from './initialElements';

function ConditionNode({id, data}: NodeProps<Node<{checkText: string}>>) {
  const {updateNodeData} = useReactFlow();
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );
  const textNodes = nodesData.filter(isTextNode);

  const inputText: string =
    textNodes.length > 0
      ? textNodes
          .map(({data}) => (data && 'text' in data ? data.text : ''))
          .join('')
      : 'none';

  useEffect(() => {
    const updateValue = inputText.includes(data.checkText)
      ? 'yes - keep running this chain'
      : 'no - stop running this chain';

    updateNodeData(id, {
      text: updateValue,
    });
  }, [data.checkText, id, inputText, updateNodeData]);

  return (
    <div>
      <div>condition {id}</div>
      <div>
        <input
          onChange={evt => updateNodeData(id, {checkText: evt.target.value})}
          value={data.checkText}
          className="xy-theme__input"
        />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(ConditionNode);
