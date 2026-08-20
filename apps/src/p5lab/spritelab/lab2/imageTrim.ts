// Trim transparent borders off sprite images at load time, so content reaches
// the edges of the bounding box (AI-generated images carry generous margins).
// Saved project data is untouched.

import {BACKGROUNDS_CATEGORY, RuntimeAnimationList} from './types';

// Alpha above which a pixel counts as content: high enough to shed the soft
// matte's near-invisible fringe (which otherwise stretches sprite bounds
// past the visible art — platformer feet float on it), low enough to keep
// real soft edges.
const ALPHA_THRESHOLD = 32;

/**
 * The tight bounding box of non-transparent content in RGBA data, or null for
 * a fully transparent image. Pure; unit tested.
 */
export function findOpaqueBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number
): {left: number; top: number; right: number; bottom: number} | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < left) {
          left = x;
        }
        if (x > right) {
          right = x;
        }
        if (y < top) {
          top = y;
        }
        if (y > bottom) {
          bottom = y;
        }
      }
    }
  }
  return right < 0 ? null : {left, top, right, bottom};
}

// Trimming is deterministic; cache by source so re-runs don't redo the work.
const trimCache = new Map<string, Promise<string>>();

// Trimmed image per costume name, for the block image fields (dropdown
// thumbnails). Populated as animation lists get trimmed for preload.
const trimmedByName = new Map<string, string>();
const trimListeners = new Set<() => void>();

export function getTrimmedThumbnail(name: string): string | undefined {
  return trimmedByName.get(name);
}

// Notifies when new trims land, so already-rendered block thumbnails can
// refresh. Returns an unsubscribe.
export function onTrimsUpdated(listener: () => void): () => void {
  trimListeners.add(listener);
  return () => trimListeners.delete(listener);
}

/**
 * Load an image (dataURI or URL), crop transparent borders, and return the
 * cropped image as a dataURI. Returns the input unchanged when there's
 * nothing to trim (full-bleed content, fully transparent, or load failure).
 */
function trimTransparentBorder(source: string): Promise<string> {
  let cached = trimCache.get(source);
  if (!cached) {
    cached = new Promise<string>(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(source);
          }
          ctx.drawImage(img, 0, 0);
          const {data} = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const bounds = findOpaqueBounds(data, canvas.width, canvas.height);
          if (
            !bounds ||
            (bounds.left === 0 &&
              bounds.top === 0 &&
              bounds.right === canvas.width - 1 &&
              bounds.bottom === canvas.height - 1)
          ) {
            return resolve(source);
          }
          const w = bounds.right - bounds.left + 1;
          const h = bounds.bottom - bounds.top + 1;
          const cropped = document.createElement('canvas');
          cropped.width = w;
          cropped.height = h;
          cropped
            .getContext('2d')
            ?.drawImage(canvas, bounds.left, bounds.top, w, h, 0, 0, w, h);
          resolve(cropped.toDataURL('image/png'));
        } catch (e) {
          // e.g. a tainted canvas from a cross-origin image: use it as-is.
          resolve(source);
        }
      };
      img.onerror = () => resolve(source);
      img.src = source;
    });
    trimCache.set(source, cached);
  }
  return cached;
}

/**
 * Return a copy of a serialized animation list whose costume dataURIs are
 * border-trimmed. Backgrounds are left alone (they should fill the canvas).
 */
export async function trimAnimationListImages(
  list: RuntimeAnimationList
): Promise<RuntimeAnimationList> {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  let newTrims = false;
  // Drop cached trims for names absent from the list: a deleted image's
  // thumbnail must not resurface when a new image takes the same name.
  const currentNames = new Set(
    (list.orderedKeys || []).map(key => list.propsByKey[key]?.name)
  );
  for (const name of trimmedByName.keys()) {
    if (!currentNames.has(name)) {
      trimmedByName.delete(name);
      newTrims = true;
    }
  }
  await Promise.all(
    (list.orderedKeys || []).map(async key => {
      const props = list.propsByKey[key];
      if (!props) {
        return;
      }
      const isBackground = (props.categories || []).includes(
        BACKGROUNDS_CATEGORY
      );
      if (isBackground || !props.dataURI) {
        propsByKey[key] = props;
        return;
      }
      const trimmed = await trimTransparentBorder(props.dataURI);
      if (props.name && trimmedByName.get(props.name) !== trimmed) {
        trimmedByName.set(props.name, trimmed);
        newTrims = true;
      }
      propsByKey[key] = {...props, dataURI: trimmed};
    })
  );
  if (newTrims) {
    trimListeners.forEach(listener => listener());
  }
  return {orderedKeys: list.orderedKeys || [], propsByKey};
}
