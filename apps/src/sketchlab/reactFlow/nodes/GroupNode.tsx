import {type NodeProps} from '@xyflow/react';
import React, {memo} from 'react';

import {GroupNodeType} from '../types';

import styles from './group-node.module.scss';

function GroupNode(_props: NodeProps<GroupNodeType>) {
  return <div className={styles.groupNode} aria-label="Group" />;
}

export default memo(GroupNode);
