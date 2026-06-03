import {NodeResizer, useReactFlow, type NodeProps} from '@xyflow/react';
import React, {memo, useCallback} from 'react';

import {
  SketchlabReactFlowEdge,
  SketchlabReactFlowNode,
} from '@cdo/apps/lab2/types';

import {MIN_NODE_HEIGHT, MIN_NODE_WIDTH} from '../constants';
import {GroupNodeType} from '../types';
import {getGroupPaddingFromChildren} from '../utils/grouping';

import styles from './group-node.module.scss';

function GroupNode({id, selected}: NodeProps<GroupNodeType>) {
  const {getNodes, updateNodeData} = useReactFlow<
    SketchlabReactFlowNode,
    SketchlabReactFlowEdge
  >();

  const handleResizeEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const nodes = getNodes();
      const groupNode = nodes.find(
        node => node.id === id && node.type === 'group'
      );
      if (!groupNode || groupNode.type !== 'group') {
        return;
      }

      const padding = getGroupPaddingFromChildren(groupNode, nodes);
      if (padding) {
        updateNodeData(id, {padding});
      }
    });
  }, [getNodes, id, updateNodeData]);

  return (
    <div className={styles.groupNode} aria-label="Group node">
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        onResizeEnd={handleResizeEnd}
      />
      <div className={styles.groupFrame} aria-hidden="true">
        <span className={styles.groupLabel}>Group</span>
      </div>
    </div>
  );
}

export default memo(GroupNode);
