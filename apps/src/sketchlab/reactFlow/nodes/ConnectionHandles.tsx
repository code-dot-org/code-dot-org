import {Handle, Position} from '@xyflow/react';
import React from 'react';

import styles from './connection-handles.module.scss';

interface ConnectionHandlesProps {
  /** When false, handles stay in the DOM (so edges keep their anchors)
   *  but are visually hidden and non-interactive. */
  visible?: boolean;
}

/**
 * Paired source + target handles on all four sides of a node.
 * Target renders first so the source handle sits on top (grabbed when dragging).
 */
export default function ConnectionHandles({
  visible = true,
}: ConnectionHandlesProps) {
  const className = visible ? undefined : styles.hidden;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={className}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className={className}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className={className}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={className}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className={className}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={className}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={className}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className={className}
      />
    </>
  );
}
