// Hands the lab a level's settings in the properties its readers know.
//
// A level's settings are stored as level_config (schema.ts). The lab's
// readers still take them from level_mode and the properties beside it, so
// this turns the one into the other as the level arrives. The lab's readers
// do not change.

import {LevelMode, LevelModeKind} from '../levelMode';
import {Tab} from '../redux/spriteLab2Redux';
import {SpriteLab2LevelProperties} from '../types';

import {FlatProperties} from './fromFlat';
import {Focus, LevelConfig, ProjectPart, parseLevelConfig} from './schema';

const KIND_OF_FOCUS: Record<Focus, LevelModeKind> = {
  images: 'image',
  world: 'world',
  code: 'code',
  play: 'play',
};

const TAB_OF_PART: Record<ProjectPart, Tab> = {
  images: 'Images',
  world: 'World',
  code: 'Code',
};

function onlySet<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/** A config's settings as the properties the lab reads. */
export function flatFromLevelConfig(config: LevelConfig): FlatProperties {
  const {focus, edits, images, world, scenes, blocks, guide} = config;
  const own = focus && focus !== 'play' ? TAB_OF_PART[focus] : undefined;
  const levelMode = onlySet({
    // A level that does not say what it edits is free play.
    kind: focus && edits ? KIND_OF_FOCUS[focus] : 'freeplay',
    extraTabs:
      focus && edits
        ? edits.map(part => TAB_OF_PART[part]).filter(tab => tab !== own)
        : undefined,
    imageFirst: images?.makeFirst,
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
  if (levelMode.extraTabs && !levelMode.extraTabs.length) {
    delete levelMode.extraTabs;
  }
  const [first, second] = scenes?.starting ?? [];
  const hasGuide =
    guide &&
    (guide.title !== undefined ||
      guide.steps !== undefined ||
      guide.collapsedText !== undefined);
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
    studentChangesScenes: scenes?.canChange,
    worldKeepsRoles: world?.keepsOneOf,
    starterImages: images?.starters,
    addBlocks: blocks?.addOnArrival,
    lockEarlierBlocks: blocks?.lockEarlier,
    blockCatalog: blocks?.catalog,
    imageRoleDefaults: blocks?.dropdownsStartOn,
    objectives: hasGuide
      ? onlySet({
          title: guide.title,
          items: guide.steps,
          collapsedText: guide.collapsedText,
        })
      : undefined,
    callouts: guide?.callouts,
    freeplayIntro: guide?.freePlayIntro,
  }) as FlatProperties;
}

const FLAT_KEYS: (keyof FlatProperties)[] = [
  'levelMode',
  'pinnedScene',
  'extraScene',
  'objectives',
  'worldStartPattern',
  'worldStartRoles',
  'worldKeepsRoles',
  'blockCatalog',
  'lockEarlierBlocks',
  'freeplayIntro',
  'imageRoleDefaults',
  'addBlocks',
  'callouts',
  'starterImages',
  'studentChangesScenes',
];

/**
 * The level's properties with its level_config applied: the config is the
 * whole of the level's settings, so the earlier properties it replaces are
 * cleared first. A level with no level_config is returned as it is. A
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
