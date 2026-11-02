import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {CheckpointStatus, STATUS_LABELS} from '../../progress/model';
import {Checkpoint} from '../../types';

import {NodePosition} from './layout/types';

import styles from './mapNode.module.scss';

// Shown in the circle for a checkpoint with no skill icon.
const STATUS_ICONS: {[status in CheckpointStatus]: string} = {
  locked: 'lock',
  available: 'play',
  inProgress: 'ellipsis',
  complete: 'check',
  skipped: 'forward',
};

interface MapNodeProps {
  checkpoint: Checkpoint;
  position: NodePosition;
  status: CheckpointStatus;
  /** The skill's icon in the circle; the status icon when absent. */
  icon?: string;
  /** Checkpoint the map is zoomed onto, if any. */
  focusId?: string;
  /** How far the node's top sits above the circle's center. */
  circleTop: number;
  width: number;
  /** Rendered above the circle. */
  above?: React.ReactNode;
  /** Rendered after the circle. */
  children?: React.ReactNode;
  onSelect?: (id: string) => void;
  tourId?: string;
}

/** A checkpoint on the map: its circle, with the layout's title around it. */
const MapNode: React.FunctionComponent<MapNodeProps> = ({
  checkpoint,
  position,
  status,
  icon,
  focusId,
  circleTop,
  width,
  above,
  children,
  onSelect,
  tourId,
}) => (
  <div
    className={classNames(
      styles.node,
      styles[status],
      focusId && focusId !== checkpoint.id && styles.dimmed,
      focusId === checkpoint.id && styles.focused
    )}
    style={{left: position.x, top: position.y - circleTop, width}}
  >
    {above}
    {onSelect ? (
      <button
        type="button"
        id={tourId}
        className={styles.circle}
        data-checkpoint-id={checkpoint.id}
        onClick={() => onSelect(checkpoint.id)}
        aria-label={`${checkpoint.title}: ${STATUS_LABELS[status]}`}
        aria-pressed={focusId === checkpoint.id}
      >
        <FontAwesomeV6Icon iconName={icon ?? STATUS_ICONS[status]} />
        {icon && status === 'locked' && (
          <span className={styles.badge} aria-hidden="true">
            <FontAwesomeV6Icon iconName="lock" />
          </span>
        )}
      </button>
    ) : (
      <div
        id={tourId}
        className={styles.circle}
        data-checkpoint-id={checkpoint.id}
        role="img"
        aria-label={`${checkpoint.title}: ${STATUS_LABELS[status]}`}
      >
        <FontAwesomeV6Icon iconName={icon ?? STATUS_ICONS[status]} />
        {icon && status === 'locked' && (
          <span className={styles.badge} aria-hidden="true">
            <FontAwesomeV6Icon iconName="lock" />
          </span>
        )}
      </div>
    )}
    {children}
  </div>
);

export default MapNode;
