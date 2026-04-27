import {NodeResizer, useReactFlow, type NodeProps} from '@xyflow/react';
import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';
import {TextNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import TextNodeToolbar from './nodeToolbars/TextNodeToolbar';
import {fontSizePx} from './nodeToolbars/toolbarPalettes';

import styles from './text-node.module.scss';

function TextNode({id, data, selected}: NodeProps<TextNodeType>) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const {text} = data;
  const showHandles = data.showHandles !== false;

  const textStyle: React.CSSProperties = useMemo(() => {
    const style: React.CSSProperties = {};
    if (data.fontColor) {
      style.color = data.fontColor;
    }
    style.fontSize = fontSizePx(data.fontSize);
    return style;
  }, [data.fontColor, data.fontSize]);

  const startEditing = useCallback(() => {
    if (isEditing || readOnly) {
      return;
    }
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
  }, [isEditing, readOnly]);

  const commitEdit = useCallback(() => {
    setIsEditing(false);
    const newText = textRef.current?.textContent ?? '';
    updateNodeData(id, {text: newText});
  }, [id, updateNodeData]);

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
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <TextNodeToolbar nodeId={id} />

      <div
        ref={textRef}
        className={styles.text}
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

      <ConnectionHandles visible={showHandles && selected} />
    </div>
  );
}

export default memo(TextNode);
