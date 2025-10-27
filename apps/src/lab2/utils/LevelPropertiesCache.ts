import {LevelProperties} from '../types';

/**
 * In memory cache for level properties in Lab2 level progressions.
 * Longer term, we should just pre-load level properties for all levels in a lesson.
 */
class LevelPropertiesCache {
  constructor(private cache: {[path: string]: LevelProperties} = {}) {}

  public get(path: string): LevelProperties | null {
    return this.cache[path] || null;
  }

  public set(path: string, levelProperties: LevelProperties): void {
    this.cache[path] = levelProperties;
  }

  public getById(id: number): LevelProperties | null {
    return (
      Object.values(this.cache).find(
        levelProperties => levelProperties.id === id
      ) || null
    );
  }
}

export default new LevelPropertiesCache();
