import {Handle, Position} from '@xyflow/react';
import React from 'react';

/**
 * Paired source + target handles on all four sides of a node.
 * Target renders first so the source handle sits on top (grabbed when dragging).
 */
export default function ConnectionHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
    </>
  );
}
