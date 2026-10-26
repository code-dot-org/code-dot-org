import {Handle, Position, type NodeProps} from '@xyflow/react';

import {GHOST_PORT} from '../model/constants';

import type {EffectGhostNodeData} from './flowMapping';
import styles from './GhostFlowNode.module.css';
import {ghostDisplayLabel} from './labels';
import {portColor, portTypeLabel} from './portTypes';
import {GHOST_SIZE} from './usePinnedGhosts';

/**
 * The end of a wire that belongs to a pinned row.
 *
 * `usePinnedGhosts` holds this just inside the canvas edge, directly below (or
 * above) the row knob it belongs to. It renders as a small dot rather than
 * nothing at all: the knob itself sits outside the canvas and cannot be
 * dragged from, so this is what a learner actually grabs to start a wire, and
 * it has to be both visible and hittable.
 */
export function GhostFlowNode({data}: NodeProps) {
  const {ghost} = data as unknown as EffectGhostNodeData;

  return (
    <div
      className={styles.ghost}
      style={{width: GHOST_SIZE, height: GHOST_SIZE}}
    >
      <Handle
        id={GHOST_PORT}
        type={ghost.role}
        position={ghost.role === 'source' ? Position.Bottom : Position.Top}
        className={styles.handle}
        // Centred on the node, which is the point `usePinnedGhosts` aligns to
        // the knob. This has to be inline: React Flow's own
        // `.react-flow__handle-bottom` rule would otherwise push the dot half
        // its height past the node edge, and it outranks any CSS module class.
        style={{
          left: '50%',
          top: '50%',
          right: 'auto',
          bottom: 'auto',
          width: GHOST_SIZE,
          height: GHOST_SIZE,
          transform: 'translate(-50%, -50%)',
          backgroundColor: portColor(ghost.type),
        }}
        title={`${ghostDisplayLabel(ghost)} — ${portTypeLabel(ghost.type)}`}
      >
        {/* Finger-sized start target; see the same pad in EffectFlowNode. */}
        <span className={styles.hitPad} aria-hidden="true" />
      </Handle>
    </div>
  );
}
