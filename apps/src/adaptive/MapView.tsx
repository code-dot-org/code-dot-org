import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {NODE_RADIUS, layoutCheckpoints} from './layout';
import {CheckpointStatus, STATUS_LABELS} from './progress';
import {Pathway} from './types';

import moduleStyles from './pathway.module.scss';

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
  statuses: {[id: string]: CheckpointStatus};
  focusId?: string;
  /** Badged as the suggested next checkpoint while it is available. */
  recommendedId?: string;
  onSelect: (id: string) => void;
}

const MapView: React.FunctionComponent<MapViewProps> = ({
  pathway,
  statuses,
  focusId,
  recommendedId,
  onSelect,
}) => {
  const layout = useMemo(
    () => layoutCheckpoints(pathway.checkpoints),
    [pathway]
  );
  const focus = focusId ? layout.nodes[focusId] : undefined;

  return (
    <div
      className={moduleStyles.board}
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
        className={moduleStyles.edges}
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
                moduleStyles.edge,
                statuses[edge.from] === 'complete' && moduleStyles.edgeActive
              )}
              d={`M ${a.x} ${y1} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y2}`}
            />
          );
        })}
      </svg>
      {pathway.checkpoints.map(checkpoint => {
        const pos = layout.nodes[checkpoint.id];
        const status = statuses[checkpoint.id];
        return (
          <div
            key={checkpoint.id}
            className={classNames(
              moduleStyles.node,
              moduleStyles[status],
              focusId && focusId !== checkpoint.id && moduleStyles.dimmed,
              focusId === checkpoint.id && moduleStyles.focused
            )}
            style={{left: pos.x, top: pos.y - NODE_RADIUS - LABEL_HEIGHT}}
          >
            {recommendedId === checkpoint.id && status === 'available' && (
              <span className={moduleStyles.recommended}>
                <FontAwesomeV6Icon iconName="star" /> Recommended
              </span>
            )}
            <MuiTypography variant="strong" className={moduleStyles.nodeLabel}>
              {checkpoint.title}
            </MuiTypography>
            <button
              type="button"
              className={moduleStyles.circle}
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
