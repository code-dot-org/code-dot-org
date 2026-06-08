import {
  Handle,
  type NodeProps,
  Position,
  useNodeConnections,
} from '@xyflow/react';
import React, {memo} from 'react';

import {LineAnchorNodeType} from '../types';
import {lineAnchorHandleId} from '../utils/lineAnchors';

import styles from './line-anchor-node.module.scss';

function LineAnchorNode({data}: NodeProps<LineAnchorNodeType>) {
  const isSourceAnchor = data.lineAnchorRole === 'source';
  const handleType = isSourceAnchor ? 'source' : 'target';
  const handlePosition = isSourceAnchor ? Position.Right : Position.Left;
  const connections = useNodeConnections();

  // This should become false immediately after a line is created,
  // as we create two hidden nodes with an edge in between them.
  const isConnectable = connections.length === 0;

  return (
    <div className={styles.anchorNode}>
      <Handle
        type={handleType}
        id={lineAnchorHandleId(handleType)}
        position={handlePosition}
        isConnectable={isConnectable}
        className={`${styles.anchorHandle} ${styles.hidden}`}
      />
    </div>
  );
}

export default memo(LineAnchorNode);
