import {DEFAULT_PACK} from '../constants';

/** The slice of a project's saved labConfig the pack rule reads. */
export interface MusicPackConfig {
  music?: {packId?: string};
}

/**
 * Whether a project's saved labConfig committed to the default sound pack.
 * A project with no pack recorded never settled the choice.
 */
export function isOnDefaultPack(labConfig?: MusicPackConfig): boolean {
  return labConfig?.music?.packId === DEFAULT_PACK;
}
