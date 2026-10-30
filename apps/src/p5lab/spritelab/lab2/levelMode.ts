// What kind of level this is, and everything that follows from it: the
// surfaces a student sees, and the image controls they get.

import {ImageStyle, ImageSubject, ImageType} from './ai/images/types';
import {Tab} from './redux/spriteLab2Redux';

export type LevelModeKind = 'code' | 'world' | 'play' | 'image' | 'freeplay';

export interface LevelMode {
  kind: LevelModeKind;
  /** The kind of image the level is about. On a world level, the palette
      offers only the level's image of this kind (image_role_defaults, else
      the newest); a world level without one offers everything. */
  imageType?: ImageType;
  /** For a sprite: a character, which can be animated, or an object, which
      is one still picture with its own words. Character when unset. */
  imageSubject?: ImageSubject;
  /** Recorded on every image this level makes. The other end of the link
      is the image_role_defaults level property (imageRoleDefaults.ts), which code
      and world levels use to open their dropdowns on an image by role. */
  imageRole?: string;
  /** The World palette offers the images in these roles, of any kind,
      instead of the level's one image. */
  paletteRoles?: string[];
}

/** Generations a level before free play allows; free play has no limit. */
export const GENERATION_LIMIT = 5;

/** The style the advanced generate form starts on; the student form is
    pixel art only. */
export const DEFAULT_IMAGE_STYLE: ImageStyle = 'pixel';

/** The tabs a kind shows, the first being where the level opens. */
const TABS: Record<LevelModeKind, Tab[]> = {
  code: ['Code', 'Play'],
  world: ['World', 'Play'],
  play: ['Play'],
  image: ['Images'],
  freeplay: ['Code', 'Images', 'World', 'Play'],
};

/** The tabs a level shows. A code or world level that names an imageType
    makes that picture first, so Images comes before its own tabs. */
export function tabsForMode(mode: LevelMode | undefined): Tab[] | undefined {
  if (!mode) {
    return undefined;
  }
  const own = TABS[mode.kind];
  return mode.imageType && !own.includes('Images') ? ['Images', ...own] : own;
}

/** Whether the level is a world level: its work is placing images on the
    World grid. */
export function editsWorld(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'world';
}

/** The only mode offering the prompt box and the paint tools. */
export function isFreeplayMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'freeplay';
}
