// Writes a level's earlier settings (level_mode and the properties beside
// it) as a level_config.

import type {LevelMode} from '../levelMode';
import type {SpriteLab2LevelProperties} from '../types';

import {
  editableParts,
  Focus,
  LevelConfig,
  PROJECT_PARTS,
  ProjectPart,
} from './schema';

/** The stored properties a level_config replaces. */
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
  | 'blocksAlwaysInToolbox'
  | 'lockEarlierBlocks'
  | 'freeplayIntro'
  | 'imageRoleDefaults'
  | 'addBlocks'
  | 'callouts'
  | 'starterImages'
  | 'noProject'
>;

const PART_OF_TAB: Record<string, ProjectPart> = {
  Code: 'code',
  Images: 'images',
  World: 'world',
};

const FOCUS_OF_TAB: Record<string, Focus> = {...PART_OF_TAB, Play: 'play'};

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
  'startTab',
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

const list = <T>(value: T[] | undefined): T[] | undefined =>
  Array.isArray(value) && value.length ? value : undefined;

const present = (value: object) => Object.keys(value).length > 0;

/**
 * A level's earlier settings as a level_config, with a line for each
 * earlier value that has no place in it.
 */
export function levelConfigFromFlat(properties: FlatProperties): {
  config: LevelConfig;
  dropped: string[];
} {
  const mode = (properties.levelMode ?? undefined) as
    | Partial<LevelMode>
    | undefined;
  const dropped = Object.entries(mode ?? {})
    .filter(([key]) => !MODE_KEYS.has(key))
    .map(([key, value]) => `level_mode.${key}: ${JSON.stringify(value)}`);

  // Free play shows every tab; a level with no mode shows the lab's default
  // tabs (Code and Images, no World). Both let the student change scenes.
  const open = !mode?.kind || mode.kind === 'freeplay';
  const parts = new Set<ProjectPart>();
  if (mode?.kind === 'freeplay') {
    PROJECT_PARTS.forEach(part => parts.add(part));
  } else if (open) {
    parts.add('code');
    parts.add('images');
  } else if (mode.kind === 'code') {
    parts.add('code');
  } else if (mode.kind === 'world') {
    parts.add('world');
  } else if (mode.kind === 'image') {
    parts.add('images');
  } else if (mode.kind !== 'play') {
    dropped.push(`level_mode.kind: ${JSON.stringify(mode.kind)}`);
    parts.add('code');
  }
  if (on(mode?.imageFirst)) {
    parts.add('images');
  }
  (Array.isArray(mode?.extraTabs) ? mode.extraTabs : []).forEach(tab => {
    const part = PART_OF_TAB[tab];
    if (part) {
      parts.add(part);
    }
  });

  const ownFocus: Focus | undefined = open
    ? undefined
    : mode.kind === 'image'
    ? 'images'
    : mode.kind === 'world'
    ? 'world'
    : mode.kind === 'play'
    ? 'play'
    : 'code';
  const startFocus = mode?.startTab ? FOCUS_OF_TAB[mode.startTab] : undefined;
  const startShown =
    startFocus &&
    (startFocus === 'play'
      ? mode?.kind !== 'image'
      : parts.has(startFocus as ProjectPart));
  const focus = (startShown && startFocus) || ownFocus;

  const makes = mode?.imageType
    ? {
        type: mode.imageType,
        ...onlySet({subject: mode.imageSubject, role: mode.imageRole}),
      }
    : undefined;
  const images = onlySet({
    makes,
    makeFirst: on(mode?.imageFirst) || undefined,
    onlyThisImage: on(mode?.oneImage) || undefined,
    canAdd: on(mode?.noNewImages) ? false : undefined,
    canDelete: on(mode?.noDeletingImages) ? false : undefined,
    kinds: list(mode?.imageKinds),
    paintTools: on(mode?.limitedPaintTools) ? ('limited' as const) : undefined,
    generationLimit:
      typeof mode?.generationLimit === 'number'
        ? mode.generationLimit
        : undefined,
    explainAi: on(mode?.learning) || undefined,
    upload: on(mode?.enableImageUpload) || undefined,
    source: mode?.imageSource,
    starters: list(properties.starterImages),
  });
  const world = onlySet({
    palette: list(mode?.paletteRoles),
    keepsOneOf: list(properties.worldKeepsRoles),
  });

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
  const starting = [];
  if (pinned) {
    starting.push(
      onlySet({
        id: pinned.id,
        name: pinned.name,
        code: pinned.source,
        world: pattern && {
          pattern,
          ...onlySet({roles: properties.worldStartRoles}),
        },
      })
    );
    if (extra) {
      const extraPattern = list(extra.worldStartPattern);
      starting.push(
        onlySet({
          id: extra.id,
          name: extra.name,
          code: extra.source,
          world: extraPattern && {
            pattern: extraPattern,
            ...onlySet({roles: extra.worldStartRoles}),
          },
          editable: on(extra.editable) || undefined,
        })
      );
    }
  } else if (extra) {
    dropped.push('extra_scene: the level pins no first scene');
  }

  const objectives = properties.objectives;
  const steps = onlySet({
    title: objectives?.title,
    steps: list(objectives?.items),
    collapsedText: objectives?.collapsedText,
  });
  const blocks = onlySet({
    addOnArrival: list(properties.addBlocks),
    lockEarlier: on(properties.lockEarlierBlocks) || undefined,
    catalog: on(properties.blockCatalog) || undefined,
    alwaysInToolbox: list(properties.blocksAlwaysInToolbox),
    dropdownsStartOn:
      properties.imageRoleDefaults &&
      present(properties.imageRoleDefaults as object)
        ? properties.imageRoleDefaults
        : undefined,
  });
  const instructions = onlySet({
    startCollapsed: mode?.kind === 'freeplay' || undefined,
    freePlayIntro: on(properties.freeplayIntro) || undefined,
  });

  const config = onlySet({
    focus: focus === 'code' ? undefined : focus,
    images: parts.has('images') || present(images) ? images : undefined,
    world: parts.has('world') || present(world) ? world : undefined,
    scenes: starting.length
      ? {starting, ...(open && {canChange: true})}
      : open
      ? {canChange: true}
      : undefined,
    blocks: present(blocks) ? blocks : undefined,
    objectives: present(steps) ? steps : undefined,
    callouts: list(properties.callouts),
    noProject: on(properties.noProject) || undefined,
    instructions: present(instructions) ? instructions : undefined,
  }) as LevelConfig;

  const wanted = PROJECT_PARTS.filter(part => parts.has(part));
  const implied = editableParts(config);
  if (wanted.join() !== implied.join()) {
    config.edits = wanted;
  }
  return {config: orderedConfig(config), dropped};
}

// The groups in the order the schema lists them, so a level file reads the
// same way from level to level.
const ORDER: (keyof LevelConfig)[] = [
  'focus',
  'edits',
  'images',
  'world',
  'scenes',
  'blocks',
  'objectives',
  'callouts',
  'noProject',
  'instructions',
];

function orderedConfig(config: LevelConfig): LevelConfig {
  return Object.fromEntries(
    ORDER.filter(key => config[key] !== undefined).map(key => [
      key,
      config[key],
    ])
  ) as LevelConfig;
}
