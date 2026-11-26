import {useCallback} from 'react';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {urlWithoutQuery} from '@cdo/apps/lab2/projects/utils';
import {RuntimeAnimationList} from '@cdo/apps/p5lab/spritelab/lab2/types';
import {getStore} from '@cdo/apps/redux';

const usedByAnImage = (url: string) => {
  // The classic store is untyped; its list has the lab's shape.
  const list: RuntimeAnimationList = getStore().getState().animationList;
  return Object.values(list.propsByKey).some(
    p => !!p?.sourceUrl && urlWithoutQuery(p.sourceUrl) === urlWithoutQuery(url)
  );
};

/**
 * Deletes an uploaded image file nothing uses anymore, once the project's
 * sources no longer name it (see ProjectManager.deleteFileOnceUnnamed).
 * Resolves true once the file is deleted, and at once for a data URI or no
 * url. Resolves false if an image uses the file, it is not one of this
 * project's uploads, or the delete fails. It stays unresolved while the
 * file waits.
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
    if (!manager) {
      return false;
    }
    return manager.deleteFileOnceUnnamed(url, () => usedByAnImage(url));
  }, []);
}
