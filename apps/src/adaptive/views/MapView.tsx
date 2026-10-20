import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {
  CheckpointStatus,
  CheckpointStatusMap,
  STATUS_LABELS,
} from '../progress';
import {Pathway} from '../types';

import {NODE_RADIUS, layoutCheckpoints} from './layout';

import styles from './mapView.module.scss';

const ICONS: {[status in CheckpointStatus]: string} = {
  locked: 'lock',
  available: 'play',
  inProgress: 'ellipsis',
  complete: 'check',
};

// Height of the title box above each circle, so the circle's center lands
// on the layout's (x, y). Edges stop at the top of the box.
const LABEL_HEIGHT = 40;
const ZOOM = 1.5;

interface MapViewProps {
  pathway: Pathway;
  statusMap: CheckpointStatusMap;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  onSelect: (id: string) => void;
}

const MapView: React.FunctionComponent<MapViewProps> = ({
  pathway,
  statusMap,
  focusId,
  onSelect,
}) => {
  const layout = useMemo(
    () => layoutCheckpoints(pathway.checkpoints),
    [pathway]
  );
  const focus = focusId ? layout.nodes[focusId] : undefined;

  return (
    <div
      className={styles.board}
      style={{
        width: layout.width,
        height: layout.height,
        ...(focus && {
          transformOrigin: `${focus.x}px ${focus.y}px`,
          transform: `scale(${ZOOM})`,
        }),
      }}
    >
      <svg
        className={styles.edges}
        width={layout.width}
        height={layout.height}
        aria-hidden
      >
        {layout.edges.map(edge => {
          const a = layout.nodes[edge.from];
          const b = layout.nodes[edge.to];
          const y1 = a.y + NODE_RADIUS;
          const y2 = b.y - NODE_RADIUS - LABEL_HEIGHT;
          const mid = (y1 + y2) / 2;
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              className={classNames(
                styles.edge,
                statusMap[edge.from] === 'complete' && styles.edgeActive
              )}
              d={`M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`}
            />
          );
        })}
      </svg>
      {pathway.checkpoints.map(checkpoint => {
        const pos = layout.nodes[checkpoint.id];
        const status = statusMap[checkpoint.id];
        return (
          <div
            key={checkpoint.id}
            className={classNames(
              styles.node,
              styles[status],
              focusId && focusId !== checkpoint.id && styles.dimmed,
              focusId === checkpoint.id && styles.focused
            )}
            style={{left: pos.x, top: pos.y - NODE_RADIUS - LABEL_HEIGHT}}
          >
            <MuiTypography variant="strong" className={styles.nodeLabel}>
              {checkpoint.title}
            </MuiTypography>
            <button
              type="button"
              className={styles.circle}
              onClick={() => onSelect(checkpoint.id)}
              aria-label={`${checkpoint.title}: ${STATUS_LABELS[status]}`}
              aria-pressed={focusId === checkpoint.id}
            >
              <FontAwesomeV6Icon iconName={ICONS[status]} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default MapView;
