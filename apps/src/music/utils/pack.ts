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

export function findRestrictedPacksInSource(
  source: string | undefined,
  library: MusicLibrary
): string[] {
  if (!source) {
    return [];
  }
  let code: unknown;
  try {
    code = JSON.parse(source);
  } catch {
    return [];
  }
  const packIds = new Set<string>();
  collectRestrictedPacks(code, library, packIds);
  return Array.from(packIds);
}

function collectRestrictedPacks(
  node: unknown,
  library: MusicLibrary,
  packIds: Set<string>
): void {
  if (!node || typeof node !== 'object') {
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === FIELD_SOUNDS_NAME && typeof value === 'string') {
      const folder = library.getFolderForSoundId(value);
      // The default pack is marked restricted, but a project on it uses no
      // restricted sounds.
      if (folder?.restricted && folder.id !== DEFAULT_PACK) {
        packIds.add(folder.id);
      }
    } else {
      collectRestrictedPacks(value, library, packIds);
    }
  }
}
