// Lets a level be written in the new grouped shape (levelConfig/schema.ts)
// while the lab still reads the properties it always has.
//
// The lab's readers are not changed yet. A level's level_config is laid
// over its older properties as the level arrives, so a level written either
// way, or in a mix of both, reaches the lab in the one form it knows.

import {SpriteLab2LevelProperties} from '../types';

import {LevelConfig, parseLevelConfig} from './schema';

type FlatProperties = Pick<
  SpriteLab2LevelProperties,
  'levelMode' | 'worldStartPattern' | 'worldStartRoles'
>;

// Leaves out the options a config does not set, so they do not erase the
// older property of the same meaning.
function onlySet<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * The level's properties with its level_config applied. Where both say
 * something, the config wins. A config with problems is ignored whole, and
 * the problems are logged.
 *
 * The options that live in level_mode need the level to have a mode: the
 * mode's kind is not part of the config yet.
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
  const {images, world} = config;
  return {
    ...properties,
    levelMode: properties.levelMode && {
      ...properties.levelMode,
      ...onlySet({
        imageType: images?.makes?.type,
        imageSubject: images?.makes?.subject,
        imageRole: images?.makes?.role,
        oneImage: images?.onlyThisImage,
        learning: images?.explainAi,
        imageSource: images?.source,
        paletteRoles: world?.paletteRoles,
      }),
    },
    ...onlySet({
      worldStartPattern: world?.startPattern,
      worldStartRoles: world?.startRoles,
    }),
  };
}

// A group with nothing set in it is left out.
function group<T extends object>(options: T): Partial<T> | undefined {
  const set = onlySet(options);
  return Object.keys(set).length ? set : undefined;
}

/**
 * What a level's older properties say, written in the new shape. The
 * levelbuilder form shows it, so an author can see a level's present
 * settings in the shape they are about to edit.
 */
export function levelConfigFromFlat(properties: FlatProperties): LevelConfig {
  const mode = properties.levelMode;
  const makes = mode?.imageType && {
    type: mode.imageType,
    ...onlySet({subject: mode.imageSubject, role: mode.imageRole}),
  };
  return onlySet({
    images: group({
      makes: makes || undefined,
      onlyThisImage: mode?.oneImage || undefined,
      explainAi: mode?.learning || undefined,
      source: mode?.imageSource,
    }),
    world: group({
      paletteRoles: mode?.paletteRoles,
      startPattern: properties.worldStartPattern,
      startRoles: properties.worldStartRoles,
    }),
  }) as LevelConfig;
}
