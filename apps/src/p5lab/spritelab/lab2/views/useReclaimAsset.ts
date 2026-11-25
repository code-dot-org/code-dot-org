import {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const usedByAnImage = (url: string) => {
  // The classic store is untyped; its list has the lab's shape.
  const list: RuntimeAnimationList = getStore().getState().animationList;
  return Object.values(list.propsByKey).some(p => p?.sourceUrl === url);
};

const savedProjectNames = (manager: ProjectManager, url: string) => {
  const saved = manager.getLastSource();
  // Nothing known to be saved yet: the file has to stay.
  return !saved || JSON.stringify(saved).includes(JSON.stringify(url));
};

// Files waiting to be deleted, each with the resolver of its reclaim
// promise. Kept per project manager, since a save only says what one
// project holds.
const waiting = new WeakMap<
  ProjectManager,
  Map<string, (deleted: boolean) => void>
>();

// Deletes each waiting file the saved project no longer names. Called only
// when a save finishes: during a save, the last saved sources are not what
// is being written. A file an image points at again is dropped from the
// list, not deleted.
function deleteUnsavedFiles(manager: ProjectManager) {
  const files = waiting.get(manager);
  files?.forEach((resolve, url) => {
    if (usedByAnImage(url)) {
      files.delete(url);
      resolve(false);
      return;
    }
    if (savedProjectNames(manager, url)) {
      return;
    }
    files.delete(url);
    HttpClient.delete(url, true).then(
      () => resolve(true),
      () => resolve(false)
    );
  });
}

function deleteOnceSavedWithout(
  manager: ProjectManager,
  url: string
): Promise<boolean> {
  let files = waiting.get(manager);
  if (!files) {
    files = new Map();
    waiting.set(manager, files);
    manager.addSaveSuccessListener(() => deleteUnsavedFiles(manager));
    manager.addSaveNoopListener(() => deleteUnsavedFiles(manager));
  }
  const promise = new Promise<boolean>(resolve => {
    // A second request for the same file shares the first one's answer.
    const earlier = files.get(url);
    files.set(url, deleted => {
      earlier?.(deleted);
      resolve(deleted);
    });
  });
  return promise;
}

/**
 * Deletes an uploaded image file nothing uses anymore, once a save of the
 * project that no longer names it has finished; a file deleted earlier
 * would be missing from a project whose save was then lost.
 * Resolves true once the file is deleted (or, for an image held inside the
 * project, once the project no longer contains it) and false otherwise.
 * A file still waiting when the page closes is left on the server.
 */
export default function useReclaimAsset(): (url?: string) => Promise<boolean> {
  const channelId = useAppSelector(state => state.lab.channel?.id);
  return useCallback(
    async (url?: string) => {
      if (!url) {
        return true;
      }
      if (usedByAnImage(url)) {
        return false;
      }
      // Data uris represent embedded images and do not correspond to a file on the server.
      if (url.startsWith('data:')) {
        return true;
      }
      // File we can't delete.
      if (!channelId || !url.startsWith(`/v3/assets/${channelId}/`)) {
        return false;
      }
      const manager = Lab2Registry.getInstance().getProjectManager();
      if (!manager) {
        return false;
      }
      return deleteOnceSavedWithout(manager, url);
    },
    [channelId]
  );
}
