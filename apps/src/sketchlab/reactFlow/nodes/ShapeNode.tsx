import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import React, {memo, useCallback, useRef, useState} from 'react';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {ShapeNodeData, ShapeType} from '../types';

import styles from './shape-node.module.scss';

// SVG path for an equilateral-ish triangle filling a 100x100 viewBox.
const TRIANGLE_POINTS = '50,5 95,95 5,95';

function ShapeSvg({
  shapeType,
  fillColor,
}: {
  shapeType: ShapeType;
  fillColor: string;
}) {
  if (shapeType === 'circle') {
    return (
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={styles.shapeSvg}
      >
        <ellipse cx="50" cy="50" rx="50" ry="50" fill={fillColor} />
      </svg>
    );
  }
  if (shapeType === 'triangle') {
    return (
      <svg
        aria-hidden="true"
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={styles.shapeSvg}
      >
        <polygon points={TRIANGLE_POINTS} fill={fillColor} />
      </svg>
    );
  }
  // rectangle: use a styled div border instead of SVG
  return null;
}

function ShapeNode({id, data, selected}: NodeProps<Node<ShapeNodeData>>) {
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const startEditing = useCallback(() => {
    if (isEditing) {
      return;
    }
    setIsEditing(true);
    setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.focus();
        // Move cursor to end of text
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(labelRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [isEditing]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    const newLabel = labelRef.current?.textContent ?? '';
    updateNodeData(id, {label: newLabel});
  }, [id, updateNodeData]);

  const handleLabelKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isEditing) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          commitEdit();
        }
        if (event.key === 'Escape') {
          if (labelRef.current) {
            labelRef.current.textContent = data.label;
          }
          setIsEditing(false);
        }
      }
    },
    [commitEdit, data.label, isEditing]
  );

  const isRectangle = data.shapeType === 'rectangle';

  return (
    <div
      className={styles.shapeNode}
      aria-label={`${data.shapeType} shape: ${data.label}`}
      onDoubleClick={startEditing}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      {/* Background shape */}
      {isRectangle ? (
        <div
          className={styles.rectangleBackground}
          style={{backgroundColor: data.fillColor}}
          aria-hidden="true"
        />
      ) : (
        <ShapeSvg shapeType={data.shapeType} fillColor={data.fillColor} />
      )}

      {/* Text label: click or tab to start editing */}
      <div
        ref={labelRef}
        className={styles.label}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onFocus={startEditing}
        onBlur={commitEdit}
        onKeyDown={handleLabelKeyDown}
        tabIndex={0}
        role="textbox"
        aria-label={`${data.shapeType} label${isEditing ? ' (editing)' : ''}`}
      >
        {data.label}
      </div>

      {/* Connection handles */}
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
    </div>
  );
}

export default memo(ShapeNode);
