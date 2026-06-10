import {Handle, type NodeProps, Position} from '@xyflow/react';
import React, {memo} from 'react';

import {LineAnchorNodeType} from '../types';
import {lineAnchorHandleId} from '../utils/lineAnchors';

import styles from './line-anchor-node.module.scss';

function LineAnchorNode({data}: NodeProps<LineAnchorNodeType>) {
  const isSourceAnchor = data.lineAnchorRole === 'source';
  const handleType = isSourceAnchor ? 'source' : 'target';
  const handlePosition = isSourceAnchor ? Position.Right : Position.Left;

  return (
    <div className={styles.anchorNode}>
      <Handle
        type={handleType}
        id={lineAnchorHandleId(handleType)}
        position={handlePosition}
        // The handle exists only so the line edge has an attachment point.
        // Anchors aren't used for interactive connections (user drags from anchor to create a new edge),
        // so we mark them as not connectable. You can still drag an anchor and connect it to
        // a node.
        isConnectable={false}
        isConnectableStart={false}
        isConnectableEnd={false}
        className={`${styles.anchorHandle} ${styles.hidden}`}
      />
    </div>
  );
}

export default memo(LineAnchorNode);
