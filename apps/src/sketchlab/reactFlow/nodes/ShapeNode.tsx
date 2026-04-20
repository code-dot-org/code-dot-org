import {NodeResizer, useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  MIN_NODE_HEIGHT,
  MIN_NODE_WIDTH,
} from '../constants';
import {useSketchLabReadOnly} from '../context';
import {ShapeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import ShapeNodeToolbar from './ShapeNodeToolbar';
import {fontSizePx} from './shapePalettes';

import styles from './shape-node.module.scss';

// SVG path for an equilateral-ish triangle filling a 100x100 viewBox.
const TRIANGLE_POINTS = '50,5 95,95 5,95';
const SHAPE_BORDER_PX = 2;

// Approximate horizontal room the style toolbar occupies to the left of
// the node (in screen px). Used to decide whether to pan the view so the
// toolbar is fully on-screen when a shape is selected.
const TOOLBAR_VIEW_BUFFER_PX = 200;
const PAN_DURATION_MS = 250;

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
          fill={fill}
          stroke={stroke}
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
          fill={fill}
          stroke={stroke}
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
  const {updateNodeData, getNode, getViewport, setCenter} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);

  // When a shape is selected, ensure the node plus its left-side style
  // toolbar are in view. Pan without changing zoom when clipped.
  useEffect(() => {
    if (!selected || readOnly) {
      return;
    }
    const outer = outerRef.current;
    if (!outer) {
      return;
    }
    const container = outer.closest<HTMLElement>('.react-flow');
    if (!container) {
      return;
    }
    const node = getNode(id);
    if (!node) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const viewport = getViewport();
    const {zoom} = viewport;
    const width = node.measured?.width ?? DEFAULT_NODE_WIDTH;
    const height = node.measured?.height ?? DEFAULT_NODE_HEIGHT;

    const nodeLeft = node.position.x * zoom + viewport.x;
    const nodeTop = node.position.y * zoom + viewport.y;
    const nodeRight = nodeLeft + width * zoom;
    const nodeBottom = nodeTop + height * zoom;
    const toolbarAreaLeft = nodeLeft - TOOLBAR_VIEW_BUFFER_PX;

    const fullyVisible =
      toolbarAreaLeft >= 0 &&
      nodeRight <= containerRect.width &&
      nodeTop >= 0 &&
      nodeBottom <= containerRect.height;
    if (fullyVisible) {
      return;
    }

    // Shift the viewport so the toolbar fits to the left of the node.
    const centerX =
      node.position.x + width / 2 - TOOLBAR_VIEW_BUFFER_PX / (2 * zoom);
    const centerY = node.position.y + height / 2;
    setCenter(centerX, centerY, {zoom, duration: PAN_DURATION_MS});
  }, [selected, readOnly, id, getNode, getViewport, setCenter]);

  const shapeType = data.shapeType as ShapeType;
  const label = (data.label as string) ?? '';
  const backgroundColor = data.backgroundColor as string | undefined;
  const strokeColor = data.strokeColor as string | undefined;
  const fontColor = data.fontColor as string | undefined;
  const fontSize = fontSizePx(data.fontSize as string | undefined);

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
      ref={outerRef}
      className={styles.shapeNode}
      aria-label={`${shapeType} shape: ${label}`}
      onDoubleClick={startEditing}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <ShapeNodeToolbar nodeId={id} data={data} />

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

      <ConnectionHandles />
    </div>
  );
}

export default memo(ShapeNode);
