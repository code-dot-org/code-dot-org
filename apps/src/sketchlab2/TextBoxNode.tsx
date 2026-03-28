import {
  Handle,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react';
import React, {useCallback, useState, useRef, useEffect, memo} from 'react';

import NodePalette, {type NodeShape} from './NodePalette';

import moduleStyles from './styles/sketchlab2-view.module.scss';

// All shapes use this height so they match the rectangle's rendered size
// (min-height 60px + padding 16px + border 4px = 80px in content-box).
const SHAPE_HEIGHT = 80;

// Default fill color (matches --neutral-base-black)
const DEFAULT_FILL = '#292f36';
const BORDER_COLOR = '#727a83'; // --neutral-gray-70
const SELECTED_BORDER_COLOR = '#ffffff'; // --neutral-base-white

interface TriangleSvgProps {
  fill: string;
  stroke: string;
}

// viewBox matches equilateral proportions: height = width × (√3/2) ≈ 86.6
const TriangleSvg: React.FC<TriangleSvgProps> = ({fill, stroke}) => (
  <svg
    className={moduleStyles.triangleSvg}
    viewBox="0 0 100 87"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon
      points="50,2 98,86 2,86"
      fill={fill}
      stroke={stroke}
      strokeWidth="3"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

const TextBoxNode: React.FC<NodeProps> = memo(({id, data, selected}) => {
  const {updateNodeData, setNodes} = useReactFlow();
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const text = (data.text as string) || '';
  const color = (data.color as string | null | undefined) ?? null;
  const shape = (data.shape as NodeShape | undefined) ?? 'rectangle';

  const onColorSelect = useCallback(
    (newColor: string | null) => {
      updateNodeData(id, {color: newColor});
    },
    [id, updateNodeData]
  );

  const onShapeSelect = useCallback(
    (newShape: NodeShape) => {
      const RECT_WIDTH = 170; // CSS min-width 150 + padding 16 + border 4 (content-box)
      const TRI_WIDTH = Math.round(SHAPE_HEIGHT * (2 / Math.sqrt(3)));

      setNodes(nodes =>
        nodes.map(n => {
          if (n.id !== id) return n;

          // Current width for centering offset
          const oldW =
            (n.style?.width as number | undefined) ??
            (n.measured as {width?: number} | undefined)?.width ??
            RECT_WIDTH;

          const newW =
            newShape === 'circle'
              ? SHAPE_HEIGHT
              : newShape === 'triangle'
              ? TRI_WIDTH
              : RECT_WIDTH;

          const dx = (oldW - newW) / 2;
          const pos = {x: n.position.x + dx, y: n.position.y};

          const base = {
            ...n,
            position: pos,
            data: {...n.data, shape: newShape},
          };

          if (newShape === 'circle') {
            return {
              ...base,
              width: SHAPE_HEIGHT,
              height: SHAPE_HEIGHT,
              style: {
                ...(n.style ?? {}),
                width: SHAPE_HEIGHT,
                height: SHAPE_HEIGHT,
              },
            };
          }
          if (newShape === 'triangle') {
            return {
              ...base,
              width: TRI_WIDTH,
              height: SHAPE_HEIGHT,
              style: {
                ...(n.style ?? {}),
                width: TRI_WIDTH,
                height: SHAPE_HEIGHT,
              },
            };
          }
          // Rectangle: clear explicit dimensions so CSS takes over
          const restStyle = {...((n.style ?? {}) as Record<string, unknown>)};
          delete restStyle.width;
          delete restStyle.height;
          return {
            ...base,
            width: undefined,
            height: undefined,
            style: restStyle,
          };
        })
      );
    },
    [id, setNodes]
  );

  const shapeClass =
    shape === 'circle'
      ? moduleStyles.textBoxNodeCircle
      : shape === 'triangle'
      ? moduleStyles.textBoxNodeTriangle
      : '';

  // Focus the textarea when entering edit mode
  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [editing]);

  const enterEditMode = useCallback(() => setEditing(true), []);
  const exitEditMode = useCallback(() => setEditing(false), []);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, {text: event.target.value});
    },
    [id, updateNodeData]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editing && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        enterEditMode();
      }
      if (editing && event.key === 'Escape') {
        exitEditMode();
      }
    },
    [editing, enterEditMode, exitEditMode]
  );

  const onTextareaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Escape') {
        exitEditMode();
        event.stopPropagation();
      }
      if (event.key === 'Enter') {
        event.stopPropagation();
      }
    },
    [exitEditMode]
  );

  const isTransparent = color === 'transparent';
  const fillColor = isTransparent ? 'transparent' : color ?? DEFAULT_FILL;
  const strokeColor =
    isTransparent && !selected
      ? 'transparent'
      : selected
      ? SELECTED_BORDER_COLOR
      : BORDER_COLOR;

  return (
    <>
      <NodeToolbar
        isVisible={selected && !editing}
        position={Position.Bottom}
        align="center"
        offset={23}
      >
        <NodePalette
          selectedColor={color}
          onColorSelect={onColorSelect}
          selectedShape={shape}
          onShapeSelect={onShapeSelect}
        />
      </NodeToolbar>
      <div
        className={`${moduleStyles.textBoxNode} ${shapeClass} ${
          selected ? moduleStyles.textBoxNodeSelected : ''
        } ${isTransparent ? moduleStyles.textBoxNodeTransparent : ''}`}
        style={
          shape !== 'triangle' && !isTransparent && color
            ? {backgroundColor: color}
            : undefined
        }
        onDoubleClick={enterEditMode}
        onKeyDown={onKeyDown}
        tabIndex={-1}
        aria-label="Text box node, double-click or press Enter to edit"
      >
        {shape === 'triangle' && (
          <TriangleSvg fill={fillColor} stroke={strokeColor} />
        )}
        <Handle type="target" position={Position.Top} style={{top: -6}} />
        <div
          className={`${moduleStyles.textBoxNodeContent} ${
            shape === 'triangle' ? moduleStyles.textBoxNodeContentTriangle : ''
          }`}
        >
          {editing ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={onChange}
              onBlur={exitEditMode}
              onKeyDown={onTextareaKeyDown}
              placeholder="Type here..."
              className={moduleStyles.textBoxNodeTextarea}
            />
          ) : (
            <div className={moduleStyles.textBoxNodeDisplay}>
              {text || (
                <span className={moduleStyles.textBoxNodePlaceholder}>
                  Double-click to edit
                </span>
              )}
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} style={{bottom: -6}} />
      </div>
    </>
  );
});

TextBoxNode.displayName = 'TextBoxNode';

export default TextBoxNode;
