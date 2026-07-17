import {type NodeProps} from '@xyflow/react';
import classNames from 'classnames';
import React, {memo, useMemo} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {
  fontFamilyCss,
  fontSizePx,
  DEFAULT_TEXT_ALIGN,
} from '../elementToolbars/toolbarPalettes';
import {useConnectionHandleVisibility} from '../hooks/useConnectionHandleVisibility';
import {useInlineTextEditing} from '../hooks/useInlineTextEditing';
import {useRotatedHandleInternals} from '../hooks/useRotatedHandleInternals';
import {REACT_FLOW_INTERACTION_CLASS} from '../reactFlowSelectors';
import {ShapeNodeType, ShapeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import RotatedNodeResizer from './RotatedNodeResizer';

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

function ShapeNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<ShapeNodeType>) {
  const {showHandles, hoverHandlers} = useConnectionHandleVisibility(
    selected,
    isConnectable
  );
  const {shapeType, label, backgroundColor, strokeColor} = data;

  const {
    isEditing,
    editableRef: labelRef,
    startEditing,
    commitEdit,
    handleKeyDown: handleLabelKeyDown,
  } = useInlineTextEditing({
    id,
    field: 'label',
    value: label,
    locked: data.locked,
  });

  const isRectangle = shapeType === 'rectangle';
  const isCircle = shapeType === 'circle';
  const isTriangle = shapeType === 'triangle';
  const isDiamond = shapeType === 'diamond';

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
    if (data.fontColor && !isEditing) {
      style.color = data.fontColor;
    }
    style.fontSize = fontSizePx(data.fontSize);
    style.fontFamily = fontFamilyCss(data.fontFamily);
    style.textAlign = data.textAlign ?? DEFAULT_TEXT_ALIGN;
    return style;
  }, [
    data.fontColor,
    data.fontSize,
    data.fontFamily,
    data.textAlign,
    isEditing,
  ]);

  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );
  useRotatedHandleInternals(rotation);

  return (
    <div
      className={styles.shapeNode}
      aria-label={`${shapeType} shape: ${label}`}
      onDoubleClick={startEditing}
      {...hoverHandlers}
    >
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

        {/* Text label: double-click or Enter to start editing */}
        <div
          ref={labelRef}
          className={classNames(
            styles.label,
            isEditing && REACT_FLOW_INTERACTION_CLASS.noDrag,
            isEditing && REACT_FLOW_INTERACTION_CLASS.noPan,
            isCircle && styles.circleLabel,
            isTriangle && styles.triangleLabel,
            isDiamond && styles.diamondLabel,
            isRectangle && styles.rectangleLabel
          )}
          style={labelStyle}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onFocus={startEditing}
          onBlur={commitEdit}
          onKeyDown={handleLabelKeyDown}
          tabIndex={-1}
          role="textbox"
          aria-multiline={true}
          aria-label={`${shapeType} label${isEditing ? ' (editing)' : ''}`}
        >
          {label}
        </div>

        <RotatedNodeResizer
          isVisible={selected && !data.locked}
          rotation={rotation}
          minWidth={MIN_NODE_WIDTH}
          minHeight={MIN_NODE_HEIGHT}
        />

        <ConnectionHandles
          visible={showHandles}
          isConnectable={isConnectable}
          shapeType={shapeType}
        />
      </div>
    </div>
  );
}

export default memo(ShapeNode);
