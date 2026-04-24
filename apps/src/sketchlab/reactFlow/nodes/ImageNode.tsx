import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton} from '@mui/material';
import {NodeResizer, useReactFlow, type NodeProps} from '@xyflow/react';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';
import ImageNodeToolbar from '../toolbars/ImageNodeToolbar';
import {ImageNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';

import styles from './image-node.module.scss';

function ImageNode({id, data, selected}: NodeProps<ImageNodeType>) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState('');
  const cancelledRef = useRef(false);

  const {src, altText} = data;
  const showHandles = data.showHandles !== false;

  useEffect(() => {
    if (isEditingAlt) {
      document.getElementById(`alt-input-${id}`)?.focus();
    }
  }, [isEditingAlt, id]);

  const startEditingAlt = useCallback(() => {
    if (readOnly) {
      return;
    }
    setAltValue(altText);
    setIsEditingAlt(true);
  }, [readOnly, altText]);

  const commitAltEdit = useCallback(() => {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    setIsEditingAlt(false);
    updateNodeData(id, {altText: altValue});
  }, [altValue, id, updateNodeData]);

  const handleAltKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        (event.target as HTMLElement)
          .closest<HTMLElement>('.react-flow__node')
          ?.focus();
      }
      if (event.key === 'Escape') {
        cancelledRef.current = true;
        setIsEditingAlt(false);
        (event.target as HTMLElement)
          .closest<HTMLElement>('.react-flow__node')
          ?.focus();
      }
    },
    []
  );

  return (
    <div className={styles.imageNode} aria-label={altText || 'Image node'}>
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <ImageNodeToolbar nodeId={id} />

      <img src={src} alt={altText} className={styles.image} draggable={false} />

      {/* Alt-text editor: button is keyboard-accessible, opens inline input */}
      {isEditingAlt ? (
        <div className={styles.altEditor}>
          <TextField
            name={`alt-input-${id}`}
            id={`alt-input-${id}`}
            label="Alt text"
            value={altValue}
            onChange={e => setAltValue(e.target.value)}
            onBlur={commitAltEdit}
            onKeyDown={handleAltKeyDown}
            size="s"
          />
        </div>
      ) : (
        <MuiButton
          className={styles.editAltButton}
          onClick={startEditingAlt}
          aria-label="Edit alt text"
          title="Edit alt text"
          tabIndex={-1}
          color="secondary"
          variant="outlined"
          size="small"
        >
          Alt
        </MuiButton>
      )}

      <ConnectionHandles visible={showHandles} />
    </div>
  );
}

export default memo(ImageNode);
