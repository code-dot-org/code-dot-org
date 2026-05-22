import {
  Handle,
  type NodeProps,
  Position,
  useNodeConnections,
} from '@xyflow/react';
import classNames from 'classnames';
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

  // When data.showHandles is false the handle is hidden via the .hidden
  // class. The handle is re-shown when the wrapper .react-flow__node-lineAnchor
  // has DOM :focus — see react-flow-canvas.module.scss. We rely on DOM
  // focus rather than the `selected` prop so the override still applies in
  // read-only mode (where displayNodes forces selected=false).
  const showHandles = data.showHandles !== false;

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
