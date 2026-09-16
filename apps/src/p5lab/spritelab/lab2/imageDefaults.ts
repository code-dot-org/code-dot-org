// Which of a student's images a level's dropdowns start on. The image level
// that makes an image records a role on it (level_mode.imageRole); a later
// level names the role each dropdown should open on (image_defaults).

import {ImageType} from './ai/images/types';
import {imageTypeFromCategories} from './imageGallery';
import {RuntimeAnimationList} from './types';

/**
 * The image_defaults level property. 'sprite', 'background' and 'block'
 * name the role every dropdown of that kind starts on; a block type names
 * the role of each of that block's sprite slots, in order.
 */
export type ImageDefaults = {[key: string]: string | string[]};

/** A dropdown's place on its block, for the per-block slot roles. */
export interface ImageSlot {
  blockType: string;
  index: number;
}

export function defaultRole(
  defaults: ImageDefaults | undefined,
  kind: ImageType,
  slot?: ImageSlot
): string | undefined {
  if (!defaults) {
    return undefined;
  }
  if (slot) {
    const forBlock = defaults[slot.blockType];
    const role = Array.isArray(forBlock) ? forBlock[slot.index] : forBlock;
    if (typeof role === 'string') {
      return role;
    }
  }
  const forKind = defaults[kind];
  return typeof forKind === 'string' ? forKind : undefined;
}

/** The newest image of the kind carrying the role, by name. */
export function imageNamedForRole(
  list: RuntimeAnimationList,
  kind: ImageType,
  role: string | undefined
): string | undefined {
  if (!role) {
    return undefined;
  }
  const key = (list.orderedKeys || []).find(k => {
    const props = list.propsByKey[k];
    return (
      props?.role === role && imageTypeFromCategories(props.categories) === kind
    );
  });
  return key ? list.propsByKey[key].name : undefined;
}

/** The image a dropdown of this kind should start on, or undefined to keep
    the plain default (the newest image). */
export function defaultImageName(
  list: RuntimeAnimationList,
  defaults: ImageDefaults | undefined,
  kind: ImageType,
  slot?: ImageSlot
): string | undefined {
  return imageNamedForRole(list, kind, defaultRole(defaults, kind, slot));
}
