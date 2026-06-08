import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  deleteCachedUserModules,
  getCleanupCode,
} from '@cdo/apps/pythonlab/pythonHelpers/pythonScriptUtils';

describe('pythonScriptUtils', () => {
  describe('deleteCachedUserModules', () => {
    it('purges main.py from sys.modules so tests re-import fresh student code', () => {
      // Regression: main.py was previously excluded from the purge, leaving a
      // stale `main` module cached across runs. Validation/test code imports
      // `main`, so it would run an old version of the student's solution until
      // the page was refreshed.
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: '', folderId: '0'},
        },
      };

      const code = deleteCachedUserModules(source);

      expect(code).toContain("del sys.modules['main']");
    });

    it('purges every user module', () => {
      const source: MultiFileSource = {
        folders: {
          '1': {id: '1', name: 'pkg', parentId: '0'},
        },
        files: {
          '1': {id: '1', name: 'main.py', contents: '', folderId: '0'},
          '2': {id: '2', name: 'helpers.py', contents: '', folderId: '0'},
          '3': {id: '3', name: 'util.py', contents: '', folderId: '1'},
        },
      };

      const code = deleteCachedUserModules(source);

      expect(code).toContain("del sys.modules['main']");
      expect(code).toContain("del sys.modules['helpers']");
      // Nested files become dotted module paths.
      expect(code).toContain("del sys.modules['pkg.util']");
    });

    it('guards each delete on the module being present in sys.modules', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: '', folderId: '0'},
        },
      };

      const code = deleteCachedUserModules(source);

      expect(code).toContain('if "main" in sys.modules:');
    });
  });

  describe('getCleanupCode', () => {
    it('includes the purge for main.py', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: '', folderId: '0'},
        },
      };

      const code = getCleanupCode(source);

      expect(code).toContain("del sys.modules['main']");
    });
  });
});
