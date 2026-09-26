import {DEFAULT_PACK} from '../constants';
import {MusicLabConfig} from '../types';

/**
 * A project's saved labConfig as other labs receive it: MusicLabConfig's
 * shape with nothing guaranteed, since it is whatever JSON the project
 * carries, not a checked structure.
 */
export type SavedMusicLabConfig = {
  music?: Partial<MusicLabConfig['music']>;
};

/**
 * Whether a project's saved labConfig committed to the default sound pack.
 * A project with no pack recorded never settled the choice.
 */
export function isOnDefaultPack(labConfig?: SavedMusicLabConfig): boolean {
  return labConfig?.music?.packId === DEFAULT_PACK;
}
