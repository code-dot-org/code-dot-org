import type {SpriteLab2LevelProperties} from '../types';

import {levelConfigFromFlat} from './fromFlat';
import {LevelConfig, parseLevelConfig} from './schema';

const configs = new WeakMap<SpriteLab2LevelProperties, LevelConfig>();

function readLevelConfig(level: SpriteLab2LevelProperties): LevelConfig {
  if (level.levelConfig !== undefined && level.levelConfig !== null) {
    const {config, problems} = parseLevelConfig(level.levelConfig);
    if (config) {
      return config;
    }
    console.warn(
      "This level's level_config is not valid; its older properties are read instead:",
      problems.map(problem => `${problem.path}: ${problem.message}`).join('; ')
    );
  }
  return levelConfigFromFlat(level).config;
}

/**
 * The level's settings. A level without a valid level_config has them
 * converted from its older properties (level_mode and the ones beside it).
 */
export function levelConfigOf(level: SpriteLab2LevelProperties): LevelConfig {
  let config = configs.get(level);
  if (!config) {
    config = readLevelConfig(level);
    configs.set(level, config);
  }
  return config;
}
