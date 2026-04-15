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
import {ImageNodeData} from '../types';

import styles from './ImageNode.module.scss';

function ImageNode({id, data, selected}: NodeProps<Node<ImageNodeData>>) {
  const {updateNodeData} = useReactFlow();
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const altInputRef = useRef<HTMLInputElement>(null);

  const startEditingAlt = useCallback(() => {
    setIsEditingAlt(true);
    setTimeout(() => altInputRef.current?.focus(), 0);
  }, []);

  const commitAltEdit = useCallback(() => {
    setIsEditingAlt(false);
    const newAltText = altInputRef.current?.value ?? data.altText;
    updateNodeData(id, {altText: newAltText});
  }, [data.altText, id, updateNodeData]);

  const handleAltKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        commitAltEdit();
      }
      if (event.key === 'Escape') {
        setIsEditingAlt(false);
      }
    },
    [commitAltEdit]
  );

  return (
    <div className={styles.imageNode} aria-label={data.altText || 'Image node'}>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <img
        src={data.src}
        alt={data.altText}
        className={styles.image}
        draggable={false}
      />

      {/* Alt-text editor: button is keyboard-accessible, opens inline input */}
      {isEditingAlt ? (
        <div className={styles.altEditor}>
          <label htmlFor={`alt-input-${id}`} className={styles.altLabel}>
            Alt text
          </label>
          <input
            id={`alt-input-${id}`}
            ref={altInputRef}
            type="text"
            defaultValue={data.altText}
            onBlur={commitAltEdit}
            onKeyDown={handleAltKeyDown}
            className={styles.altInput}
          />
        </div>
      ) : (
        <button
          type="button"
          className={styles.editAltButton}
          onClick={startEditingAlt}
          aria-label="Edit alt text"
          title="Edit alt text"
        >
          Alt
        </button>
      )}

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

export default memo(ImageNode);
