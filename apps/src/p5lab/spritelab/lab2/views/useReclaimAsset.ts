import {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// The file a link names; links to one file can differ in their query, such
// as a cache-busting ?t=<upload time>.
const fileOf = (url: string) => url.split('?')[0];

const usedByAnImage = (url: string) => {
  // The classic store is untyped; its list has the lab's shape.
  const list: RuntimeAnimationList = getStore().getState().animationList;
  return Object.values(list.propsByKey).some(
    p => !!p?.sourceUrl && fileOf(p.sourceUrl) === fileOf(url)
  );
};

const savedProjectMayName = (manager: ProjectManager, url: string) => {
  const saved = manager.getLastSource();
  // No saved sources to check: assume they still name the file.
  if (!saved) {
    return true;
  }
  const text = JSON.stringify(saved);
  const quotedPathWithoutEnd = JSON.stringify(fileOf(url)).slice(0, -1);
  // Followed by the closing quote or a query, so a file whose name only
  // starts with this path does not match.
  return (
    text.includes(`${quotedPathWithoutEnd}"`) ||
    text.includes(`${quotedPathWithoutEnd}?`)
  );
};

// Files waiting to be deleted, each with the resolver of its reclaim
// promise. Kept per project manager, since each manager's saves cover only
// its own project.
const pendingDeletes = new WeakMap<
  ProjectManager,
  Map<string, (deleted: boolean) => void>
>();

// Run only after a save finishes: while a save is in progress,
// getLastSource() is not what is being written.
function deleteFilesNoLongerSaved(manager: ProjectManager) {
  const files = pendingDeletes.get(manager);
  files?.forEach((resolve, url) => {
    if (usedByAnImage(url)) {
      files.delete(url);
      resolve(false);
      return;
    }
    if (savedProjectMayName(manager, url)) {
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
  let files = pendingDeletes.get(manager);
  if (!files) {
    files = new Map();
    pendingDeletes.set(manager, files);
    manager.addSaveSuccessListener(() => deleteFilesNoLongerSaved(manager));
    manager.addSaveNoopListener(() => deleteFilesNoLongerSaved(manager));
  }
  const promise = new Promise<boolean>(resolve => {
    // A second request for the same file, under any link, shares the first
    // one's answer.
    const earlier = files.get(fileOf(url));
    files.set(fileOf(url), deleted => {
      earlier?.(deleted);
      resolve(deleted);
    });
  });
  return promise;
}

/**
 * Deletes an uploaded image file nothing uses anymore, once a save of the
 * project that no longer names it has finished; deleting it sooner
 * could leave the saved project pointing at a missing file if the save
 * that drops it never completes.
 * Resolves true once the file is deleted, at once for a data URI or no url,
 * and false otherwise; until a save finishes it stays unresolved.
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
