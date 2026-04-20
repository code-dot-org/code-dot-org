import {NodeResizer} from '@xyflow/react';
import React, {memo} from 'react';

import {MIN_LINE_HEIGHT, MIN_LINE_WIDTH} from '../constants';

import styles from './line-node.module.scss';

interface LineNodeProps {
  selected: boolean;
}

function LineNode({selected}: LineNodeProps) {
  return (
    <div className={styles.lineNode} aria-label="Line">
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_LINE_WIDTH}
        minHeight={MIN_LINE_HEIGHT}
      />
      <div className={styles.line} aria-hidden="true" />
    </div>
  );
}

export default memo(LineNode);
