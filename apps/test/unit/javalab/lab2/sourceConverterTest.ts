import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  flatToMultiFile,
  mergeValidationIntoStart,
  multiFileToFlat,
  splitForLevelbuilderSave,
} from '@cdo/apps/javalab/lab2/sourceConverter';
import {JavalabFlatSource} from '@cdo/apps/javalab/lab2/types';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';

function flatFile(
  text: string,
  tabOrder: number,
  isVisible = true,
  isValidation = false,
  extras: {isOpen?: boolean; isActive?: boolean} = {}
) {
  return {text, tabOrder, isVisible, isValidation, ...extras};
}

describe('javalab2 sourceConverter', () => {
  describe('flatToMultiFile', () => {
    it('returns empty MultiFileSource for nil/empty input', () => {
      [null, undefined, {}].forEach(input => {
        const mf = flatToMultiFile(input as JavalabFlatSource | null);
        expect(Object.keys(mf.files)).toHaveLength(0);
        expect(mf.openFiles).toEqual([]);
        expect(mf.folders).toEqual({});
      });
    });

    it('converts a single visible file', () => {
      const mf = flatToMultiFile({
        'Main.java': flatFile('class Main {}', 0),
      });
      expect(Object.keys(mf.files)).toHaveLength(1);
      const file = Object.values(mf.files)[0];
      expect(file.name).toBe('Main.java');
      expect(file.contents).toBe('class Main {}');
      expect(file.type).toBe(ProjectFileType.STARTER);
      expect(file.folderId).toBe(DEFAULT_FOLDER_ID);
      expect(mf.openFiles).toEqual([file.id]);
    });

    it('orders openFiles by tabOrder, not insertion order', () => {
      const mf = flatToMultiFile({
        'B.java': flatFile('b', 1),
        'A.java': flatFile('a', 0),
        'C.java': flatFile('c', 2),
      });
      const names = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(names).toEqual(['A.java', 'B.java', 'C.java']);
    });

    it('types support/validation files; excludes only SUPPORT from openFiles', () => {
      // SUPPORT files (hidden, non-validation) are never tabs.
      // VALIDATION files surface as tabs in start mode so levelbuilders
      // can edit them — same isOpen rules as STARTER.
      const mf = flatToMultiFile({
        'Main.java': flatFile('m', 0, true, false),
        'Hidden.java': flatFile('h', 1, false, false),
        'Test.java': flatFile('t', 2, false, true),
      });
      const byName: Record<string, ProjectFileType | undefined> = {};
      Object.values(mf.files).forEach(f => (byName[f.name] = f.type));
      expect(byName['Main.java']).toBe(ProjectFileType.STARTER);
      expect(byName['Hidden.java']).toBe(ProjectFileType.SUPPORT);
      expect(byName['Test.java']).toBe(ProjectFileType.VALIDATION);

      const openNames = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(openNames).toEqual(['Main.java', 'Test.java']);
    });

    it('excludes validation files with isOpen=false from openFiles', () => {
      const mf = flatToMultiFile({
        'Main.java': flatFile('m', 0, true, false),
        'Test.java': flatFile('t', 1, false, true, {isOpen: false}),
      });
      const openNames = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(openNames).toEqual(['Main.java']);
    });

    it('emits numeric-string file IDs that play nicely with getNextFileId', () => {
      // getNextFileId allocates `String(max(Number(id)) + 1)`. If any id is
      // non-numeric (e.g. 'f0'), Number(id) is NaN and every newly-allocated
      // id collides on 'NaN', overwriting previous files. Guard the format.
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1),
      });
      Object.values(mf.files).forEach(f => {
        expect(f.id).toMatch(/^\d+$/);
      });
      const next = getNextFileId(Object.values(mf.files));
      expect(next).toBe('2');
    });

    it('falls back to insertion order when tabOrder is missing or duplicated', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 0), // duplicate
        'C.java': {
          text: 'c',
          tabOrder: NaN,
          isVisible: true,
          isValidation: false,
        },
      });
      const names = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(names).toEqual(['A.java', 'B.java', 'C.java']);
    });

    it('tolerates tabOrder and isValidation being absent', () => {
      // The legacy on-the-wire shape marks both fields optional; old level
      // configs may omit them entirely.
      const mf = flatToMultiFile({
        'A.java': {text: 'a', isVisible: true},
        'B.java': {text: 'b', isVisible: true},
      });
      const names = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(names).toEqual(['A.java', 'B.java']);
      Object.values(mf.files).forEach(f => {
        expect(f.type).toBe(ProjectFileType.STARTER);
      });
    });

    it('excludes visible files with isOpen=false from openFiles', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1, true, false, {isOpen: false}),
        'C.java': flatFile('c', 2),
      });
      const openNames = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(openNames).toEqual(['A.java', 'C.java']);
      // The closed file is still present in files and still a STARTER.
      const closed = Object.values(mf.files).find(f => f.name === 'B.java')!;
      expect(closed.type).toBe(ProjectFileType.STARTER);
    });

    it('treats missing isOpen as true', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1),
      });
      const openNames = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(openNames).toEqual(['A.java', 'B.java']);
    });

    it('sets ProjectFile.active for the file with isActive=true', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1, true, false, {isActive: true}),
        'C.java': flatFile('c', 2),
      });
      const byName: Record<string, boolean | undefined> = {};
      Object.values(mf.files).forEach(f => (byName[f.name] = f.active));
      expect(byName['A.java']).toBeUndefined();
      expect(byName['B.java']).toBe(true);
      expect(byName['C.java']).toBeUndefined();
    });

    it('marks no file active when isActive is absent everywhere', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1),
      });
      Object.values(mf.files).forEach(f => {
        expect(f.active).toBeUndefined();
      });
    });

    it('isActive=true forces a file into openFiles even when isOpen=false', () => {
      // Codebridge's editing helpers assume the active file is always
      // open. flatToMultiFile must not hand off an inconsistent state.
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 1, true, false, {
          isOpen: false,
          isActive: true,
        }),
        'C.java': flatFile('c', 2),
      });
      const openNames = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(openNames).toEqual(['A.java', 'B.java', 'C.java']);
      const active = Object.values(mf.files).find(f => f.active === true);
      expect(active?.name).toBe('B.java');
    });

    it('honors only the lowest-tabOrder file when isActive=true is duplicated', () => {
      const mf = flatToMultiFile({
        'B.java': flatFile('b', 1, true, false, {isActive: true}),
        'A.java': flatFile('a', 0, true, false, {isActive: true}),
        'C.java': flatFile('c', 2, true, false, {isActive: true}),
      });
      const active = Object.values(mf.files).filter(f => f.active === true);
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('A.java');
    });
  });

  describe('multiFileToFlat', () => {
    it('returns {} for nil/empty input', () => {
      expect(multiFileToFlat(null)).toEqual({});
      expect(multiFileToFlat(undefined)).toEqual({});
      expect(multiFileToFlat({folders: {}, files: {}, openFiles: []})).toEqual(
        {}
      );
    });

    it('round-trips a multi-file source with mixed types', () => {
      const original: JavalabFlatSource = {
        'Main.java': flatFile('class Main {}', 0, true, false),
        'Helper.java': flatFile('class Helper {}', 1, true, false),
        'Hidden.java': flatFile('hidden', 2, false, false),
        'Test.java': flatFile('test', 3, false, true),
      };
      const round = multiFileToFlat(flatToMultiFile(original));

      expect(Object.keys(round).sort()).toEqual(Object.keys(original).sort());
      Object.keys(original).forEach(name => {
        expect(round[name].text).toBe(original[name].text);
        expect(round[name].isVisible).toBe(original[name].isVisible);
        expect(round[name].isValidation).toBe(original[name].isValidation);
      });

      // Open tabs (visible non-support and validation) get a tabOrder
      // in their relative order. SUPPORT files have no tab position.
      const mainTab = round['Main.java'].tabOrder!;
      const helperTab = round['Helper.java'].tabOrder!;
      const testTab = round['Test.java'].tabOrder!;
      expect(mainTab).toBeLessThan(helperTab);
      expect(helperTab).toBeLessThan(testTab);
      expect(round['Hidden.java'].tabOrder).toBeUndefined();
    });

    it('SUPPORT and VALIDATION files report isVisible=false', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'A.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.SUPPORT,
          },
          b: {
            id: 'b',
            name: 'B.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
          },
        },
        openFiles: [],
      };
      const flat = multiFileToFlat(source);
      expect(flat['A.java'].isVisible).toBe(false);
      expect(flat['A.java'].isValidation).toBe(false);
      expect(flat['B.java'].isVisible).toBe(false);
      expect(flat['B.java'].isValidation).toBe(true);
    });

    it('emits isOpen and isActive explicitly on every file', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'A.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.STARTER,
            active: true,
          },
          b: {
            id: 'b',
            name: 'B.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
          c: {
            id: 'c',
            name: 'C.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.SUPPORT,
          },
          d: {
            id: 'd',
            name: 'D.java',
            contents: '',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
          },
        },
        openFiles: ['a'],
      };
      const flat = multiFileToFlat(source);
      // A is open (in openFiles) and active; tabOrder is set.
      expect(flat['A.java'].isOpen).toBe(true);
      expect(flat['A.java'].isActive).toBe(true);
      expect(flat['A.java'].tabOrder).toBe(0);
      // B is visible but not in openFiles -> closed, not active,
      // no tabOrder.
      expect(flat['B.java'].isOpen).toBe(false);
      expect(flat['B.java'].isActive).toBe(false);
      expect(flat['B.java'].tabOrder).toBeUndefined();
      // SUPPORT files are never tabs. VALIDATION here isn't in openFiles
      // (the levelbuilder closed it), so isOpen=false and no tabOrder.
      expect(flat['C.java'].isOpen).toBe(false);
      expect(flat['C.java'].isActive).toBe(false);
      expect(flat['C.java'].tabOrder).toBeUndefined();
      expect(flat['D.java'].isOpen).toBe(false);
      expect(flat['D.java'].isActive).toBe(false);
      expect(flat['D.java'].tabOrder).toBeUndefined();
    });

    it('round-trips open/closed/active state through multiFile -> flat -> multiFile', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '0': {
            id: '0',
            name: 'A.java',
            contents: 'a',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
          '1': {
            id: '1',
            name: 'B.java',
            contents: 'b',
            folderId: 'root',
            type: ProjectFileType.STARTER,
            active: true,
          },
          '2': {
            id: '2',
            name: 'C.java',
            contents: 'c',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
        },
        // C is closed (not in openFiles); B is the active tab.
        openFiles: ['0', '1'],
      };
      const round = flatToMultiFile(multiFileToFlat(source));
      const openNames = (round.openFiles ?? []).map(id => round.files[id].name);
      expect(openNames).toEqual(['A.java', 'B.java']);
      const active = Object.values(round.files).filter(f => f.active === true);
      expect(active).toHaveLength(1);
      expect(active[0].name).toBe('B.java');
    });
  });

  describe('splitForLevelbuilderSave', () => {
    it('returns empty maps for nil/empty input', () => {
      expect(splitForLevelbuilderSave(null)).toEqual({
        startSources: {},
        validation: {},
      });
      expect(splitForLevelbuilderSave(undefined)).toEqual({
        startSources: {},
        validation: {},
      });
      expect(
        splitForLevelbuilderSave({folders: {}, files: {}, openFiles: []})
      ).toEqual({startSources: {}, validation: {}});
    });

    it('puts non-validation files in startSources, validation files in validation', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'Main.java',
            contents: 'class Main {}',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
          b: {
            id: 'b',
            name: 'Hidden.java',
            contents: 'hidden',
            folderId: 'root',
            type: ProjectFileType.SUPPORT,
          },
          c: {
            id: 'c',
            name: 'Test.java',
            contents: 'class Test {}',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
          },
        },
        openFiles: ['a'],
      };

      const {startSources, validation} = splitForLevelbuilderSave(source);
      expect(Object.keys(startSources).sort()).toEqual([
        'Hidden.java',
        'Main.java',
      ]);
      expect(Object.keys(validation)).toEqual(['Test.java']);
    });

    it('drops isValidation but preserves open/active state on validation entries', () => {
      // Legacy Javalab stores validation as a flat map of {text, tabOrder?},
      // and `@level.validation=` encrypts whatever we hand it. isValidation
      // is redundant once the entry lives in the validation hash, so we
      // drop it; isOpen/isActive ride along so tab state restores on the
      // next start-mode load.
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'Test.java',
            contents: 'class Test {}',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
            active: true,
          },
        },
        openFiles: ['a'],
      };
      const {validation} = splitForLevelbuilderSave(source);
      const entry = validation['Test.java'];
      expect(entry.text).toBe('class Test {}');
      expect(entry.isVisible).toBe(false);
      expect('isValidation' in entry).toBe(false);
      expect(entry.isOpen).toBe(true);
      expect(entry.isActive).toBe(true);
    });

    it('preserves tabOrder on a validation file that is open', () => {
      // multiFileToFlat assigns tabOrder by position in openFiles. Once
      // validation files participate in openFiles, their tabOrder must
      // survive the split so the next load reopens them in place.
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'Test.java',
            contents: 'class Test {}',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
          },
          b: {
            id: 'b',
            name: 'Main.java',
            contents: 'class Main {}',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
        },
        openFiles: ['a', 'b'],
      };
      const {validation, startSources} = splitForLevelbuilderSave(source);
      expect(validation['Test.java'].tabOrder).toBe(0);
      expect(startSources['Main.java'].tabOrder).toBe(1);
    });

    it('omits tabOrder for a validation file that is not open', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          a: {
            id: 'a',
            name: 'Test.java',
            contents: 'class Test {}',
            folderId: 'root',
            type: ProjectFileType.VALIDATION,
          },
        },
        openFiles: [],
      };
      const {validation} = splitForLevelbuilderSave(source);
      expect(validation['Test.java'].tabOrder).toBeUndefined();
      expect(validation['Test.java'].isOpen).toBe(false);
    });
  });

  describe('mergeValidationIntoStart', () => {
    it('returns the unmodified start sources when there are no validation files', () => {
      const start: JavalabFlatSource = {
        'Main.java': flatFile('class Main {}', 0),
      };
      expect(mergeValidationIntoStart(start, undefined)).toBe(start);
      expect(mergeValidationIntoStart(start, {})).toBe(start);
    });

    it('tags merged validation entries with isValidation: true', () => {
      const start: JavalabFlatSource = {
        'Main.java': flatFile('class Main {}', 0),
      };
      const validation: JavalabFlatSource = {
        'Test.java': {text: 'class Test {}', isVisible: false},
      };
      const merged = mergeValidationIntoStart(start, validation)!;
      expect(merged['Main.java'].isValidation).toBeFalsy();
      expect(merged['Test.java'].isValidation).toBe(true);
      expect(merged['Test.java'].text).toBe('class Test {}');
    });

    it('preserves isOpen/isActive/tabOrder from the validation entry', () => {
      // Restoring tab state on reload is the whole point of carrying
      // these fields through the validation hash.
      const validation: JavalabFlatSource = {
        'Test.java': {
          text: 't',
          isVisible: false,
          isOpen: true,
          isActive: true,
          tabOrder: 2,
        },
      };
      const merged = mergeValidationIntoStart(undefined, validation)!;
      expect(merged['Test.java'].isOpen).toBe(true);
      expect(merged['Test.java'].isActive).toBe(true);
      expect(merged['Test.java'].tabOrder).toBe(2);
    });

    it('returns the validation files alone when there are no start sources', () => {
      const validation: JavalabFlatSource = {
        'Test.java': {text: 't', isVisible: false},
      };
      const merged = mergeValidationIntoStart(undefined, validation)!;
      expect(Object.keys(merged)).toEqual(['Test.java']);
      expect(merged['Test.java'].isValidation).toBe(true);
    });

    it('warns on filename collision and lets the validation entry win', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const start: JavalabFlatSource = {
          'Test.java': flatFile('start text', 0),
        };
        const validation: JavalabFlatSource = {
          'Test.java': {text: 'validation text', isVisible: false},
        };
        const merged = mergeValidationIntoStart(start, validation)!;
        expect(merged['Test.java'].text).toBe('validation text');
        expect(merged['Test.java'].isValidation).toBe(true);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toMatch(/Test\.java/);
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('asset (url-backed) files', () => {
    const assetEntry = {
      text: '',
      isVisible: true,
      url: '/v3/assets/abc123/uuid-1.png',
    };

    it('flatToMultiFile leaves channel-asset files untyped and copies url', () => {
      // Untyped is load-bearing for student uploads: lab2 treats typed url
      // files as levelbuilder-owned and skips the S3 delete + abuse unflag
      // when a student removes them (getStudentFileAssetInfo).
      const mf = flatToMultiFile({
        'Main.java': flatFile('class Main {}', 0),
        'cat.png': {...assetEntry, tabOrder: 1},
      });
      const image = Object.values(mf.files).find(f => f.name === 'cat.png')!;
      expect(image.type).toBeUndefined();
      expect(image.url).toBe(assetEntry.url);
      expect(image.contents).toBe('');
    });

    it('flatToMultiFile types starter-asset files STARTER', () => {
      // Assets under /level_starter_assets/ are levelbuilder-owned shared
      // level assets; typing them keeps lab2 from attempting S3 cleanup.
      const mf = flatToMultiFile({
        'cat.png': {
          text: '',
          isVisible: true,
          url: '/level_starter_assets/My%20Level/uuid/uuid-1.png',
        },
      });
      const image = Object.values(mf.files).find(f => f.name === 'cat.png')!;
      expect(image.type).toBe(ProjectFileType.STARTER);
    });

    it('flatToMultiFile types locked starter-asset files LOCKED_STARTER', () => {
      const mf = flatToMultiFile({
        'cat.png': {
          text: '',
          isVisible: true,
          url: '/level_starter_assets/My%20Level/uuid/uuid-1.png',
          locked: true,
        },
      });
      const image = Object.values(mf.files).find(f => f.name === 'cat.png')!;
      expect(image.type).toBe(ProjectFileType.LOCKED_STARTER);
    });

    it('round-trips a locked starter asset through multiFile -> flat -> multiFile', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '0': {
            id: '0',
            name: 'cat.png',
            contents: '',
            folderId: DEFAULT_FOLDER_ID,
            type: ProjectFileType.LOCKED_STARTER,
            url: '/level_starter_assets/My%20Level/uuid/uuid-1.png',
          },
        },
        openFiles: [],
      };
      const flat = multiFileToFlat(source);
      expect(flat['cat.png'].locked).toBe(true);
      const round = flatToMultiFile(flat);
      const image = Object.values(round.files).find(f => f.name === 'cat.png')!;
      expect(image.type).toBe(ProjectFileType.LOCKED_STARTER);
    });

    it('flatToMultiFile omits absent url', () => {
      const mf = flatToMultiFile({
        'Main.java': flatFile('class Main {}', 0),
        'cat.png': {...assetEntry},
      });
      const main = Object.values(mf.files).find(f => f.name === 'Main.java')!;
      expect('url' in main).toBe(false);
    });

    it('multiFileToFlat emits url when present', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '0': {
            id: '0',
            name: 'cat.png',
            contents: '',
            folderId: 'root',
            url: assetEntry.url,
          },
          '1': {
            id: '1',
            name: 'Main.java',
            contents: 'class Main {}',
            folderId: 'root',
            type: ProjectFileType.STARTER,
          },
        },
        openFiles: ['1'],
      };
      const flat = multiFileToFlat(source);
      expect(flat['cat.png'].url).toBe(assetEntry.url);
      expect(flat['cat.png'].isVisible).toBe(true);
      expect('url' in flat['Main.java']).toBe(false);
    });

    it('round-trips an open image tab through flat -> multiFile -> flat', () => {
      const original: JavalabFlatSource = {
        'Main.java': flatFile('class Main {}', 0),
        'cat.png': {...assetEntry, tabOrder: 1, isOpen: true},
      };
      const round = multiFileToFlat(flatToMultiFile(original));
      expect(round['cat.png'].url).toBe(assetEntry.url);
      expect(round['cat.png'].isOpen).toBe(true);
      expect(round['cat.png'].tabOrder).toBe(1);
      expect(round['cat.png'].isVisible).toBe(true);
    });

    it('splitForLevelbuilderSave puts url entries in startSources, never validation', () => {
      const mf = flatToMultiFile({
        'Main.java': flatFile('class Main {}', 0),
        'cat.png': assetEntry,
        'Test.java': flatFile('class Test {}', 1, false, true),
      });
      const {startSources, validation} = splitForLevelbuilderSave(mf);
      expect(Object.keys(startSources).sort()).toEqual([
        'Main.java',
        'cat.png',
      ]);
      expect(startSources['cat.png'].url).toBe(assetEntry.url);
      expect(Object.keys(validation)).toEqual(['Test.java']);
    });
  });

  describe('locked starter files', () => {
    it('flatToMultiFile types locked visible files LOCKED_STARTER', () => {
      const mf = flatToMultiFile({
        'Locked.java': {...flatFile('class Locked {}', 0), locked: true},
        'Main.java': flatFile('class Main {}', 1),
      });
      const locked = Object.values(mf.files).find(
        f => f.name === 'Locked.java'
      )!;
      const main = Object.values(mf.files).find(f => f.name === 'Main.java')!;
      expect(locked.type).toBe(ProjectFileType.LOCKED_STARTER);
      expect(main.type).toBe(ProjectFileType.STARTER);
    });

    it('multiFileToFlat sets locked on LOCKED_STARTER files only', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '0': {
            id: '0',
            name: 'Locked.java',
            contents: 'class Locked {}',
            folderId: DEFAULT_FOLDER_ID,
            type: ProjectFileType.LOCKED_STARTER,
          },
          '1': {
            id: '1',
            name: 'Main.java',
            contents: 'class Main {}',
            folderId: DEFAULT_FOLDER_ID,
            type: ProjectFileType.STARTER,
          },
        },
        openFiles: ['0', '1'],
      };
      const flat = multiFileToFlat(source);
      expect(flat['Locked.java'].locked).toBe(true);
      expect(flat['Locked.java'].isVisible).toBe(true);
      expect('locked' in flat['Main.java']).toBe(false);
    });

    it('round-trips a locked file through flat -> multiFile -> flat', () => {
      const original: JavalabFlatSource = {
        'Locked.java': {...flatFile('class Locked {}', 0), locked: true},
      };
      const round = multiFileToFlat(flatToMultiFile(original));
      expect(round['Locked.java'].locked).toBe(true);
    });

    it('persists locked across both a regular file and an image file in one round trip', () => {
      const original: JavalabFlatSource = {
        'Locked.java': {...flatFile('class Locked {}', 0), locked: true},
        'cat.png': {
          text: '',
          isVisible: true,
          url: '/level_starter_assets/My%20Level/uuid/uuid-1.png',
          locked: true,
        },
      };
      const mf = flatToMultiFile(original);
      const javaFile = Object.values(mf.files).find(
        f => f.name === 'Locked.java'
      )!;
      const imageFile = Object.values(mf.files).find(f => f.name === 'cat.png')!;
      expect(javaFile.type).toBe(ProjectFileType.LOCKED_STARTER);
      expect(imageFile.type).toBe(ProjectFileType.LOCKED_STARTER);

      const round = multiFileToFlat(mf);
      expect(round['Locked.java'].locked).toBe(true);
      expect(round['cat.png'].locked).toBe(true);
      expect(round['cat.png'].url).toBe(
        '/level_starter_assets/My%20Level/uuid/uuid-1.png'
      );
    });
  });

  describe('start + validation round trip', () => {
    // What Javalab2View actually does in start mode: merge validation
    // into start, hand to codebridge as MultiFileSource, then on save
    // split back into start_sources and validation. This test pins the
    // full path end-to-end so future refactors don't quietly break tab
    // restoration or accidentally leak validation into start_sources.
    it('preserves open/active/closed state across merge -> flatToMultiFile -> multiFileToFlat -> split', () => {
      const start: JavalabFlatSource = {
        'Main.java': {
          text: 'class Main {}',
          isVisible: true,
          isOpen: true,
          isActive: false,
          tabOrder: 0,
        },
        'Helper.java': {
          text: 'class Helper {}',
          isVisible: true,
          isOpen: false,
          isActive: false,
        },
      };
      const validation: JavalabFlatSource = {
        'OpenTest.java': {
          text: 'class OpenTest {}',
          isVisible: false,
          isOpen: true,
          isActive: true,
          tabOrder: 1,
        },
        'ClosedTest.java': {
          text: 'class ClosedTest {}',
          isVisible: false,
          isOpen: false,
          isActive: false,
        },
      };

      const merged = mergeValidationIntoStart(start, validation)!;
      const mf = flatToMultiFile(merged);
      const {startSources: roundStart, validation: roundValidation} =
        splitForLevelbuilderSave(mf);

      expect(Object.keys(roundStart).sort()).toEqual([
        'Helper.java',
        'Main.java',
      ]);
      expect(Object.keys(roundValidation).sort()).toEqual([
        'ClosedTest.java',
        'OpenTest.java',
      ]);

      expect(roundStart['Main.java'].isOpen).toBe(true);
      expect(roundStart['Main.java'].tabOrder).toBe(0);
      expect(roundStart['Helper.java'].isOpen).toBe(false);
      expect(roundStart['Helper.java'].tabOrder).toBeUndefined();

      expect(roundValidation['OpenTest.java'].isOpen).toBe(true);
      expect(roundValidation['OpenTest.java'].isActive).toBe(true);
      expect(roundValidation['OpenTest.java'].tabOrder).toBe(1);
      expect(roundValidation['OpenTest.java'].text).toBe('class OpenTest {}');

      expect(roundValidation['ClosedTest.java'].isOpen).toBe(false);
      expect(roundValidation['ClosedTest.java'].tabOrder).toBeUndefined();
      expect(roundValidation['ClosedTest.java'].text).toBe(
        'class ClosedTest {}'
      );

      // The encrypted_validation payload never leaks isValidation —
      // membership in the validation hash already implies it.
      expect('isValidation' in roundValidation['OpenTest.java']).toBe(false);
      expect('isValidation' in roundValidation['ClosedTest.java']).toBe(false);
    });
  });
});
