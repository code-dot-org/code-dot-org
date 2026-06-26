import {NodeResizer, useReactFlow, type NodeProps} from '@xyflow/react';
import classNames from 'classnames';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {usePushSnapshot, useSketchLabGrabMode, useSketchLabReadOnly} from '../context';
import {
  fontSizePx,
  DEFAULT_TEXT_ALIGN,
} from '../elementToolbars/toolbarPalettes';
import {useConnectionHandleVisibility} from '../hooks/useConnectionHandleVisibility';
import {TextNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';

import styles from './text-node.module.scss';

function TextNode({
  id,
  data,
  selected,
  isConnectable,
}: NodeProps<TextNodeType>) {
  const readOnly = useSketchLabReadOnly();
  const grabMode = useSketchLabGrabMode();
  const {updateNodeData} = useReactFlow();
  const pushSnapshot = usePushSnapshot();
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const textAtEditStart = useRef<string>('');

  const {showHandles, hoverHandlers} = useConnectionHandleVisibility(
    selected,
    isConnectable
  );
  const {text} = data;

  const textStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {};
    if (data.fontColor) {
      style.color = data.fontColor;
    }
    style.fontSize = fontSizePx(data.fontSize);
    style.textAlign = data.textAlign ?? DEFAULT_TEXT_ALIGN;
    return style;
  }, [data.fontColor, data.fontSize, data.textAlign]);

  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );

  const startEditing = useCallback(() => {
    if (isEditing || readOnly || grabMode || data.locked) {
      return;
    }
    textAtEditStart.current = text;
    setIsEditing(true);
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(textRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  }, [isEditing, readOnly, grabMode, data.locked, text]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    // innerText preserves visible newlines from <br> and block-element
    // boundaries that contentEditable inserts on Shift+Enter; textContent
    // would flatten them.
    const newText = textRef.current?.innerText ?? '';
    if (newText !== textAtEditStart.current) {
      pushSnapshot();
    }
    updateNodeData(id, {text: newText});
  }, [id, pushSnapshot, updateNodeData]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isEditing) {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          textRef.current?.closest<HTMLElement>('.react-flow__node')?.focus();
        }
        if (event.key === 'Escape') {
          if (textRef.current) {
            textRef.current.textContent = text;
          }
          setIsEditing(false);
          textRef.current?.closest<HTMLElement>('.react-flow__node')?.focus();
        }
      }
    },
    [text, isEditing]
  );

  return (
    <div
      className={styles.textNode}
      aria-label={`Text: ${text}`}
      onDoubleClick={startEditing}
      {...hoverHandlers}
    >
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <div className={styles.rotatable} style={rotatableStyle}>
        <div
          ref={textRef}
          className={classNames(styles.text, isEditing && 'nodrag nopan')}
          style={textStyle}
          contentEditable={isEditing}
          suppressContentEditableWarning
          onFocus={startEditing}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="textbox"
          aria-label={`Text content${isEditing ? ' (editing)' : ''}`}
        >
          {text}
        </div>
      </div>

      <ConnectionHandles visible={showHandles} isConnectable={isConnectable} />
    </div>
  );
}

export default memo(TextNode);
