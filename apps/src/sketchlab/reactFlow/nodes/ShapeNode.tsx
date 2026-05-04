import {NodeResizer, useReactFlow, type NodeProps} from '@xyflow/react';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';
import ShapeNodeToolbar from '../elementToolbars/ShapeNodeToolbar';
import {fontSizePx} from '../elementToolbars/toolbarPalettes';
import {ShapeNodeType, ShapeType} from '../types';

import ConnectionHandles from './ConnectionHandles';

import styles from './shape-node.module.scss';

// SVG path for an equilateral-ish triangle filling a 100x100 viewBox.
const TRIANGLE_POINTS = '50,5 95,95 5,95';
// SVG path for a diamond (rhombus) filling a 100x100 viewBox: top, right, bottom, left.
const DIAMOND_POINTS = '50,5 95,50 50,95 5,50';
const SHAPE_BORDER_PX = 2;

interface ShapeSvgProps {
  shapeType: ShapeType;
  strokeColor?: string;
  backgroundColor?: string;
}

function ShapeSvg({shapeType, strokeColor, backgroundColor}: ShapeSvgProps) {
  const stroke = strokeColor ?? 'currentColor';
  const fill = backgroundColor ?? 'none';
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
          style={{fill, stroke}}
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
          style={{fill, stroke}}
          strokeWidth={SHAPE_BORDER_PX}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  if (shapeType === 'diamond') {
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
          points={DIAMOND_POINTS}
          style={{fill, stroke}}
          strokeWidth={SHAPE_BORDER_PX}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  // rectangle: styled via CSS border
  return null;
}

function ShapeNode({id, data, selected}: NodeProps<ShapeNodeType>) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const {shapeType, label, backgroundColor, strokeColor} = data;
  const showHandles = data.showHandles !== false;

  const startEditing = useCallback(() => {
    if (isEditing || readOnly || data.locked) {
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
  }, [isEditing, readOnly, data.locked]);

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
          labelRef.current?.closest<HTMLElement>('.react-flow__node')?.focus();
        }
        if (event.key === 'Escape') {
          if (labelRef.current) {
            labelRef.current.textContent = label;
          }
          setIsEditing(false);
          labelRef.current?.closest<HTMLElement>('.react-flow__node')?.focus();
        }
      }
    },
    [label, isEditing]
  );

  const isRectangle = shapeType === 'rectangle';

  const rectangleStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {};
    if (strokeColor) {
      style.borderColor = strokeColor;
    }
    if (backgroundColor) {
      style.backgroundColor = backgroundColor;
    }
    return style;
  }, [strokeColor, backgroundColor]);

  const labelStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {};
    if (data.fontColor) {
      style.color = data.fontColor;
    }
    style.fontSize = fontSizePx(data.fontSize);
    return style;
  }, [data.fontColor, data.fontSize]);

  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );

  return (
    <div
      className={styles.shapeNode}
      aria-label={`${shapeType} shape: ${label}`}
      onDoubleClick={startEditing}
    >
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <ShapeNodeToolbar nodeId={id} />

      <div className={styles.rotatable} style={rotatableStyle}>
        {/* Background shape */}
        {isRectangle ? (
          <div
            className={styles.rectangleBackground}
            style={rectangleStyle}
            aria-hidden="true"
          />
        ) : (
          <ShapeSvg
            shapeType={shapeType}
            strokeColor={strokeColor}
            backgroundColor={backgroundColor}
          />
        )}

        {/* Text label: click or enter to start editing */}
        <div
          ref={labelRef}
          className={styles.label}
          style={labelStyle}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onFocus={startEditing}
          onBlur={commitEdit}
          onKeyDown={handleLabelKeyDown}
          tabIndex={-1}
          role="textbox"
          aria-label={`${shapeType} label${isEditing ? ' (editing)' : ''}`}
        >
          {label}
        </div>
      </div>

      <ConnectionHandles visible={showHandles} />
    </div>
  );
}

export default memo(ShapeNode);
