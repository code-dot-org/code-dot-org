import {NodeResizer, useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useRef, useState} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';
import {ShapeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import ShapeNodeToolbar from './nodeToolbars/ShapeNodeToolbar';
import {fontSizePx} from './nodeToolbars/toolbarPalettes';

import styles from './shape-node.module.scss';

// SVG path for an equilateral-ish triangle filling a 100x100 viewBox.
const TRIANGLE_POINTS = '50,5 95,95 5,95';
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
  // rectangle: styled via CSS border
  return null;
}

interface ShapeNodeProps {
  id: string;
  data: SketchlabReactFlowNode['data'];
  selected: boolean;
}

function ShapeNode({id, data, selected}: ShapeNodeProps) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const shapeType = data.shapeType as ShapeType;
  const label = (data.label as string) ?? '';
  const backgroundColor = data.backgroundColor as string | undefined;
  const strokeColor = data.strokeColor as string | undefined;
  const fontColor = data.fontColor as string | undefined;
  const fontSize = fontSizePx(data.fontSize as string | undefined);
  const showHandles = data.showHandles !== false;

  const startEditing = useCallback(() => {
    if (isEditing || readOnly) {
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
  }, [isEditing, readOnly]);

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

  const rectangleStyle: React.CSSProperties = {};
  if (strokeColor) {
    rectangleStyle.borderColor = strokeColor;
  }
  if (backgroundColor) {
    rectangleStyle.backgroundColor = backgroundColor;
  }

  const labelStyle: React.CSSProperties = {};
  if (fontColor) {
    labelStyle.color = fontColor;
  }
  if (fontSize !== undefined) {
    labelStyle.fontSize = fontSize;
  }

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

      <ShapeNodeToolbar nodeId={id} />

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

      <ConnectionHandles visible={showHandles} />
    </div>
  );
}

export default memo(ShapeNode);
