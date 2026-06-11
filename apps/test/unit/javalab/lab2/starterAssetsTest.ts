import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
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

function assetFile(id: string, name: string, url: string): ProjectFile {
  return {id, name, contents: '', folderId: DEFAULT_FOLDER_ID, url};
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

  describe('mergeStarterAssets', () => {
    it('returns the source unchanged for an empty or undefined mapping', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      expect(mergeStarterAssets(source, undefined, LEVEL_NAME, false)).toBe(
        source
      );
      expect(mergeStarterAssets(source, {}, LEVEL_NAME, false)).toBe(source);
    });

    it('appends mapping entries to a source with no url-backed files', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png', 'ding.wav': 'uuid-2.wav'},
        LEVEL_NAME,
        false
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
        LEVEL_NAME,
        false
      );
      const image = Object.values(merged.files).find(
        f => f.name === 'cat.png'
      )!;
      expect(image.id).toBe('4');
      expect(merged.files['4']).toBe(image);
    });

    it('does not append when the source already has any url-backed file', () => {
      // The ghost-file guard: once a lab2 save has persisted url entries,
      // a later delete or rename must not be undone by re-merging the
      // (unchanged) level mapping.
      const source = sourceWith(
        javaFile('0', 'Main.java'),
        assetFile('1', 'kept.png', '/v3/assets/abc/uuid-9.png')
      );
      const merged = mergeStarterAssets(
        source,
        {'deleted.png': 'uuid-1.png'},
        LEVEL_NAME,
        false
      );
      const names = Object.values(merged.files).map(f => f.name);
      expect(names.sort()).toEqual(['Main.java', 'kept.png']);
    });

    it('dedups appended entries by file name', () => {
      // A text file already named like the asset wins; the mapping entry
      // is skipped rather than shadowed.
      const source = sourceWith(javaFile('0', 'cat.png'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png', 'dog.png': 'uuid-2.png'},
        LEVEL_NAME,
        false
      );
      const names = Object.values(merged.files).map(f => f.name);
      expect(names.sort()).toEqual(['cat.png', 'dog.png']);
      expect(merged.files['0'].url).toBeUndefined();
    });

    it('types mapping-named files LOCKED_STARTER for students', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png'},
        LEVEL_NAME,
        false
      );
      const image = Object.values(merged.files).find(
        f => f.name === 'cat.png'
      )!;
      expect(image.type).toBe(ProjectFileType.LOCKED_STARTER);
    });

    it('types mapping-named files STARTER in start mode', () => {
      const source = sourceWith(javaFile('0', 'Main.java'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png'},
        LEVEL_NAME,
        true
      );
      const image = Object.values(merged.files).find(
        f => f.name === 'cat.png'
      )!;
      expect(image.type).toBe(ProjectFileType.STARTER);
    });

    it('retypes existing url-backed files named in the mapping on every call', () => {
      // The flat S3 shape does not persist file types, so lock state must
      // be re-derived from the mapping after every load.
      const source = sourceWith(
        assetFile(
          '0',
          'cat.png',
          '/level_starter_assets/CSA%20Unit%201/uuid/uuid-1.png'
        ),
        assetFile('1', 'student.png', '/v3/assets/abc/uuid-2.png')
      );
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png'},
        LEVEL_NAME,
        false
      );
      // Mapping-named file is locked; the student's own upload is not.
      expect(merged.files['0'].type).toBe(ProjectFileType.LOCKED_STARTER);
      expect(merged.files['1'].type).toBeUndefined();
    });

    it('does not retype text files that share a name with a mapping entry', () => {
      const source = sourceWith(javaFile('0', 'cat.png'));
      const merged = mergeStarterAssets(
        source,
        {'cat.png': 'uuid-1.png'},
        LEVEL_NAME,
        false
      );
      expect(merged.files['0'].type).toBe(ProjectFileType.STARTER);
    });
  });
});
