import {DEFAULT_PACK} from '../constants';

/**
 * Whether a project's saved labConfig committed to the default sound pack.
 * A project with no pack recorded never settled the choice.
 */
export function isOnDefaultPack(labConfig?: {
  music?: {packId?: string};
}): boolean {
  return labConfig?.music?.packId === DEFAULT_PACK;
}
