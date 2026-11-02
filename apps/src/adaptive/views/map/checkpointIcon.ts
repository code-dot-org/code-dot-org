import {Checkpoint, Pathway} from '../../types';

/**
 * The icon a checkpoint's node shows: its first skill's, when that skill
 * has one. A checkpoint without one shows its status instead.
 */
export function checkpointIcon(
  pathway: Pathway,
  checkpoint: Checkpoint
): string | undefined {
  for (const skillId of checkpoint.skillIds ?? []) {
    const icon = pathway.skills[skillId]?.icon;
    if (icon) return icon;
  }
  return undefined;
}
