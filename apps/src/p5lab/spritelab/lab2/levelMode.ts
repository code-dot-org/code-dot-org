// What kind of level this is, and everything that follows from it: the
// surfaces a student sees, and the image controls they get.

import {ImageAdlibSet} from './ai/images/imageAdlibs';
import {ImageStyle, ImageType} from './ai/images/types';
import {Tab} from './redux/spriteLab2Redux';

export type LevelModeKind = 'code' | 'world' | 'play' | 'image' | 'freeplay';

export interface LevelMode {
  kind: LevelModeKind;
  /** image: the one kind of image the level makes. */
  imageType?: ImageType;
  /** Word combos to offer, when the kind's own set is not the right one. */
  adlibs?: ImageAdlibSet;
}

/** Every image this unit makes is pixel art; no level has asked to differ. */
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

/** Which combos a kind offers when the level names none. */
const ADLIBS: Partial<Record<LevelModeKind, ImageAdlibSet>> = {
  image: 'simple',
  freeplay: 'expanded',
};

export function tabsForMode(mode: LevelMode | undefined): Tab[] | undefined {
  return mode ? TABS[mode.kind] : undefined;
}

/** The image panel is the whole level, in place of the tabs and the stage. */
export function isImageMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'image';
}

/** Freeplay hands everything back: the prompt box and the paint tools. */
export function isFreeplayMode(mode: LevelMode | undefined): boolean {
  return mode?.kind === 'freeplay';
}

export function adlibSetForMode(
  mode: LevelMode | undefined
): ImageAdlibSet | undefined {
  return mode ? mode.adlibs ?? ADLIBS[mode.kind] : undefined;
}
