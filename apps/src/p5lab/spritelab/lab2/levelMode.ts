// The level_mode property of a level saved before level_config. The lab
// reads a level's settings as a level_config (levelConfig/levelConfigOf.ts).

import {ImageSource} from './ai/images/imageCache';
import {ImageStyle, ImageSubject, ImageType} from './ai/images/types';
import {Tab} from './redux/spriteLab2Redux';

export type LevelModeKind = 'code' | 'world' | 'play' | 'image' | 'freeplay';

export interface LevelMode {
  kind: LevelModeKind;
  /** The only type the Images tab makes. On a world level, the palette offers 
      only the level's image of this type (image_role_defaults, else the newest); a world level
      without one offers everything. Unset, the images tab makes any type. */
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
  /** Enable student upload. If the level sets an image type, the upload will be of that type,
   * otherwise the student assigns a type. */
  enableImageUpload?: boolean;
  /** Where the level's pictures come from (imageCache.ts); the cache when
      unset. */
  imageSource?: ImageSource;
  /** The Images tab offers one image, of the level's imageType, with no
      adding or deleting. Unset, the tab is as in free play. */
  oneImage?: boolean;
  /** Tabs the level shows in addition to its kind's own, for example
      ["Images", "World"]. A level uses this to keep the editors of earlier
      levels available, so a student can go back and change their work
      without leaving the level. The level still opens on its kind's first
      tab. Names that are not editor tabs are ignored. */
  extraTabs?: string[];
  /** The tab the level opens on, in place of its kind's first. Ignored
      unless the level shows that tab. */
  startTab?: Tab;
  /** The Images tab has no New button: the student can regenerate or draw
      on the images it lists, but cannot add one. */
  noNewImages?: boolean;
  /** The Images tab has no Delete button. A level sets this when a later
      level depends on an image made earlier. Unset, Delete is offered as
      in free play, except on a one-image level, which never offers it. */
  noDeletingImages?: boolean;
  /** The paint tools are the limited set: a fixed set of colors and one
      brush. A level sets this when it is not about painting. Unset, they
      are as in free play, on a one-image level too. */
  limitedPaintTools?: boolean;
  /** The kinds of image the Images tab lists. Every kind when unset. */
  imageKinds?: ImageType[];
  /** How many pictures the student can generate in one visit to the
      level, counted across all its images. Unset, there is no limit, as
      in free play, on a one-image level too. */
  generationLimit?: number;
}

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
  // The option is edited as JSON, so it may not be a list.
  const extra = Array.isArray(mode.extraTabs) ? mode.extraTabs : [];
  EXTRA_TABS.forEach(tab => {
    if (extra.includes(tab) && !tabs.includes(tab)) {
      tabs.push(tab);
    }
  });
  const start = mode.startTab;
  return start && tabs.includes(start)
    ? [start, ...tabs.filter(tab => tab !== start)]
    : tabs;
}
