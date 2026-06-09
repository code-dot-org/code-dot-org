import {Handle, Position} from '@xyflow/react';
import React from 'react';

import {ShapeType} from '../types';

import styles from './connection-handles.module.scss';

interface ConnectionHandlesProps {
  /** When false, handles stay in the DOM (so edges keep their anchors)
   *  but are visually hidden and non-interactive. */
  visible?: boolean;
  /** When false, handles can't start or accept a connection (e.g. the node
   *  is locked or the canvas is read-only). Existing edges stay attached. */
  isConnectable?: boolean;
  shapeType?: ShapeType;
}

// Triangle SVG points: '50,5 95,95 5,95' in a 100×100 viewBox.
// Midpoints of the three sides as percentages of the node's bounding box.
const TRIANGLE_SIDE_MIDPOINTS = [
  {id: 'side-left', position: Position.Left, left: '27.5%', top: '50%'},
  {id: 'side-right', position: Position.Right, left: '72.5%', top: '50%'},
  {id: 'side-bottom', position: Position.Bottom, left: '50%', top: '95%'},
] as const;

/**
 * Paired source + target handles on all four sides of a node.
 * For triangles, handles are placed at the midpoints of the three sides instead.
 * Target renders first so the source handle sits on top (grabbed when dragging).
 */
export default function ConnectionHandles({
  visible = true,
  isConnectable = true,
  shapeType,
}: ConnectionHandlesProps) {
  const className = visible ? undefined : styles.hidden;

  if (shapeType === 'triangle') {
    return (
      <>
        {TRIANGLE_SIDE_MIDPOINTS.map(({id, position, left, top}) => {
          const handleStyle: React.CSSProperties = {
            top,
            left,
            transform: 'translate(-50%, -50%)',
          };
          return (
            <React.Fragment key={id}>
              <Handle
                type="target"
                position={position}
                id={`${id}-target`}
                isConnectable={isConnectable}
                className={className}
                style={handleStyle}
              />
              <Handle
                type="source"
                position={position}
                id={`${id}-source`}
                isConnectable={isConnectable}
                className={className}
                style={handleStyle}
              />
            </React.Fragment>
          );
        })}
      </>
    );
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className={className}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={isConnectable}
        className={className}
      />
    </>
  );
}
