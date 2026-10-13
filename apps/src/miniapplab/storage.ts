import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {defaultBlocks, defaultDesign} from './defaultProject';
import {AppDesign} from './types';

// Until the lab has projects, the browser remembers the one app.
const designKey = 'miniapplab.design';
const blocksKey = 'miniapplab.blocks';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private windows and full storage just lose the autosave.
  }
}

export const loadDesign = () => read<AppDesign>(designKey, defaultDesign);
export const saveDesign = (design: AppDesign) => write(designKey, design);
export const loadBlocks = () =>
  read<WorkspaceSerialization>(blocksKey, defaultBlocks);
export const saveBlocks = (blocks: WorkspaceSerialization) =>
  write(blocksKey, blocks);

export function clearSaved() {
  try {
    window.localStorage.removeItem(designKey);
    window.localStorage.removeItem(blocksKey);
  } catch {
    // Nothing to clear.
  }
}
