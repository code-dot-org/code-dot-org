import {Handle, Position, useNodeConnections} from '@xyflow/react';
import React, {memo} from 'react';

import styles from './line-anchor-node.module.scss';

interface LineAnchorNodeProps {
  data: Record<string, string | number | boolean>;
}

function LineAnchorNode({data}: LineAnchorNodeProps) {
  const isSourceAnchor = data.lineAnchorRole === 'source';
  const connections = useNodeConnections();
  const isConnectable = connections.length === 0;
  return (
    <div className={styles.anchorNode} aria-label="Line endpoint">
      {isSourceAnchor ? (
        <Handle
          type="source"
          id="line-anchor-source"
          position={Position.Top}
          isConnectable={isConnectable}
          className={styles.anchorHandle}
        />
      ) : (
        <Handle
          type="target"
          id="line-anchor-target"
          position={Position.Top}
          isConnectable={isConnectable}
          className={styles.anchorHandle}
        />
      )}
    </div>
  );
}

export default memo(LineAnchorNode);
