import {
  Handle,
  Position,
  useNodeConnections,
  useNodesData,
} from '@xyflow/react';
import React, {memo} from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {isTextNode, type MyNode} from '../../../flow/initialElements';

// This node simply displays any text sent to its input handle.

function OutputNode() {
  const connections = useNodeConnections({
    handleType: 'target',
  });
  const nodesData = useNodesData<MyNode>(
    connections.map(connection => connection.source)
  );
  const textNodes = nodesData.filter(isTextNode);

  const text =
    textNodes.length > 0
      ? textNodes.map(({data}, i) =>
          data && 'text' in data ? (
            <div key={i}>
              {<SafeMarkdown openExternalLinksInNewTab markdown={data.text} />}
            </div>
          ) : null
        )
      : 'none';

  return (
    <div style={{maxWidth: 400}}>
      <Handle type="target" position={Position.Left} />
      <div>Output</div>
      <div>{text}</div>
    </div>
  );
}

export default memo(OutputNode);
