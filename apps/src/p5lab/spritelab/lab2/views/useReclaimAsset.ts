import {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';
import HttpClient from '@cdo/apps/util/HttpClient';

/** A file's URL without its query, such as a cache-busting ?t=<time>. */
export const urlWithoutQuery = (url: string) => url.split('?')[0];

const usedByAnImage = (url: string) => {
  // The classic store is untyped; its list has the lab's shape.
  const list: RuntimeAnimationList = getStore().getState().animationList;
  return Object.values(list.propsByKey).some(
    p => !!p?.sourceUrl && urlWithoutQuery(p.sourceUrl) === urlWithoutQuery(url)
  );
};

// Whether serialized sources name a file. The path must be followed by its
// closing quote (escaped, when the sources hold JSON inside a string) or a
// query, so a file whose name only starts with this path does not match.
const textNamesFile = (text: string, file: string) => {
  const openQuotedPath = JSON.stringify(file).slice(0, -1);
  return ['"', '?', '\\'].some(next => text.includes(openQuotedPath + next));
};

// Files waiting to be deleted, by URL without query, each with the resolver
// of its reclaim promise. Kept per project manager, since a manager's
// sources cover only its own project.
const waitingFiles = new WeakMap<
  ProjectManager,
  Map<string, (deleted: boolean) => void>
>();

// Deletes each waiting file that no image uses and that neither the
// project's saved sources nor its sources waiting to be saved name. A file
// an image uses stops waiting. Nothing is deleted while the manager cannot
// say what the server holds.
function deleteUnnamedFiles(manager: ProjectManager) {
  const files = waitingFiles.get(manager);
  const settled = files?.size ? manager.getSettledSources() : undefined;
  if (!files || !settled) {
    return;
  }
  const sourcesText = JSON.stringify([settled.saved, settled.waiting ?? null]);
  files.forEach((resolve, file) => {
    if (usedByAnImage(file)) {
      files.delete(file);
      resolve(false);
      return;
    }
    if (textNamesFile(sourcesText, file)) {
      return;
    }
    files.delete(file);
    HttpClient.delete(file, true).then(
      () => resolve(true),
      () => resolve(false)
    );
  });
}

function deleteOnceUnnamed(
  manager: ProjectManager,
  url: string
): Promise<boolean> {
  let files = waitingFiles.get(manager);
  if (!files) {
    files = new Map();
    waitingFiles.set(manager, files);
    manager.addSourcesSettledListener(() => deleteUnnamedFiles(manager));
  }
  const waiting = files;
  const file = urlWithoutQuery(url);
  const promise = new Promise<boolean>(resolve => {
    // A second request for a file shares the first one's answer.
    const earlier = waiting.get(file);
    waiting.set(file, deleted => {
      earlier?.(deleted);
      resolve(deleted);
    });
  });
  deleteUnnamedFiles(manager);
  return promise;
}

/**
 * Deletes an uploaded image file nothing uses anymore, once neither the
 * project's saved sources nor its sources waiting to be saved name it, so
 * the saved project never names a deleted file. Earlier versions of the
 * project can still name one.
 * Resolves true once the file is deleted, and at once for a data URI or no
 * url. Resolves false if an image uses the file, the user does not own the
 * project, the file is not one of this project's uploads, there is no
 * project manager, or the delete fails.
 * It stays unresolved while the file waits, and a file still waiting when
 * the level or the page closes is left on the server.
 */
export default function useReclaimAsset(): (url?: string) => Promise<boolean> {
  return useCallback(async (url?: string) => {
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
    const manager = Lab2Registry.getInstance().getProjectManager();
    if (
      !manager?.getLastChannel()?.isOwner ||
      !url.startsWith(`/v3/assets/${manager.getChannelId()}/`)
    ) {
      return false;
    }
    return deleteOnceUnnamed(manager, url);
  }, []);
}
