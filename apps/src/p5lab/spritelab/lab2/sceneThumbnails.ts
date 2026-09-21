// A picture of each scene for the scene picker: the first frame of the
// scene's most recent run, kept as a project asset. Captured cheaply on every
// run, but persisted only when the scene has changed in a way that could
// change the picture, and only once the student has paused editing. Also
// the scene list those pictures decorate, and the removal of a superseded
// picture's asset.

import HttpClient from '@cdo/apps/util/HttpClient';
import {hashString} from '@cdo/apps/utils';

import {SceneMetadata} from './redux/spriteLab2Redux';
import {forEachSavedBlock} from './scenesApi';
import {RuntimeAnimationList, Scene} from './types';

/** Thumbnails are square, like the stage. */
export const THUMBNAIL_PX = 160;

/** Part of every fingerprint. Bump it when the way a picture is taken
    changes, so stored pictures are retaken once. */
const CAPTURE_VERSION = 2;

/** How long the scene must go unchanged before a captured frame is kept. */
export const THUMBNAIL_QUIET_MS = 3000;

/**
 * What the picture depends on: the scene's code and world, and the files
 * behind the images they name. Two scenes with the same fingerprint draw
 * the same first frame, so a matching fingerprint means no new capture.
 */
export function sceneFingerprint(
  scene: Scene,
  animations: RuntimeAnimationList
): string {
  const body = JSON.stringify([scene.source ?? null, scene.world ?? null]);
  const images = animations.orderedKeys
    .map(key => animations.propsByKey[key])
    .filter(props => namesImage(body, props.name))
    .map(props => `${props.name}=${props.sourceUrl ?? ''}`)
    .sort();
  return hashString(`${CAPTURE_VERSION}\n${body}\n${images.join('\n')}`);
}

// An image name appears in serialized scene JSON as a plain string (a world
// cell) or as the quoted literal a picker field stores, which the outer
// JSON escapes.
function namesImage(body: string, name: string): boolean {
  const plain = JSON.stringify(name);
  const literal = JSON.stringify(`"${name}"`).slice(1, -1);
  return body.includes(plain) || body.includes(literal);
}

/** The asset a thumbnail is stored under; the fingerprint keeps a stale
    browser cache from showing an old picture under a reused name. */
export function thumbnailFileName(sceneId: string, fingerprint: string) {
  return `scene-thumb-${sceneId}-${fingerprint.slice(0, 8)}.png`;
}

/** A square copy of the stage, THUMBNAIL_PX on a side. Synchronous, so the
    frame is the one on screen when it is called. */
export function copyFrame(stage: HTMLCanvasElement): HTMLCanvasElement {
  const copy = document.createElement('canvas');
  copy.width = THUMBNAIL_PX;
  copy.height = THUMBNAIL_PX;
  const ctx = copy.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(stage, 0, 0, THUMBNAIL_PX, THUMBNAIL_PX);
  return copy;
}

export function canvasToPngBytes(
  canvas: HTMLCanvasElement
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (!blob) {
        reject(new Error('thumbnail encode failed'));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

/** The image name the scene's first set-background block names, if any: a
    stand-in picture for a scene that has not been run yet. */
export function sceneBackgroundImage(scene: Scene): string | null {
  let found: string | null = null;
  forEachSavedBlock(scene.source, block => {
    if (found || block.type !== 'gamelab_setBackgroundImageAs') {
      return;
    }
    const raw = block.fields?.IMG;
    if (typeof raw !== 'string' || !raw) {
      return;
    }
    // The field holds the quoted literal the generator emits.
    try {
      const name = JSON.parse(raw);
      found = typeof name === 'string' ? name : null;
    } catch (e) {
      found = raw;
    }
  });
  return found;
}

/** The scene list for the picker and the go-to-scene block: each with its
    stored picture, or, until it has one, the background its blocks name. */
export function sceneMetadataFor(
  scenes: Scene[],
  animations: RuntimeAnimationList
): SceneMetadata[] {
  return scenes.map(scene => {
    let thumbnail = scene.thumbnail?.url;
    if (!thumbnail) {
      const background = sceneBackgroundImage(scene);
      const key =
        background &&
        animations.orderedKeys.find(
          k => animations.propsByKey[k]?.name === background
        );
      const props = key ? animations.propsByKey[key] : undefined;
      thumbnail = props?.sourceUrl ?? props?.dataURI ?? undefined;
    }
    return {id: scene.id, name: scene.name, thumbnail};
  });
}

/** Best-effort removal of one of this project's own uploads. */
export function deleteProjectAsset(
  channelId: string | undefined,
  url: string | undefined
): void {
  if (url && channelId && url.startsWith(`/v3/assets/${channelId}/`)) {
    HttpClient.delete(url, true).catch(() => undefined);
  }
}
