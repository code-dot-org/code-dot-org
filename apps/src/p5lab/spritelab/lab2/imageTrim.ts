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
  height: number,
  // Pixels more opaque than this count as content; the default keeps
  // anything visible at all.
  alphaThreshold: number = ALPHA_THRESHOLD
): {left: number; top: number; right: number; bottom: number} | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
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

const frameThumbCache = new Map<string, Promise<string>>();
const thumbSourceCache = new Map<string, Promise<string>>();

// Thumbnail edge (px): about twice a list tile on high-density screens,
// half that where a device pixel is a CSS pixel — the memory-pressed
// machines are the low-density ones (a 224px thumb decodes ~200KB, a 112px
// one ~50KB). Everything that shows images in a list — the gallery, the
// world palette, the block dropdowns — reads these instead of decoding the
// full stored image into a small tile. Chosen once at load; a window moved
// between screens keeps the choice.
const THUMB_PX =
  typeof window !== 'undefined' && window.devicePixelRatio > 1.5 ? 224 : 112;

// Small display thumbnail per image name (border-trimmed for costumes,
// first frame for sheets, whole image for backgrounds). Populated as
// animation lists get trimmed for preload.
const thumbByName = new Map<string, string>();
const trimListeners = new Set<() => void>();

export function getImageThumbnail(name: string): string | undefined {
  return thumbByName.get(name);
}

/**
 * Downscale a dataURI to fit THUMB_PX, cached by source. Pixel art scales
 * with hard edges; anything else gets high-quality smoothing. Returns the
 * input on any failure.
 */
// Bounded because keys are whole source dataURIs, every edit mints a new
// one, and module state outlives levels. The limit sits far above any
// realistic project (the memory budget contemplates ~60 images) so a full
// gallery pass never evicts its own working set; entries are ~50KB, so the
// worst case holds ~12MB.
const THUMB_CACHE_LIMIT = 240;

// The sheet first-frame cache holds frame-sized images, a few hundred KB
// each, so its bound is tighter; projects hold a handful of sheets, so the
// working set still fits with room.
const FRAME_CACHE_LIMIT = 60;

function thumbnailFromDataURI(
  source: string,
  pixelated: boolean
): Promise<string> {
  let cached = thumbSourceCache.get(source);
  if (!cached) {
    cached = new Promise<string>(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale =
            THUMB_PX / Math.max(img.naturalWidth, img.naturalHeight);
          if (scale >= 1) {
            return resolve(source);
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(source);
          }
          ctx.imageSmoothingEnabled = !pixelated;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(source);
        }
      };
      img.onerror = () => resolve(source);
      img.src = source;
    });
    while (thumbSourceCache.size >= THUMB_CACHE_LIMIT) {
      thumbSourceCache.delete(thumbSourceCache.keys().next().value as string);
    }
    thumbSourceCache.set(source, cached);
  }
  return cached;
}

// Notifies when new trims land, so already-rendered block thumbnails can
// refresh. Returns an unsubscribe.
export function onTrimsUpdated(listener: () => void): () => void {
  trimListeners.add(listener);
  return () => trimListeners.delete(listener);
}

/**
 * Drop an image's cached thumbnail — its pixels changed to data that has
 * not arrived yet, so the cache would keep showing the old pixels. The
 * next trim pass repopulates it.
 */
export function forgetImageThumbnail(name?: string): void {
  if (name && thumbByName.delete(name)) {
    trimListeners.forEach(listener => listener());
  }
}

/**
 * Load an image (dataURI or URL), crop transparent borders, and return the
 * cropped image as a dataURI. Returns the input unchanged when there's
 * nothing to trim (full-bleed content, fully transparent, or load failure).
 * Uncached: deterministic work, tens of milliseconds per image, while a
 * cache keyed by whole source dataURIs — module state that outlives the
 * level — keeps old sources and their trimmed results alive indefinitely.
 */
