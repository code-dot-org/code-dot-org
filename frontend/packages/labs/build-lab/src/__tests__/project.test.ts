import {describe, expect, it} from 'vitest';

import {
  cloneBuildLabProject,
  DEFAULT_PROJECT,
  migrateBuildLabProject,
  parseBuildLabProject,
  serializeBuildLabProject,
} from '../project';

describe('Build Lab project persistence format', () => {
  it('seeds the default project with the Sprite Lab starter catalog', () => {
    expect(
      DEFAULT_PROJECT.assets.filter(asset => asset.assetType === 'costume'),
    ).toHaveLength(54);
    expect(
      DEFAULT_PROJECT.assets.filter(asset => asset.assetType === 'background'),
    ).toHaveLength(12);
    expect(DEFAULT_PROJECT.assets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({id: 'bear', name: 'bear'}),
        expect.objectContaining({
          id: 'background-space',
          name: 'space',
        }),
      ]),
    );
  });

  it('migrates older projects without restoring deleted assets later', () => {
    const olderProject = cloneBuildLabProject(DEFAULT_PROJECT);
    olderProject.starterAssetsVersion = undefined;
    olderProject.assets = olderProject.assets.filter(
      asset => asset.id !== 'bear',
    );

    const migrated = migrateBuildLabProject(olderProject);
    expect(migrated.assets.some(asset => asset.id === 'bear')).toBe(true);
    expect(migrated.starterAssetsVersion).toBe(1);

    const deleted = migrateBuildLabProject({
      ...migrated,
      assets: migrated.assets.filter(asset => asset.id !== 'bear'),
    });
    expect(deleted.assets.some(asset => asset.id === 'bear')).toBe(false);
  });

  it('round trips the complete project state', () => {
    const serialized = serializeBuildLabProject(DEFAULT_PROJECT);
    const parsed = parseBuildLabProject(serialized);

    expect(parsed).toEqual(DEFAULT_PROJECT);
  });

  it('rejects empty, malformed, and incomplete source data', () => {
    expect(parseBuildLabProject('')).toBeNull();
    expect(parseBuildLabProject('{not json}')).toBeNull();
    expect(parseBuildLabProject(JSON.stringify({screens: []}))).toBeNull();
  });

  it('clones defaults before handing them to a project instance', () => {
    const cloned = cloneBuildLabProject(DEFAULT_PROJECT);
    cloned.elements[0].label = 'Changed';

    expect(DEFAULT_PROJECT.elements[0].label).toBe('Welcome to Build Lab');
  });
});
