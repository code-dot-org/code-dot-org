import type {ProjectSources} from '@cdo/apps/lab2/types';

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
 * A project's saved pack ID may be missing, or name a pack that none of
 * the sounds in the project's code come from.
 */
export function getPackIdForSources(
  sources: Partial<ProjectSources> | undefined,
  library: MusicLibrary
): string | undefined {
  const savedPackId = sources?.labConfig?.music?.packId || undefined;
  const packsInCode = findRestrictedPacksInSource(sources?.source, library);
  return savedPackId && packsInCode.includes(savedPackId)
    ? savedPackId
    : packsInCode[0] || savedPackId;
}

export function findRestrictedPacksInSource(
  source: ProjectSources['source'] | undefined,
  library: MusicLibrary
): string[] {
  if (typeof source !== 'string') {
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
      // The library marks the default pack as restricted, but choosing it
      // means choosing no restricted pack, so its sounds do not count.
      if (folder?.restricted && folder.id !== DEFAULT_PACK) {
        packIds.add(folder.id);
      }
    } else {
      collectRestrictedPacks(value, library, packIds);
    }
  }
}
