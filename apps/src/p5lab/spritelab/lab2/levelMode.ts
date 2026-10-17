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
  /** A world level that places one thing: no Erase, the image goes on an
      empty cell, and choosing another cell moves it. */
  placeOne?: boolean;
  /** Which scene tabs a pinned level shows: its own scene's (the default),
      or every scene's, the others locked, where a level first shows the
      student the scenes they have. */
  sceneTabs?: 'pinned' | 'all';
  /** The sentence scene's sentence, by id in sentences.json; the
      image type's own sentence when unset. */
  sentence?: string;
}

/** The style every generate form starts on; students can still switch. */
export const DEFAULT_IMAGE_STYLE: ImageStyle = 'pixel';

/** The tabs a kind shows, the first being where the level opens. An image
    level has none: its panel replaces the tab shell. */
const TABS: Record<LevelModeKind, Tab[]> = {
  code: ['Code', 'Play'],
  world: ['World', 'Play'],
  play: ['Play'],
  image: [],
  freeplay: ['Code', 'Images', 'World', 'Play'],
};

export function tabsForMode(mode: LevelMode | undefined): Tab[] | undefined {
  return mode ? TABS[mode.kind] : undefined;
}

/** The image panel is the whole level, in place of the tabs and the stage. */
export function isImageMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'image';
}

/** The only mode offering the prompt box and the paint tools. */
export function isFreeplayMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'freeplay';
}
