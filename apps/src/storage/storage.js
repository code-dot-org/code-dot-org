import DatablockStorage, {initDatablockStorage} from './datablockStorage';
import FirebaseStorage, {initFirebaseStorage} from './firebaseStorage';

export const DATABLOCK_STORAGE = 'DatablockStorage';
export const FIREBASE_STORAGE = 'FirebaseStorage';

export let type;
export let isInitialized = false;

export function isDatablockStorage() {
  return getStorageType() === DATABLOCK_STORAGE;
}

// TODO: post-firebase-cleanup, remove this function: #56994
export function isFirebaseStorage() {
  return getStorageType() === FIREBASE_STORAGE;
}

export function getStorageType() {
  return type;
}

export function storageBackend() {
  // TODO: post-firebase-cleanup, remove this conditional: #56994
  if (type === DATABLOCK_STORAGE) {
    return DatablockStorage;
  } else if (type === FIREBASE_STORAGE) {
    return FirebaseStorage;
  } else {
    throw new Error(`Unknown storage type: ${type}`);
  }
}

export function initStorage(storageType, config) {
  type = storageType;
  // TODO: post-firebase-cleanup, remove this conditional: #56994
  if (storageType === DATABLOCK_STORAGE) {
    isInitialized = true;
    return initDatablockStorage(config);
  } else if (storageType === FIREBASE_STORAGE) {
    isInitialized = true;
    return initFirebaseStorage(config);
  } else {
    throw new Error(`Unknown storage type: ${storageType}`);
  }
}
