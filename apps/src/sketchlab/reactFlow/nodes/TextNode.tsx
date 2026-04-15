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
import {TextNodeData} from '../types';

import styles from './text-node.module.scss';

function TextNode({id, data, selected}: NodeProps<Node<TextNodeData>>) {
  const {updateNodeData} = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const startEditing = useCallback(() => {
    if (isEditing) {
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
  }, [isEditing]);

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
          commitEdit();
        }
        if (event.key === 'Escape') {
          if (textRef.current) {
            textRef.current.textContent = data.text;
          }
          setIsEditing(false);
        }
      }
    },
    [commitEdit, data.text, isEditing]
  );

  return (
    <div
      className={styles.textNode}
      aria-label={`Text: ${data.text}`}
      onDoubleClick={startEditing}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <div
        ref={textRef}
        className={styles.text}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onFocus={startEditing}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="textbox"
        aria-label={`Text content${isEditing ? ' (editing)' : ''}`}
      >
        {data.text}
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

export default memo(TextNode);
