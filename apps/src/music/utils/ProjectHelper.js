// Helper method for setting up the project manager.
import ProjectManagerFactory from '../../labs/projects/ProjectManagerFactory';
import {ProjectManagerStorageType} from '../../labs/types';
import AppConfig, {getBlockMode} from '../appConfig';
import {REMOTE_STORAGE} from '../constants';

// Get the project manager for the current storage type.
// If no storage type is specified in AppConfig, use remote storage.
export function getProjectManager(projectId) {
  let storageType = AppConfig.getValue('storage-type');
  if (!storageType) {
    storageType = REMOTE_STORAGE;
  }
  storageType = storageType.toLowerCase();

  if (storageType === REMOTE_STORAGE) {
    return ProjectManagerFactory.getProjectManager(
      ProjectManagerStorageType.REMOTE,
      projectId
    );
  } else {
    return ProjectManagerFactory.getProjectManager(
      ProjectManagerStorageType.LOCAL,
      projectId || getLocalStorageKeyName()
    );
  }
}

function getLocalStorageKeyName() {
  // Save code for each block mode in a different local storage item.
  // This way, switching block modes will load appropriate user code.
  return 'musicLabSavedCode' + getBlockMode();
}
