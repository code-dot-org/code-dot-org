// What kind of level this is, and everything that follows from it: the
// surfaces a student sees, and the image controls they get.

import {ImageSource} from './ai/images/imageCache';
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
  /** The level opens on the Images tab to make its image, then goes on to
      its own tabs. */
  imageFirst?: boolean;
  /** The level tells how AI made the student's image, after the first
      picture made in a visit. */
  learning?: boolean;
  /** Where the level's pictures come from (imageCache.ts); the tree first
      when unset. */
  imageSource?: ImageSource;
  /** The Images tab offers one image, of the level's imageType, with
      GENERATION_LIMIT generations of it and no adding, drawing or deleting.
      Unset, the tab is as in free play. */
  oneImage?: boolean;
  /** Tabs the level shows in addition to its kind's own, for example
      ["Images", "World"]. A level uses this to keep the editors of earlier
      levels available, so a student can go back and change their work
      without leaving the level. The level still opens on its kind's first
      tab. Names that are not editor tabs are ignored. */
  extraTabs?: string[];
  /** The Images tab has no New button: the student can regenerate or draw
      on the images it lists, but cannot add one. */
  noNewImages?: boolean;
  /** The Images tab has no Delete button. A level sets this when a later
      level depends on an image made earlier. Unset, an image can be deleted
      wherever images can be added, as in free play. */
  noDeletingImages?: boolean;
  /** The kinds of image the Images tab lists. Every kind when unset. */
  imageKinds?: ImageType[];
}

/** Generations a one-image level allows. */
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

/** The editor tabs a level may add with `extraTabs`. */
export const EXTRA_TABS: readonly Tab[] = ['Images', 'World', 'Code'];

/** The tabs a level shows; undefined, for the lab's default, when the kind
    is not one the lab knows. The first tab is where the level opens. */
export function tabsForMode(mode: LevelMode | undefined): Tab[] | undefined {
  const own = mode && TABS[mode.kind];
  if (!own) {
    return undefined;
  }
  const tabs: Tab[] =
    mode.imageFirst && !own.includes('Images') ? ['Images', ...own] : [...own];
  // The level's extra tabs go after its own, so they do not change where
  // the level opens.
  EXTRA_TABS.forEach(tab => {
    if (mode.extraTabs?.includes(tab) && !tabs.includes(tab)) {
      tabs.push(tab);
    }
  });
  return tabs;
}

/** Whether the level is a world level: its work is placing images on the
    World grid. */
export function editsWorld(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'world';
}

/** Whether the level is free play, the open-ended kind. */
export function isFreeplayMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'freeplay';
}

/** Whether the level keeps the student to one image (see oneImage). */
export function isOneImageMode(mode: LevelMode | undefined): boolean {
  return !!mode?.oneImage;
}

/** The source a mode's pictures come from: the tree first unless named. */
export function imageSourceForMode(mode: LevelMode | undefined): ImageSource {
  return mode?.imageSource ?? 'cached';
}
