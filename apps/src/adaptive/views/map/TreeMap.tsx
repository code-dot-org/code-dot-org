import {Typography as MuiTypography} from '@mui/material';
import React, {useMemo} from 'react';

import {DrawnEdge} from './layout/busRoutes';
import {layoutCheckpoints} from './layout/tree';
import {NODE_RADIUS} from './layout/types';
import MapBoard from './MapBoard';
import MapNode from './MapNode';
import {MapProps} from './MapView';

import styles from './treeMap.module.scss';

// Height of the title box above each circle, so the circle's center lands
// on the layout's (x, y). Edges stop at the top of the box.
const LABEL_HEIGHT = 40;
const NODE_WIDTH = 190;

/** The map as a tree: roots on top, lines curving down to each child. */
const TreeMap: React.FunctionComponent<MapProps> = ({
  pathway,
  statusMap,
  focusId,
  onSelect,
}) => {
  const layout = useMemo(
    () => layoutCheckpoints(pathway.checkpoints),
    [pathway]
  );
  const firstAvailableId = useMemo(
    () => pathway.checkpoints.find(c => statusMap[c.id] === 'available')?.id,
    [pathway.checkpoints, statusMap]
  );
  const lines = useMemo(
    (): DrawnEdge[] =>
      layout.edges.map(edge => {
        const a = layout.nodes[edge.from];
        const b = layout.nodes[edge.to];
        const y1 = a.y + NODE_RADIUS;
        const y2 = b.y - NODE_RADIUS - LABEL_HEIGHT;
        const mid = (y1 + y2) / 2;
        return {
          key: `${edge.from}-${edge.to}`,
          d: `M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`,
          edges: [edge],
        };
      }),
    [layout]
  );
  return (
    <MapBoard
      layout={layout}
      lines={lines}
      statusMap={statusMap}
      focus={focusId ? layout.nodes[focusId] : undefined}
    >
      {pathway.checkpoints.map(checkpoint => (
        <MapNode
          key={checkpoint.id}
          checkpoint={checkpoint}
          position={layout.nodes[checkpoint.id]}
          status={statusMap[checkpoint.id]}
          focusId={focusId}
          circleTop={NODE_RADIUS + LABEL_HEIGHT}
          width={NODE_WIDTH}
          above={
            <MuiTypography variant="strong" className={styles.nodeLabel}>
              {checkpoint.title}
            </MuiTypography>
          }
          onSelect={onSelect}
          tourId={
            checkpoint.id === firstAvailableId
              ? 'adaptive-tour-first-available'
              : undefined
          }
        />
      ))}
    </MapBoard>
  );
};

export default TreeMap;
