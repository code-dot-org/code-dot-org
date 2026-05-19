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

function LineAnchorNode({data, selected}: NodeProps<LineAnchorNodeType>) {
  const isSourceAnchor = data.lineAnchorRole === 'source';
  const handleType = isSourceAnchor ? 'source' : 'target';
  const handlePosition = isSourceAnchor ? Position.Right : Position.Left;
  const connections = useNodeConnections();

  // This should become false immediately after a line is created,
  // as we create two hidden nodes with an edge in between them.
  const isConnectable = connections.length === 0;

  // When handles are hidden the anchor is invisible, which makes keyboard
  // focus invisible too. Unhide while this anchor is the focused entry
  // so the user can see where they are without losing the persistent
  // hide-handles preference.
  const showHandles = data.showHandles !== false || selected;

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
