import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  flatToMultiFile,
  multiFileToFlat,
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

    it('typifies hidden and validation files; excludes from openFiles', () => {
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

      // Open visible files keep their relative order in tabOrder.
      // Closed/hidden/validation files have no tab position, so
      // tabOrder is omitted.
      const mainTab = round['Main.java'].tabOrder!;
      const helperTab = round['Helper.java'].tabOrder!;
      expect(mainTab).toBeLessThan(helperTab);
      expect(round['Hidden.java'].tabOrder).toBeUndefined();
      expect(round['Test.java'].tabOrder).toBeUndefined();
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
      // Support and validation files emit isOpen:false explicitly and
      // have no tabOrder either (they aren't tabs).
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
});
