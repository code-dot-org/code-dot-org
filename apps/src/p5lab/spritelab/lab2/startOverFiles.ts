// The files a project uploaded for its images and scene pictures, and their
// removal when Start Over leaves the project without them.

import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';

import {deleteProjectAsset} from './sceneThumbnails';
import {RuntimeAnimationList, Scene} from './types';

/** The files this project uploaded that its images and scenes name. */
export function uploadedFileUrls(
  channelId: string | undefined,
  animations: RuntimeAnimationList,
  scenes: Scene[]
): string[] {
  if (!channelId) {
    return [];
  }
  const urls = [
    ...Object.values(animations.propsByKey).map(props => props?.sourceUrl),
    ...scenes.map(scene => scene.thumbnail?.url),
  ].filter(
    (url): url is string => !!url && url.startsWith(`/v3/assets/${channelId}/`)
  );
  return [...new Set(urls)];
}

/**
 * Deletes each file once the project has been saved without it. A file the
 * saved project still names is kept, so a reset that fails to save leaves
 * the project's images working.
 */
export function deleteFilesOnceUnused(
  projectManager: ProjectManager | null | undefined,
  channelId: string | undefined,
  urls: string[]
): void {
  const waiting = new Set(urls);
  if (!projectManager || !channelId || !waiting.size) {
    return;
  }
  projectManager.addSaveSuccessListener(() => {
    if (!waiting.size) {
      return;
    }
    const saved = JSON.stringify(projectManager.getLastSource() ?? null);
    waiting.forEach(url => {
      if (!saved.includes(url)) {
        waiting.delete(url);
        deleteProjectAsset(channelId, url);
      }
    });
  });
}
