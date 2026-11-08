import {Typography as MuiTypography} from '@mui/material';
import React, {useMemo} from 'react';

import {checkpointIcon} from './checkpointIcon';
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
  fit,
  onSelect,
  tourFocusIds,
}) => {
  const layout = useMemo(
    () => layoutCheckpoints(pathway.checkpoints),
    [pathway]
  );
  const tourFocus = useMemo(() => {
    if (!tourFocusIds?.length) return undefined;
    const positions = tourFocusIds.map(id => layout.nodes[id]).filter(Boolean);
    if (!positions.length) return undefined;
    // Visual extent of each node: label sits above the circle center.
    const xs = positions.map(p => p.x);
    const ys = positions.map(p => p.y);
    const minX = Math.min(...xs) - NODE_WIDTH / 2;
    const maxX = Math.max(...xs) + NODE_WIDTH / 2;
    const minY = Math.min(...ys) - NODE_RADIUS - LABEL_HEIGHT;
    const maxY = Math.max(...ys) + NODE_RADIUS;
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [tourFocusIds, layout.nodes]);
  const firstCheckpointId = pathway.checkpoints[0]?.id;
  const firstSkippedId = useMemo(
    () => pathway.checkpoints.find(c => statusMap[c.id] === 'skipped')?.id,
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
      fit={fit}
      tourFocus={tourFocus}
    >
      {pathway.checkpoints.map(checkpoint => (
        <MapNode
          key={checkpoint.id}
          checkpoint={checkpoint}
          position={layout.nodes[checkpoint.id]}
          status={statusMap[checkpoint.id]}
          icon={checkpointIcon(pathway, checkpoint)}
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
            checkpoint.id === firstSkippedId
              ? 'adaptive-tour-first-available'
              : checkpoint.id === firstCheckpointId
              ? 'adaptive-tour-first-checkpoint'
              : undefined
          }
        />
      ))}
    </MapBoard>
  );
};

export default TreeMap;
