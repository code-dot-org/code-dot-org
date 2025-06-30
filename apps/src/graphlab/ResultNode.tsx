import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import React, {memo} from 'react';

import {isTextNode, type MyNode} from './initialElements';

function ResultNode() {
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );
  const textNodes = nodesData.filter(isTextNode);

  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <div>
        incoming texts:{' '}
        {textNodes.length > 0
          ? textNodes.map(({data}, i) =>
              data && 'text' in data ? <div key={i}>{data.text}</div> : null
            )
          : 'none'}
      </div>
    </div>
  );
}

export default memo(ResultNode);
