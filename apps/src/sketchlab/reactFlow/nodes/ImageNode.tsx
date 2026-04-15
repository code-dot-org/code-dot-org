import {Handle, NodeResizer, Position, useReactFlow} from '@xyflow/react';
import React, {memo, useCallback, useRef, useState} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';

import styles from './image-node.module.scss';

interface ImageNodeProps {
  id: string;
  data: SketchlabReactFlowNode['data'];
  selected: boolean;
}

function ImageNode({id, data, selected}: ImageNodeProps) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const altInputRef = useRef<HTMLInputElement>(null);

  const src = (data.src as string) ?? '';
  const altText = (data.altText as string) ?? '';

  const startEditingAlt = useCallback(() => {
    if (readOnly) {
      return;
    }
    setIsEditingAlt(true);
    setTimeout(() => altInputRef.current?.focus(), 0);
  }, [readOnly]);

  const commitAltEdit = useCallback(() => {
    setIsEditingAlt(false);
    const newAltText = altInputRef.current?.value ?? altText;
    updateNodeData(id, {altText: newAltText});
  }, [altText, id, updateNodeData]);

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
    <div className={styles.imageNode} aria-label={altText || 'Image node'}>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <img src={src} alt={altText} className={styles.image} draggable={false} />

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
            defaultValue={altText}
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
