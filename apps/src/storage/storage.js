import DatablockStorage, {initDatablockStorage} from './datablockStorage';

export const DATABLOCK_STORAGE = 'DatablockStorage';

export let isInitialized = false;

export function storageBackend() {
  return DatablockStorage;
}

export function initStorage(storageType, config) {
  if (storageType === DATABLOCK_STORAGE) {
    isInitialized = true;
    return initDatablockStorage(config);
  } else {
    throw new Error(`Unknown storage type: ${storageType}`);
  }
}
