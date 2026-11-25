import {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// The file a link names; links to one file can differ in their query, such
// as a cache-busting ?t=<upload time>.
export const fileOf = (url: string) => url.split('?')[0];

const usedByAnImage = (url: string) => {
  // The classic store is untyped; its list has the lab's shape.
  const list: RuntimeAnimationList = getStore().getState().animationList;
  return Object.values(list.propsByKey).some(
    p => !!p?.sourceUrl && fileOf(p.sourceUrl) === fileOf(url)
  );
};

// The last saved sources as text, or undefined when nothing is known to be
// saved yet.
const savedText = (manager: ProjectManager) => {
  const saved = manager.getLastSource();
  return saved ? JSON.stringify(saved) : undefined;
};

const savedTextMayName = (text: string | undefined, url: string) => {
  // No saved sources to check: assume they still name the file.
  if (text === undefined) {
    return true;
  }
  const openQuotedPath = JSON.stringify(fileOf(url)).slice(0, -1);
  // The path must be followed by its closing quote or a ?, so a file whose
  // name only starts with this path does not match.
  return (
    text.includes(`${openQuotedPath}"`) || text.includes(`${openQuotedPath}?`)
  );
};

// Files waiting to be deleted, each with the resolver of its reclaim
// promise. Kept per project manager, since each manager's saves cover only
// its own project.
const pendingDeletes = new WeakMap<
  ProjectManager,
  Map<string, (deleted: boolean) => void>
>();

// getLastSource() holds the sources the server last stored. A save still
// in flight may name a file they don't, so wait for that save's success
// event before deleting.
function deleteFilesNoLongerSaved(manager: ProjectManager) {
  if (manager.isSaveInProgress()) {
    return;
  }
  const files = pendingDeletes.get(manager);
  const text = files?.size ? savedText(manager) : undefined;
  files?.forEach((resolve, url) => {
    if (usedByAnImage(url)) {
      files.delete(url);
      resolve(false);
      return;
    }
    if (savedTextMayName(text, url)) {
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
 * Resolves true once the file is deleted, and at once for a data URI or no
 * url. Resolves false if an image uses the file, it is not one of this
 * project's uploads, or the delete fails. It stays unresolved while the
 * file waits, and a file still waiting when the page closes is left on the
 * server.
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
