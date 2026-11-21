// Hands the lab a level's level_config in the properties its readers know.
//
// The lab's readers take a level's settings from level_mode and the
// properties beside it. A level with a level_config has its settings turned
// into those as it arrives, and the earlier properties it may still carry
// are ignored.

import type {LevelMode, LevelModeKind} from '../levelMode';
import type {Tab} from '../redux/spriteLab2Redux';
import type {SpriteLab2LevelProperties} from '../types';

import {FLAT_PROPERTY_NAMES, FlatProperties} from './fromFlat';
import {
  editableParts,
  Focus,
  LevelConfig,
  parseLevelConfig,
  ProjectPart,
} from './schema';

const TAB_OF_FOCUS: Record<Focus, Tab> = {
  code: 'Code',
  images: 'Images',
  world: 'World',
  play: 'Play',
};

// The lab's tab set comes from a kind and the tabs added to it. Code and
// World kinds come with the game; the image kind is the Images tab alone.
function kindFor(focus: Focus, parts: ProjectPart[]): LevelModeKind {
  if (focus === 'code' || focus === 'world') {
    return focus;
  }
  if (parts.includes('code')) {
    return 'code';
  }
  if (parts.includes('world')) {
    return 'world';
  }
  return focus === 'images' ? 'image' : 'play';
}

const OWN_PART: Partial<Record<LevelModeKind, ProjectPart>> = {
  code: 'code',
  world: 'world',
  image: 'images',
};

function onlySet<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/** A config's settings as the properties the lab reads. */
export function flatFromLevelConfig(config: LevelConfig): FlatProperties {
  const {images, world, scenes, blocks, objectives, instructions} = config;
  const parts = editableParts(config);
  const focus = config.focus ?? 'code';
  const kind = kindFor(focus, parts);
  const makeFirst = !!images?.makeFirst && parts.includes('images');
  const extraTabs = parts
    .filter(part => part !== OWN_PART[kind])
    .filter(part => !(makeFirst && part === 'images'))
    .map(part => TAB_OF_FOCUS[part]);
  // The kind opens on its own tab. A level that makes its image first opens
  // on Images and then goes on to that tab.
  const opensOn = OWN_PART[kind] ?? 'play';
  const levelMode = onlySet({
    kind,
    extraTabs: extraTabs.length ? extraTabs : undefined,
    startTab:
      focus !== opensOn && !(makeFirst && focus === 'images')
        ? TAB_OF_FOCUS[focus]
        : undefined,
    imageFirst: makeFirst || undefined,
    imageType: images?.makes?.type,
    imageSubject: images?.makes?.subject,
    imageRole: images?.makes?.role,
    oneImage: images?.onlyThisImage,
    noNewImages: images?.canAdd === false ? true : undefined,
    noDeletingImages: images?.canDelete === false ? true : undefined,
    imageKinds: images?.kinds,
    limitedPaintTools: images?.paintTools === 'limited' ? true : undefined,
    generationLimit: images?.generationLimit,
    learning: images?.explainAi,
    enableImageUpload: images?.upload,
    imageSource: images?.source,
    paletteRoles: world?.palette,
  }) as LevelMode;
  const [first, second] = scenes?.starting ?? [];
  const steps = onlySet({
    title: objectives?.title,
    items: objectives?.steps,
    collapsedText: objectives?.collapsedText,
  });
  return onlySet({
    levelMode,
    pinnedScene:
      first && onlySet({id: first.id, name: first.name, source: first.code}),
    worldStartPattern: first?.world?.pattern,
    worldStartRoles: first?.world?.roles,
    extraScene:
      second &&
      onlySet({
        id: second.id,
        name: second.name,
        source: second.code,
        worldStartPattern: second.world?.pattern,
        worldStartRoles: second.world?.roles,
        editable: second.editable,
      }),
    studentChangesScenes: !!scenes?.canChange,
    instructionsStartCollapsed: !!instructions?.startCollapsed,
    freeplayIntro: instructions?.freePlayIntro,
    worldKeepsRoles: world?.keepsOneOf,
    starterImages: images?.starters,
    addBlocks: blocks?.addOnArrival,
    lockEarlierBlocks: blocks?.lockEarlier,
    blockCatalog: blocks?.catalog,
    blocksAlwaysInToolbox: blocks?.alwaysInToolbox,
    imageRoleDefaults: blocks?.dropdownsStartOn,
    objectives: Object.keys(steps).length ? steps : undefined,
    callouts: config.callouts,
  }) as FlatProperties;
}

const FLAT_KEYS = Object.keys(FLAT_PROPERTY_NAMES) as (keyof FlatProperties)[];

/**
 * The level's properties with its level_config applied in place of the
 * earlier properties. A level with no level_config is returned as it is. A
 * config with problems is ignored whole, and the problems are logged.
 */
export function withLevelConfig(
  properties: SpriteLab2LevelProperties
): SpriteLab2LevelProperties {
  if (properties.levelConfig === undefined || properties.levelConfig === null) {
    return properties;
  }
  const {config, problems} = parseLevelConfig(properties.levelConfig);
  if (!config) {
    console.warn(
      "This level's level_config is not valid and was ignored:",
      problems.map(problem => `${problem.path}: ${problem.message}`).join('; ')
    );
    return properties;
  }
  const cleared = {...properties};
  FLAT_KEYS.forEach(key => delete cleared[key]);
  return {...cleared, ...flatFromLevelConfig(config)};
}
