// Writes a level's earlier settings (level_mode and the properties beside
// it) in the level_config shape. Used once for each level being kept, and
// by the levelbuilder form when it opens a level not yet converted.

import {EXTRA_TABS, LevelMode, LevelModeKind} from '../levelMode';
import {SpriteLab2LevelProperties} from '../types';

import {Focus, LevelConfig, PROJECT_PARTS, ProjectPart} from './schema';

/** The earlier properties a level's settings were spread over. */
export type FlatProperties = Pick<
  SpriteLab2LevelProperties,
  | 'levelMode'
  | 'pinnedScene'
  | 'extraScene'
  | 'objectives'
  | 'worldStartPattern'
  | 'worldStartRoles'
  | 'worldKeepsRoles'
  | 'blockCatalog'
  | 'lockEarlierBlocks'
  | 'freeplayIntro'
  | 'imageRoleDefaults'
  | 'addBlocks'
  | 'callouts'
  | 'starterImages'
>;

const FOCUS_OF_KIND: Partial<Record<LevelModeKind, Focus>> = {
  image: 'images',
  world: 'world',
  code: 'code',
  play: 'play',
};

const MODE_KEYS: ReadonlySet<string> = new Set<keyof LevelMode>([
  'kind',
  'imageType',
  'imageSubject',
  'imageRole',
  'paletteRoles',
  'imageFirst',
  'learning',
  'enableImageUpload',
  'imageSource',
  'oneImage',
  'extraTabs',
  'noNewImages',
  'noDeletingImages',
  'limitedPaintTools',
  'imageKinds',
  'generationLimit',
]);

// A level file may hold a flag as true or as the string "true".
const on = (value: unknown) => value === true || value === 'true';

function onlySet<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

// A group with nothing set in it is left out.
function group<T extends object>(options: T): Partial<T> | undefined {
  const set = onlySet(options);
  return Object.keys(set).length ? set : undefined;
}

const list = <T>(value: T[] | undefined): T[] | undefined =>
  Array.isArray(value) && value.length ? value : undefined;

/**
 * A level's earlier settings in the level_config shape, with a line for
 * each earlier value that has no place in it. A level with no mode gives an
 * empty config for its tabs, which is free play.
 */
export function levelConfigFromFlat(properties: FlatProperties): {
  config: LevelConfig;
  dropped: string[];
} {
  const mode = (properties.levelMode ?? {}) as Partial<LevelMode>;
  const dropped = Object.entries(mode)
    .filter(([key]) => !MODE_KEYS.has(key))
    .map(([key, value]) => `level_mode.${key}: ${JSON.stringify(value)}`);

  const focus = mode.kind && FOCUS_OF_KIND[mode.kind];
  if (mode.kind && !focus && mode.kind !== 'freeplay') {
    dropped.push(`level_mode.kind: ${JSON.stringify(mode.kind)}`);
  }
  let edits: ProjectPart[] | undefined;
  if (focus) {
    const parts = new Set<ProjectPart>();
    if (focus !== 'play') {
      parts.add(focus);
    }
    if (on(mode.imageFirst)) {
      parts.add('images');
    }
    const extra = Array.isArray(mode.extraTabs) ? mode.extraTabs : [];
    EXTRA_TABS.forEach(tab => {
      if (extra.includes(tab)) {
        parts.add(tab.toLowerCase() as ProjectPart);
      }
    });
    edits = PROJECT_PARTS.filter(part => parts.has(part));
  }

  const makes = mode.imageType && {
    type: mode.imageType,
    ...onlySet({subject: mode.imageSubject, role: mode.imageRole}),
  };
  const pinned = properties.pinnedScene;
  const extra = properties.extraScene;
  const sceneKeys = ['id', 'name', 'source'];
  const extraSceneKeys = [
    ...sceneKeys,
    'worldStartPattern',
    'worldStartRoles',
    'editable',
  ];
  Object.keys(pinned ?? {})
    .filter(key => !sceneKeys.includes(key))
    .forEach(key => dropped.push(`pinned_scene.${key}`));
  Object.keys(extra ?? {})
    .filter(key => !extraSceneKeys.includes(key))
    .forEach(key => dropped.push(`extra_scene.${key}`));
  const pattern = list(properties.worldStartPattern);
  if (pattern && !pinned) {
    dropped.push('world_start_pattern: the level pins no scene to put it in');
  }
  const scenes = [
    pinned &&
      onlySet({
        id: pinned.id,
        name: pinned.name,
        code: pinned.source,
        world: pattern && {
          pattern,
          ...onlySet({roles: properties.worldStartRoles}),
        },
      }),
    extra &&
      onlySet({
        id: extra.id,
        name: extra.name,
        code: extra.source,
        world: list(extra.worldStartPattern) && {
          pattern: extra.worldStartPattern,
          ...onlySet({roles: extra.worldStartRoles}),
        },
        editable: on(extra.editable) || undefined,
      }),
  ].filter(Boolean);
  if (extra && !pinned) {
    dropped.push('extra_scene: the level pins no first scene');
    scenes.length = 0;
  }

  const objectives = properties.objectives;
  const config = onlySet({
    focus: focus || undefined,
    edits,
    images: group({
      makes: makes || undefined,
      makeFirst: on(mode.imageFirst) || undefined,
      onlyThisImage: on(mode.oneImage) || undefined,
      canAdd: on(mode.noNewImages) ? false : undefined,
      canDelete: on(mode.noDeletingImages) ? false : undefined,
      kinds: list(mode.imageKinds),
      paintTools: on(mode.limitedPaintTools) ? ('limited' as const) : undefined,
      generationLimit:
        typeof mode.generationLimit === 'number'
          ? mode.generationLimit
          : undefined,
      explainAi: on(mode.learning) || undefined,
      upload: on(mode.enableImageUpload) || undefined,
      source: mode.imageSource,
      starters: list(properties.starterImages),
    }),
    world: group({
      palette: list(mode.paletteRoles),
      keepsOneOf: list(properties.worldKeepsRoles),
    }),
    scenes: scenes.length ? scenes : undefined,
    blocks: group({
      addOnArrival: list(properties.addBlocks),
      lockEarlier: on(properties.lockEarlierBlocks) || undefined,
      catalog: on(properties.blockCatalog) || undefined,
      dropdownsStartOn:
        properties.imageRoleDefaults &&
        Object.keys(properties.imageRoleDefaults).length
          ? properties.imageRoleDefaults
          : undefined,
    }),
    guide: group({
      title: objectives?.title,
      steps: list(objectives?.items),
      collapsedText: objectives?.collapsedText,
      callouts: list(properties.callouts),
      freePlayIntro: on(properties.freeplayIntro) || undefined,
    }),
  }) as LevelConfig;
  return {config, dropped};
}
