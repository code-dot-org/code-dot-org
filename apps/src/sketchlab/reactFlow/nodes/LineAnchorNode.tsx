import {Handle, Position, useNodeConnections} from '@xyflow/react';
import React, {memo} from 'react';

import styles from './line-anchor-node.module.scss';

interface LineAnchorNodeProps {
  data: Record<string, string | number | boolean>;
}

function LineAnchorNode({data}: LineAnchorNodeProps) {
  const isSource = data.lineAnchorRole === 'source';
  const handleType = isSource ? 'source' : 'target';
  const handlePosition = isSource ? Position.Right : Position.Left;
  const connections = useNodeConnections();

  // This should become false immediately after a line is created,
  // as we create two hidden nodes with an edge in between them.
  const isConnectable = connections.length === 0;

  return (
    <div className={styles.anchorNode} aria-label="Line endpoint">
      <Handle
        type={handleType}
        id={`line-anchor-${handleType}`}
        position={handlePosition}
        isConnectable={isConnectable}
        className={styles.anchorHandle}
      />
    </div>
  );
}

export default memo(LineAnchorNode);
