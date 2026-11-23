// Whether I'm finished waits on the pathway's finish.requiredCheckpoints.

import DCDO from '@cdo/apps/dcdo';

import {CheckpointStatusMap} from '../progress';
import {Pathway} from '../types';

export const FINISH_LOCK_FLAG = 'adaptive-finish-lock-enabled';

/**
 * Checkpoints still to clear before I'm finished opens, 0 once it is open,
 * or undefined when the pathway sets no requirement or the DCDO flag is
 * off. A cleared checkpoint is one that is complete or skipped; the finish
 * checkpoint is not counted.
 */
export function checkpointsToFinish(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): number | undefined {
  const required = pathway.finish?.requiredCheckpoints;
  if (!required || !DCDO.get(FINISH_LOCK_FLAG, true)) return undefined;
  const cleared = pathway.checkpoints.filter(
    c => statusMap[c.id] === 'complete' || statusMap[c.id] === 'skipped'
  ).length;
  return Math.max(0, required - cleared);
}

/** Why I'm finished is disabled, for its tooltip. */
export function finishLockMessage(remaining: number): string {
  const noun = remaining === 1 ? 'checkpoint' : 'checkpoints';
  return `Complete ${remaining} more ${noun} to unlock I'm finished!`;
}
