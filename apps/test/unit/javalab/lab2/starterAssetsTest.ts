import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  isStarterAssetUrl,
  mergeStarterAssets,
  starterAssetUrl,
} from '@cdo/apps/javalab/lab2/starterAssets';
import {
  MultiFileSource,
  ProjectFile,
  ProjectFileType,
} from '@cdo/apps/lab2/types';
const LEVEL_NAME = 'CSA Unit 1';

function javaFile(id: string, name: string): ProjectFile {
  return {
    id,
    name,
    contents: 'class X {}',
    folderId: DEFAULT_FOLDER_ID,
    type: ProjectFileType.STARTER,
  };
}

function sourceWith(...files: ProjectFile[]): MultiFileSource {
  return {
    folders: {},
    files: Object.fromEntries(files.map(f => [f.id, f])),
    openFiles: [],
  };
}

describe('javalab2 starterAssets', () => {
  describe('starterAssetUrl', () => {
    it('builds the uuid route and URL-encodes the level name', () => {
      expect(starterAssetUrl(LEVEL_NAME, 'uuid-1.png')).toBe(
        '/level_starter_assets/CSA%20Unit%201/uuid/uuid-1.png'
      );
    });
  });

  describe('isStarterAssetUrl', () => {
    it('distinguishes level starter assets from channel assets', () => {
      expect(isStarterAssetUrl(starterAssetUrl(LEVEL_NAME, 'uuid-1.png'))).toBe(
        true
      );
      expect(isStarterAssetUrl('/v3/assets/abc123/uuid-1.png')).toBe(false);
    });
  });

  describe('mergeStarterAssets', () => {
    it('returns the source unchanged for an empty or undefined mapping', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      expect(mergeStarterAssets(source, undefined, LEVEL_NAME)).toBe(source);
      expect(mergeStarterAssets(source, {}, LEVEL_NAME)).toBe(source);
    });

    it('appends mapping entries as LOCKED_STARTER files', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png', 'ding.wav': 'uuid-2.wav'},
        LEVEL_NAME
      );
      const byName = Object.fromEntries(
        Object.values(merged.files).map(f => [f.name, f])
      );
      expect(Object.keys(byName).sort()).toEqual([
        'Main.java',
        'cat.png',
        'ding.wav',
      ]);
      expect(byName['cat.png'].url).toBe(
        '/level_starter_assets/CSA%20Unit%201/uuid/uuid-1.png'
      );
      expect(byName['cat.png'].contents).toBe('');
      expect(byName['cat.png'].folderId).toBe(DEFAULT_FOLDER_ID);
      expect(byName['cat.png'].type).toBe(ProjectFileType.LOCKED_STARTER);
      // Synthesized assets are not opened as tabs.
      expect(merged.openFiles).toEqual([]);
    });

    it('continues the numeric id sequence for appended entries', () => {
      const source = sourceWith(javaFile('0', 'Main.java'), {
        ...javaFile('3', 'Helper.java'),
      });
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png'},
        LEVEL_NAME
      );
      const image = Object.values(merged.files).find(
        f => f.name === 'cat.png'
      )!;
      expect(image.id).toBe('4');
      expect(merged.files['4']).toBe(image);
    });

    it('does not append when the source already has any url-backed file', () => {
      // The frozen-mapping guard: lab2 never updates the mapping, so once a
      // lab2 save has persisted url entries, a levelbuilder's delete or
      // rename must not be undone by re-merging the mapping.
      const source = sourceWith(javaFile('0', 'Main.java'), {
        ...javaFile('1', 'kept.png'),
        type: undefined,
        url: starterAssetUrl(LEVEL_NAME, 'uuid-9.png'),
      });
      const merged = mergeStarterAssets(
        source,
        {'deleted.png': 'uuid-1.png'},
        LEVEL_NAME
      );
      const names = Object.values(merged.files).map(f => f.name);
      expect(names.sort()).toEqual(['Main.java', 'kept.png']);
    });

    it('dedups appended entries by file name', () => {
      // A file already named like the asset wins; the mapping entry is
      // skipped rather than shadowed.
      const source = sourceWith(javaFile('0', 'cat.png'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png', 'dog.png': 'uuid-2.png'},
        LEVEL_NAME
      );
      const names = Object.values(merged.files).map(f => f.name);
      expect(names.sort()).toEqual(['cat.png', 'dog.png']);
      expect(merged.files['0'].url).toBeUndefined();
    });
  });
});
