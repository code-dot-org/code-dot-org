import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';

import {deleteProjectAsset, isProjectAsset} from './sceneThumbnails';
import {RuntimeAnimationList, Scene} from './types';

/** The files this project uploaded that its images and scenes name. */
export function uploadedFileUrls(
  channelId: string | undefined,
  animations: RuntimeAnimationList,
  scenes: Scene[]
): string[] {
  const urls = [
    ...Object.values(animations.propsByKey).map(props => props?.sourceUrl),
    ...scenes.map(scene => scene.thumbnail?.url),
  ].filter((url): url is string => isProjectAsset(channelId, url));
  return [...new Set(urls)];
}

/**
 * A file is deleted only after a save lands that does not name it, so a
 * reset that fails to save leaves the project's images working. A file the
 * project names again in the meantime (`inUse`) is kept: a scene's picture
 * has the same address each time it is taken of the same scene.
 */
export function deleteFilesOnceUnused(
  projectManager: ProjectManager | null | undefined,
  channelId: string | undefined,
  urls: string[],
  inUse: (url: string) => boolean = () => false
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
      if (!saved.includes(url) && !inUse(url)) {
        waiting.delete(url);
        deleteProjectAsset(channelId, url);
      }
    });
  });
}
