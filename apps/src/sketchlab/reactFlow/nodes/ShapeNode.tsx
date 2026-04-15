import {Handle, NodeResizer, Position, useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useRef, useState} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {ShapeType} from '../types';

import styles from './shape-node.module.scss';

// SVG path for an equilateral-ish triangle filling a 100x100 viewBox.
const TRIANGLE_POINTS = '50,5 95,95 5,95';
const SHAPE_BORDER_PX = 2;

function ShapeSvg({shapeType}: {shapeType: ShapeType}) {
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
        <ellipse
          cx="50"
          cy="50"
          rx="48"
          ry="48"
          fill="none"
          stroke="currentColor"
          strokeWidth={SHAPE_BORDER_PX}
          vectorEffect="non-scaling-stroke"
        />
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
        <polygon
          points={TRIANGLE_POINTS}
          fill="none"
          stroke="currentColor"
          strokeWidth={SHAPE_BORDER_PX}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  // rectangle: styled via CSS border
  return null;
}

interface ShapeNodeProps {
  id: string;
  data: SketchlabReactFlowNode['data'];
  selected: boolean;
}

function ShapeNode({id, data, selected}: ShapeNodeProps) {
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const shapeType = data.shapeType as ShapeType;
  const label = (data.label as string) ?? '';

  const startEditing = useCallback(() => {
    if (isEditing) {
      return;
    }
    setIsEditing(true);
    setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.focus();
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
            labelRef.current.textContent = label;
          }
          setIsEditing(false);
        }
      }
    },
    [commitEdit, label, isEditing]
  );

  const isRectangle = shapeType === 'rectangle';

  return (
    <div
      className={styles.shapeNode}
      aria-label={`${shapeType} shape: ${label}`}
      onDoubleClick={startEditing}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      {/* Background shape */}
      {isRectangle ? (
        <div className={styles.rectangleBackground} aria-hidden="true" />
      ) : (
        <ShapeSvg shapeType={shapeType} />
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
        aria-label={`${shapeType} label${isEditing ? ' (editing)' : ''}`}
      >
        {label}
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
