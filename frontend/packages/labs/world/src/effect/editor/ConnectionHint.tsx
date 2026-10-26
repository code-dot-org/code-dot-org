import {useConnection, useReactFlow} from '@xyflow/react';

import type {EffectGraphScope} from '../model/types';
import type {EffectNodeRegistry} from '../nodes/registry';

import styles from './ConnectionHint.module.css';
import {
  explainRefusal,
  portInfoOf,
  type ResolvedPortTypes,
} from './connectionRules';
import {portColor} from './portTypes';

/** Estimated hint size, for keeping it inside the canvas. */
const HINT_WIDTH = 240;
const HINT_HEIGHT = 64;

export interface ConnectionHintProps {
  document: EffectGraphScope;
  registry: EffectNodeRegistry;
  containerRef: React.RefObject<HTMLDivElement>;
  /** Concrete types from the last compile, so generic ports explain right. */
  resolvedTypes?: ResolvedPortTypes;
}

/**
 * The "why not" that appears when a dragged wire hovers a port it cannot
 * join.
 *
 * `canConnect` refuses the drop silently; without this, the only feedback is
 * that nothing happens — and nothing-happens teaches nothing. The hint names
 * what the wire carries, what the port wants, and the node that converts
 * between them when one exists, while the learner is still looking at both
 * ends.
 *
 * A separate component on purpose: `useConnection` re-renders on every
 * pointer move during a drag, and that churn must not reach the canvas.
 */
export function ConnectionHint({
  document,
  registry,
  containerRef,
  resolvedTypes,
}: ConnectionHintProps) {
  const connection = useConnection();
  const {flowToScreenPosition} = useReactFlow();

  // Only while hovering a handle React Flow has judged invalid — over empty
  // canvas or a compatible port there is nothing to explain.
  if (
    !connection.inProgress ||
    connection.isValid !== false ||
    !connection.toHandle?.id ||
    !connection.fromHandle?.id
  ) {
    return null;
  }

  const reason = explainRefusal(
    document,
    registry,
    {
      nodeId: connection.fromHandle.nodeId,
      portId: connection.fromHandle.id,
      handleType: connection.fromHandle.type,
    },
    {
      nodeId: connection.toHandle.nodeId,
      portId: connection.toHandle.id,
      handleType: connection.toHandle.type,
    },
    resolvedTypes,
  );
  if (!reason) {
    return null;
  }

  const wireType = portInfoOf(
    document,
    registry,
    connection.fromHandle.nodeId,
    connection.fromHandle.id,
    connection.fromHandle.type,
  )?.type;

  const bounds = containerRef.current?.getBoundingClientRect();
  const screen = flowToScreenPosition(connection.to);
  const left = Math.max(
    8,
    Math.min(
      screen.x - (bounds?.left ?? 0) + 14,
      (bounds?.width ?? HINT_WIDTH) - HINT_WIDTH - 8,
    ),
  );
  const top = Math.max(
    8,
    Math.min(
      screen.y - (bounds?.top ?? 0) + 14,
      (bounds?.height ?? HINT_HEIGHT) - HINT_HEIGHT - 8,
    ),
  );

  return (
    <div className={styles.hint} style={{left, top}} role="status">
      {wireType !== undefined && (
        <span
          className={styles.wireDot}
          style={{backgroundColor: portColor(wireType)}}
          aria-hidden="true"
        />
      )}
      {reason}
    </div>
  );
}
