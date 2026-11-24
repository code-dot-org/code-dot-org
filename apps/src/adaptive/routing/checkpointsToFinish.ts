import DCDO from '@cdo/apps/dcdo';

import {CheckpointStatusMap} from '../progress';
import {Pathway} from '../types';

export const FINISH_LOCK_FLAG = 'adaptive-finish-lock-enabled';

/**
 * Checkpoints still to clear before I'm finished opens, 0 once it is open,
 * or undefined when the pathway sets no requirement or the DCDO flag is
 * off. Only completed checkpoints count: a skipped one was routed past,
 * not done. The finish checkpoint is not counted.
 */
export function checkpointsToFinish(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): number | undefined {
  const required = pathway.finish?.requiredCheckpoints;
  if (!required || !DCDO.get(FINISH_LOCK_FLAG, true)) return undefined;
  const completed = pathway.checkpoints.filter(
    c => statusMap[c.id] === 'complete'
  ).length;
  return Math.max(0, required - completed);
}

/** Why I'm finished is disabled, for its tooltip. */
export function finishLockMessage(remaining: number): string {
  const noun = remaining === 1 ? 'checkpoint' : 'checkpoints';
  return `Complete ${remaining} more ${noun} to unlock the "I'm finished!" button.`;
}
