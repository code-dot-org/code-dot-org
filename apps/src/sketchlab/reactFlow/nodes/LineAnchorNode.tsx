import {Handle, Position, useNodeConnections} from '@xyflow/react';
import classNames from 'classnames';
import React, {memo} from 'react';

import {LineAnchorNodeData} from '../types';
import {lineAnchorHandleId} from '../utils/lineAnchors';

import styles from './line-anchor-node.module.scss';

interface LineAnchorNodeProps {
  data: LineAnchorNodeData;
}

function LineAnchorNode({data}: LineAnchorNodeProps) {
  const isSourceAnchor = data.lineAnchorRole === 'source';
  const handleType = isSourceAnchor ? 'source' : 'target';
  const handlePosition = isSourceAnchor ? Position.Right : Position.Left;
  const connections = useNodeConnections();
  const showHandles = data.showHandles !== false;

  // This should become false immediately after a line is created,
  // as we create two hidden nodes with an edge in between them.
  const isConnectable = connections.length === 0;

  return (
    <div className={styles.anchorNode} aria-label="Line endpoint">
      <Handle
        type={handleType}
        id={lineAnchorHandleId(handleType)}
        position={handlePosition}
        isConnectable={isConnectable}
        className={classNames(styles.anchorHandle, {
          [styles.hidden]: !showHandles,
        })}
      />
    </div>
  );
}

export default memo(LineAnchorNode);
