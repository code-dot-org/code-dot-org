import {NodeResizer, type NodeProps} from '@xyflow/react';
import React, {memo} from 'react';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {useSketchLabReadOnly} from '../context';
import {GroupNodeType} from '../types';

import styles from './group-node.module.scss';

function GroupNode({selected, data}: NodeProps<GroupNodeType>) {
  const readOnly = useSketchLabReadOnly();
  const showResizer = selected && !readOnly && !data.locked;
  return (
    <div className={styles.groupNode} aria-label="Group">
      {showResizer && (
        <NodeResizer minWidth={MIN_NODE_WIDTH} minHeight={MIN_NODE_HEIGHT} />
      )}
    </div>
  );
}

export default memo(GroupNode);
