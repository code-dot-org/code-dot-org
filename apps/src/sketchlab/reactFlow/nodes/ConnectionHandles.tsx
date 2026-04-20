import {Handle, Position} from '@xyflow/react';
import React from 'react';

interface ConnectionHandlesProps {
  /** When false, handles stay in the DOM (so edges keep their anchors)
   *  but are visually hidden and non-interactive. */
  visible?: boolean;
}

const HIDDEN_STYLE: React.CSSProperties = {
  opacity: 0,
  pointerEvents: 'none',
};

/**
 * Paired source + target handles on all four sides of a node.
 * Target renders first so the source handle sits on top (grabbed when dragging).
 */
export default function ConnectionHandles({
  visible = true,
}: ConnectionHandlesProps) {
  const style = visible ? undefined : HIDDEN_STYLE;
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        style={style}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={style}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={style}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={style}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        style={style}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={style}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={style}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={style}
      />
    </>
  );
}
