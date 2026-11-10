/*
  Helpers for reading, writing and cleaning the sprite lab 2 level mode property.
*/
import {
  ImageSource,
  isImageSource,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/imageCache';
import {
  IMAGE_SUBJECTS,
  IMAGE_TYPES,
  ImageSubject,
  ImageType,
} from '@cdo/apps/p5lab/spritelab/lab2/ai/images/types';
import {
  LevelMode,
  LevelModeKind,
  tabsForMode,
} from '@cdo/apps/p5lab/spritelab/lab2/levelMode';

import {setJsonObjectValue} from '../jsonUtils';

/**
 * A saved level_mode as it arrives: any keys, any values, since the property
 * could have been hand-edited as JSON before this editor existed.
 */
export type LevelModeObject = Record<string, unknown>;

export const LEVEL_MODE_KINDS: LevelModeKind[] = [
  'code',
  'world',
  'play',
  'image',
  'freeplay',
];

export const KIND_LABELS: Record<LevelModeKind, string> = {
  code: 'Code',
  world: 'World',
  play: 'Play',
  image: 'Image',
  freeplay: 'Free play',
};

const IMAGE_KEYS: (keyof LevelMode)[] = [
  'imageType',
  'imageSubject',
  'imageRole',
];

const IMAGE_TAB_KEYS: (keyof LevelMode)[] = [
  'learning',
  'imageSource',
  'oneImage',
];

// Keys a kind can carry; changing the kind drops the rest.
const KEYS_BY_KIND: Record<LevelModeKind, (keyof LevelMode)[]> = {
  code: [...IMAGE_KEYS, 'imageFirst', ...IMAGE_TAB_KEYS],
  world: [...IMAGE_KEYS, 'paletteRoles', 'imageFirst', ...IMAGE_TAB_KEYS],
  play: [...IMAGE_KEYS, 'imageFirst', ...IMAGE_TAB_KEYS],
  image: [...IMAGE_KEYS, ...IMAGE_TAB_KEYS],
  // Free play always allows multiple images.
  freeplay: IMAGE_TAB_KEYS.filter(key => key !== 'oneImage'),
};

export function getPaletteRoles(mode: Partial<LevelMode>): string[] {
  return mode.paletteRoles ?? [];
}

/** Returns a stringified list of the tabs a kind will show to the user. */
export function tabsForKind(kind: LevelModeKind, imageFirst: boolean): string {
  const mode: LevelMode = {kind, imageFirst};
  return (tabsForMode(mode) ?? []).join(', ');
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidLevelModeValue(key: string, value: unknown): boolean {
  switch (key) {
    case 'kind':
      return LEVEL_MODE_KINDS.includes(value as LevelModeKind);
    case 'imageType':
      return IMAGE_TYPES.includes(value as ImageType);
    case 'imageSubject':
      return IMAGE_SUBJECTS.includes(value as ImageSubject);
    case 'imageRole':
      return isNonEmptyString(value);
    case 'paletteRoles':
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every(isNonEmptyString) &&
        new Set(value).size === value.length
      );
    // A false flag reads the same as no flag, so only true is stored.
    case 'imageFirst':
    case 'learning':
    case 'oneImage':
      return value === true;
    case 'imageSource':
      return isImageSource(value);
    default:
      return false;
  }
}

/**
 * Drops unknown keys, invalid values and keys the kind cannot carry,
 * returning a description of each one dropped. Without a valid kind the
 * whole mode means nothing to the lab, so everything is dropped.
 */
export function cleanLevelMode(mode: LevelModeObject): {
  mode: Partial<LevelMode>;
  removed: string[];
} {
  const describe = (key: string, value: unknown) =>
    `${key}: ${JSON.stringify(value)}`;
  if (!isValidLevelModeValue('kind', mode.kind)) {
    return {
      mode: {},
      removed: Object.entries(mode).map(([key, value]) => describe(key, value)),
    };
  }
  const kind = mode.kind as LevelModeKind;
  const cleaned: LevelModeObject = {};
  const removed: string[] = [];
  Object.entries(mode).forEach(([key, value]) => {
    const kept =
      isValidLevelModeValue(key, value) &&
      (key === 'kind' || KEYS_BY_KIND[kind].includes(key as keyof LevelMode));
    if (kept) {
      cleaned[key] = value;
    } else {
      removed.push(describe(key, value));
    }
  });
  return {mode: cleaned as Partial<LevelMode>, removed};
}

/** Whether a field belongs on the form for the current mode. */
export function fieldApplies(
  mode: Partial<LevelMode>,
  key: keyof LevelMode
): boolean {
  const kind = mode.kind;
  if (!kind) {
    return false;
  }
  if (!KEYS_BY_KIND[kind].includes(key)) {
    return false;
  }
  switch (key) {
    case 'imageType':
      return kind === 'image' || kind === 'world' || mode.imageFirst === true;
    case 'imageSubject':
      return fieldApplies(mode, 'imageType') && mode.imageType === 'sprite';
    case 'imageRole':
      return kind === 'image' || fieldApplies(mode, 'imageType');
    // Both act on a picture the student makes, so they need an Images tab.
    case 'learning':
    case 'imageSource':
      return (
        kind === 'image' || kind === 'freeplay' || mode.imageFirst === true
      );
    // An Images tab too, but never free play, which always allows multiple
    // images.
    case 'oneImage':
      return kind === 'image' || mode.imageFirst === true;
    default:
      return true;
  }
}

function withoutInapplicableKeys(mode: Partial<LevelMode>): Partial<LevelMode> {
  const next = {...mode};
  (Object.keys(mode) as (keyof LevelMode)[]).forEach(key => {
    if (key !== 'kind' && !fieldApplies(mode, key)) {
      delete next[key];
    }
  });
  return next;
}

export function setKind(
  mode: Partial<LevelMode>,
  kind: LevelModeKind | undefined
): Partial<LevelMode> {
  if (!kind) {
    return {};
  }
  return withoutInapplicableKeys(setJsonObjectValue(mode, 'kind', kind));
}

export function setImageType(
  mode: Partial<LevelMode>,
  imageType: ImageType | undefined
): Partial<LevelMode> {
  return withoutInapplicableKeys(
    setJsonObjectValue(mode, 'imageType', imageType)
  );
}

export function setImageSubject(
  mode: Partial<LevelMode>,
  imageSubject: ImageSubject | undefined
): Partial<LevelMode> {
  return setJsonObjectValue(mode, 'imageSubject', imageSubject);
}

export function setImageRole(
  mode: Partial<LevelMode>,
  imageRole: string
): Partial<LevelMode> {
  return setJsonObjectValue(mode, 'imageRole', imageRole.trim() || undefined);
}

export function setImageFirst(
  mode: Partial<LevelMode>,
  imageFirst: boolean
): Partial<LevelMode> {
  return withoutInapplicableKeys(
    setJsonObjectValue(mode, 'imageFirst', imageFirst || undefined)
  );
}

export function setOneImage(
  mode: Partial<LevelMode>,
  oneImage: boolean
): Partial<LevelMode> {
  return setJsonObjectValue(mode, 'oneImage', oneImage || undefined);
}

export function setLearning(
  mode: Partial<LevelMode>,
  learning: boolean
): Partial<LevelMode> {
  return setJsonObjectValue(mode, 'learning', learning || undefined);
}

/** Unset reads as 'cached', so the default is stored by storing nothing. */
export function setImageSource(
  mode: Partial<LevelMode>,
  imageSource: ImageSource
): Partial<LevelMode> {
  return setJsonObjectValue(
    mode,
    'imageSource',
    imageSource === 'cached' ? undefined : imageSource
  );
}

/** Parses palette roles from a comma separated string, drops blanks and repeats, keeps order. */
export function parsePaletteRoles(text: string): string[] {
  const roles = text
    .split(',')
    .map(role => role.trim())
    .filter(role => role !== '');
  return [...new Set(roles)];
}

export function setPaletteRoles(
  mode: Partial<LevelMode>,
  text: string
): Partial<LevelMode> {
  const roles = parsePaletteRoles(text);
  return setJsonObjectValue(
    mode,
    'paletteRoles',
    roles.length ? roles : undefined
  );
}
