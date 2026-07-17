import {type NodeProps} from '@xyflow/react';
import React, {memo, useMemo} from 'react';

import {DEFAULT_ROTATION, MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useConnectionHandleVisibility} from '../hooks/useConnectionHandleVisibility';
import {ImageNodeType} from '../types';

import ConnectionHandles from './ConnectionHandles';
import RotatedNodeResizer from './RotatedNodeResizer';

import styles from './image-node.module.scss';

function ImageNode({data, selected, isConnectable}: NodeProps<ImageNodeType>) {
  const {src, altText} = data;
  const {showHandles, hoverHandlers} = useConnectionHandleVisibility(
    selected,
    isConnectable
  );
  const rotation = data.rotation ?? DEFAULT_ROTATION;
  const rotatableStyle: React.CSSProperties = useMemo(
    () => ({transform: `rotate(${rotation}deg)`}),
    [rotation]
  );

  return (
    <div className={styles.imageNode} {...hoverHandlers}>
      <div className={styles.rotatable} style={rotatableStyle}>
        <img
          src={src}
          alt={altText || 'Image node'}
          className={styles.image}
          draggable={false}
        />

        <RotatedNodeResizer
          isVisible={selected && !data.locked}
          rotation={rotation}
          minWidth={MIN_NODE_WIDTH}
          minHeight={MIN_NODE_HEIGHT}
        />
      </div>

      <ConnectionHandles visible={showHandles} isConnectable={isConnectable} />
    </div>
  );
}

export default memo(ImageNode);