function trimTransparentBorder(source: string): Promise<string> {
  return new Promise<string>(resolve => {
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
}

/** The animation list restricted to images whose data has arrived. */
export function loadedAnimations(
  list: RuntimeAnimationList
): RuntimeAnimationList {
  const orderedKeys = (list.orderedKeys || []).filter(
    key => list.propsByKey[key]?.dataURI
  );
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  orderedKeys.forEach(key => {
    propsByKey[key] = list.propsByKey[key];
  });
  return {orderedKeys, propsByKey};
}

/**
 * The first frame of a sprite sheet as a dataURI, for thumbnails. Cached by
 * source.
 */
function firstFrameThumbnail(
  source: string,
  frameSize: {x: number; y: number}
): Promise<string> {
  let cached = frameThumbCache.get(source);
  if (!cached) {
    cached = new Promise<string>(resolve => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = frameSize.x;
          canvas.height = frameSize.y;
          canvas
            .getContext('2d')
            ?.drawImage(
              img,
              0,
              0,
              frameSize.x,
              frameSize.y,
              0,
              0,
              frameSize.x,
              frameSize.y
            );
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(source);
        }
      };
      img.onerror = () => resolve(source);
      img.src = source;
    });
    while (frameThumbCache.size >= FRAME_CACHE_LIMIT) {
      frameThumbCache.delete(frameThumbCache.keys().next().value as string);
    }
    frameThumbCache.set(source, cached);
  }
  return cached;
}

/** Every animation name in a list. */
export function animationNames(list: RuntimeAnimationList): Set<string> {
  return new Set(
    (list.orderedKeys || [])
      .map(key => list.propsByKey[key]?.name)
      .filter((name): name is string => !!name)
  );
}

/**
 * The list restricted to the given animation names: the ones the program's
 * generators registered while it compiled (imageReferences.ts), so the
 * scene preload decodes exactly what the scene can put on stage. A name a
 * program builds at runtime (no block does today) decodes on demand instead
 * — the setAnimation wrapper in SpriteLab2Engine.
 */
export function filterAnimationsToNames(
  list: RuntimeAnimationList,
  names: Set<string>
): RuntimeAnimationList {
  const orderedKeys = (list.orderedKeys || []).filter(key => {
    const name = list.propsByKey[key]?.name;
    return !!name && names.has(name);
  });
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  orderedKeys.forEach(key => {
    propsByKey[key] = list.propsByKey[key];
  });
  return {orderedKeys, propsByKey};
}

/**
 * Return a copy of a serialized animation list whose costume dataURIs are
 * border-trimmed. Backgrounds are left alone (they should fill the canvas).
 * So are sprite sheets: their frame grid is their geometry, and trimming
 * the sheet's border would shift every frame off it — their thumbnail is
 * their first frame instead.
 *
 * keepNames lists every name in the project, so that a scene-scoped
 * subset doesn't prune thumbnails of images other scenes still use — a
 * thumbnail is only dropped for a name absent from the whole project.
 */
export async function trimAnimationListImages(
  list: RuntimeAnimationList,
  keepNames?: Set<string>
): Promise<RuntimeAnimationList> {
  const propsByKey: RuntimeAnimationList['propsByKey'] = {};
  let newTrims = false;
  // Drop cached trims for names absent from the list: a deleted image's
  // thumbnail must not resurface when a new image takes the same name.
  const currentNames = keepNames || animationNames(list);
  for (const name of thumbByName.keys()) {
    if (!currentNames.has(name)) {
      thumbByName.delete(name);
      newTrims = true;
    }
  }
  const noteThumb = (name: string | undefined, thumb: string) => {
    if (name && thumbByName.get(name) !== thumb) {
      thumbByName.set(name, thumb);
      newTrims = true;
    }
  };
  await Promise.all(
    (list.orderedKeys || []).map(async key => {
      const props = list.propsByKey[key];
      if (!props) {
        return;
      }
      const pixelated = !!props.pixelGridSize;
      const isBackground = (props.categories || []).includes(
        BACKGROUNDS_CATEGORY
      );
      if (isBackground || !props.dataURI) {
        if (isBackground && props.dataURI) {
          noteThumb(
            props.name,
            await thumbnailFromDataURI(props.dataURI, pixelated)
          );
        }
        propsByKey[key] = props;
        return;
      }
      const isSheet = props.frameCount > 1 && !!props.frameSize;
      // An image cropped at save time (props.trimmed) skips the pixel scan
      // and re-encode; its stored dataURI is already what trimming makes.
      const trimmed = isSheet
        ? await firstFrameThumbnail(props.dataURI, props.frameSize)
        : props.trimmed
        ? props.dataURI
        : await trimTransparentBorder(props.dataURI);
      noteThumb(props.name, await thumbnailFromDataURI(trimmed, pixelated));
      propsByKey[key] = isSheet ? props : {...props, dataURI: trimmed};
    })
  );
  if (newTrims) {
    trimListeners.forEach(listener => listener());
  }
  return {orderedKeys: list.orderedKeys || [], propsByKey};
}
