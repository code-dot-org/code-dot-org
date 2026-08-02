import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {translate} from '../localization';

import {useEffectEditorContext} from './EffectEditorContext';
import styles from './EffectFlowEdge.module.css';

/** How far above the target dot the swizzle badge floats, in flow units. */
const SWIZZLE_BADGE_OFFSET = 16;

/**
 * A wire, with a delete button that appears when it is hovered or selected.
 *
 * Selecting a wire and pressing Delete works too, but that is not something a
 * learner discovers — nothing on screen suggests it. A button on the wire
 * itself is the affordance; the keyboard is the shortcut for people who
 * already know.
 */
export function EffectFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps) {
  const {disconnect, readOnly} = useEffectEditorContext();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const {active, swizzleLabel, swizzleColor} = (data ?? {}) as {
    active?: boolean;
    swizzleLabel?: string;
    swizzleColor?: string;
  };

  return (
    <>
      <BaseEdge id={id} path={path} style={style} />

      {/* Which components this wire picked off, named at the end where they
          arrive — the wire is a number by the time it gets here, and this is
          what says where that number came from. Always visible: a swizzle you
          have to hover to discover is a swizzle you will forget you made. */}
      {swizzleLabel && (
        <EdgeLabelRenderer>
          <span
            className={styles.swizzle}
            style={{
              transform: `translate(-50%, -50%) translate(${targetX}px, ${
                targetY - SWIZZLE_BADGE_OFFSET
              }px)`,
              borderColor: swizzleColor,
              color: swizzleColor,
            }}
            title={translate('This wire carries only {components}', {
              components: swizzleLabel,
            })}
          >
            {swizzleLabel}
          </span>
        </EdgeLabelRenderer>
      )}
      {active && !readOnly && (
        <EdgeLabelRenderer>
          <button
            type="button"
            className={styles.remove}
            // The label layer is not transformed with the viewport, so the
            // button has to be placed at the path's midpoint by hand.
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            aria-label={translate('Delete this wire')}
            title={translate('Delete this wire')}
            onClick={event => {
              // Without this the click also lands on the canvas and
              // immediately reselects what was just removed.
              event.stopPropagation();
              disconnect(id);
            }}
          >
            <FontAwesomeV6Icon iconName="xmark" iconStyle="solid" />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
