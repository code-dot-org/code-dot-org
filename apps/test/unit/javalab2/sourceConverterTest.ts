import {DEFAULT_FOLDER_ID} from '@codebridge/constants';

import {
  flatToMultiFile,
  multiFileToFlat,
  JavalabFlatSource,
} from '@cdo/apps/javalab2/sourceConverter';
import {
  MultiFileSource,
  ProjectFileType,
} from '@cdo/apps/lab2/types';

function flatFile(
  text: string,
  tabOrder: number,
  isVisible = true,
  isValidation = false
) {
  return {text, tabOrder, isVisible, isValidation};
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

    it('falls back to insertion order when tabOrder is missing or duplicated', () => {
      const mf = flatToMultiFile({
        'A.java': flatFile('a', 0),
        'B.java': flatFile('b', 0), // duplicate
        'C.java': {text: 'c', tabOrder: NaN, isVisible: true, isValidation: false},
      });
      const names = (mf.openFiles ?? []).map(id => mf.files[id].name);
      expect(names).toEqual(['A.java', 'B.java', 'C.java']);
    });
  });

  describe('multiFileToFlat', () => {
    it('returns {} for nil/empty input', () => {
      expect(multiFileToFlat(null)).toEqual({});
      expect(multiFileToFlat(undefined)).toEqual({});
      expect(
        multiFileToFlat({folders: {}, files: {}, openFiles: []})
      ).toEqual({});
    });

    it('round-trips a multi-file source with mixed types', () => {
      const original: JavalabFlatSource = {
        'Main.java': flatFile('class Main {}', 0, true, false),
        'Helper.java': flatFile('class Helper {}', 1, true, false),
        'Hidden.java': flatFile('hidden', 2, false, false),
        'Test.java': flatFile('test', 3, false, true),
      };
      const round = multiFileToFlat(flatToMultiFile(original));

      expect(Object.keys(round).sort()).toEqual(
        Object.keys(original).sort()
      );
      Object.keys(original).forEach(name => {
        expect(round[name].text).toBe(original[name].text);
        expect(round[name].isVisible).toBe(original[name].isVisible);
        expect(round[name].isValidation).toBe(original[name].isValidation);
      });

      // Visible files keep their relative order in tabOrder
      expect(round['Main.java'].tabOrder).toBeLessThan(
        round['Helper.java'].tabOrder
      );
      // Hidden / validation files get a tabOrder >= count of visible files
      expect(round['Hidden.java'].tabOrder).toBeGreaterThanOrEqual(2);
      expect(round['Test.java'].tabOrder).toBeGreaterThanOrEqual(2);
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
  });
});
