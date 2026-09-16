// Which of a student's images a level's dropdowns start on. The image level
// that makes an image records a role on it (level_mode.imageRole); a later
// level names the role each dropdown should open on (image_defaults).

import {ImageType} from './ai/images/types';
import {imageTypeFromCategories} from './imageGallery';
import {RuntimeAnimationList} from './types';

/**
 * The image_defaults level property: which image, by role, each dropdown
 * starts on. A kind key sets every dropdown of that kind; a block type key
 * sets that block's sprite sockets one by one, in socket order (a single
 * role covers them all). Roles are the strings the unit's image levels
 * record through level_mode.imageRole.
 *
 *   {"sprite": "friend", "gamelab_checkTouching": ["hero", "friend"]}
 */
export type ImageDefaults = {
  sprite?: string;
  background?: string;
  block?: string;
  [blockType: string]: string | string[] | undefined;
};

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

/**
 * The image a dropdown of this kind should start on, or undefined to keep
 * the plain default (the newest image).
 */
export function defaultImageName(
  list: RuntimeAnimationList,
  defaults: ImageDefaults | undefined,
  kind: ImageType,
  slot?: ImageSlot
): string | undefined {
  return imageNamedForRole(list, kind, defaultRole(defaults, kind, slot));
}
