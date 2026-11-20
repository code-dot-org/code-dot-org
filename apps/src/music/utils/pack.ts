import {FIELD_SOUNDS_NAME} from '../blockly/constants';
import {DEFAULT_PACK} from '../constants';
import type MusicLibrary from '../player/MusicLibrary';

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

/**
 * The restricted pack that the sounds in a project's saved code come from.
 * A project's sounds can come from only one restricted pack, its own.
 */
export function findRestrictedPackInSource(
  source: string | undefined,
  library: MusicLibrary
): string | undefined {
  if (!source) {
    return undefined;
  }
  let code: unknown;
  try {
    code = JSON.parse(source);
  } catch {
    return undefined;
  }
  return findRestrictedPack(code, library);
}

function findRestrictedPack(
  node: unknown,
  library: MusicLibrary
): string | undefined {
  if (!node || typeof node !== 'object') {
    return undefined;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === FIELD_SOUNDS_NAME && typeof value === 'string') {
      const folder = library.getFolderForSoundId(value);
      if (folder?.restricted) {
        return folder.id;
      }
    } else {
      const packId = findRestrictedPack(value, library);
      if (packId) {
        return packId;
      }
    }
  }
  return undefined;
}
