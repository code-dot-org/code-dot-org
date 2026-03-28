import {Handle, NodeResizer, Position, type NodeProps} from '@xyflow/react';
import React, {memo} from 'react';

import moduleStyles from './styles/sketchlab2-view.module.scss';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 60;

const ImageNode: React.FC<NodeProps> = memo(({data, selected}) => {
  const url = data.url as string;
  const filename = (data.filename as string) || 'image';

  return (
    <div
      className={`${moduleStyles.imageNode} ${
        selected ? moduleStyles.textBoxNodeSelected : ''
      }`}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
      />
      <Handle type="target" position={Position.Top} />
      <img
        src={url}
        alt={filename}
        className={moduleStyles.imageNodeImg}
        draggable={false}
      />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

ImageNode.displayName = 'ImageNode';

export default ImageNode;
