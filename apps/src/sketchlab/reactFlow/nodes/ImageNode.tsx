import {NodeResizer, useConnection, type NodeProps} from '@xyflow/react';
import React, {memo, useMemo} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useIsAnchorDragging} from '../context';
import {ImageNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';

import styles from './image-node.module.scss';

function ImageNode({data, selected}: NodeProps<ImageNodeType>) {
  const {src, altText} = data;
  const connection = useConnection();
  const isAnchorDragging = useIsAnchorDragging();
  const showHandles = selected || isAnchorDragging || connection.inProgress;
  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );

  return (
    <div className={styles.imageNode} aria-label={altText || 'Image node'}>
      <NodeResizer
        isVisible={selected && !data.locked}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
      />

      <div className={styles.rotatable} style={rotatableStyle}>
        <img
          src={src}
          alt={altText}
          className={styles.image}
          draggable={false}
        />
      </div>

      <ConnectionHandles visible={showHandles} />
    </div>
  );
}

export default memo(ImageNode);
