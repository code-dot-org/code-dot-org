import type {PyodideInterface} from 'pyodide';

import {MultiFileSource} from '@cdo/apps/lab2/types';
import {
  deleteCachedUserModules,
  getCleanupCode,
  getUpdatedSourceAndDeleteFiles,
  importPackagesFromFiles,
  resetGlobals,
  writeSource,
} from '@cdo/apps/pythonlab/pythonHelpers/pythonScriptUtils';
import {PyodidePathContent} from '@cdo/apps/pythonlab/types';

// Arbitrary stand-ins for the st_mode bits Pyodide's FS reports. Our fakes only
// need isFile/isDir to distinguish the two, so any distinct values work.
const FILE_MODE = 0o100000;
const DIR_MODE = 0o040000;

function fileNode(id: number, name: string): PyodidePathContent {
  return {id, name, mode: FILE_MODE, contents: {}};
}

function dirNode(
  id: number,
  name: string,
  children: Record<string, PyodidePathContent>
): PyodidePathContent {
  return {id, name, mode: DIR_MODE, contents: children};
}

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

  describe('writeSource', () => {
    // Records writeFile/mkdir calls against an in-memory model of Pyodide's FS.
    // readdir always throws so createFolderIfNotExists takes the mkdir branch.
    function makeWriteFs() {
      const writtenFiles: Record<string, string> = {};
      const madeDirs: string[] = [];
      const pyodide = {
        FS: {
          writeFile: (path: string, contents: string) => {
            writtenFiles[path] = contents;
          },
          readdir: () => {
            throw new Error('directory does not exist');
          },
          mkdir: (path: string) => {
            madeDirs.push(path);
          },
        },
      } as unknown as PyodideInterface;
      return {pyodide, writtenFiles, madeDirs};
    }

    it('writes top-level files at the root path', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'print(1)', folderId: '0'},
        },
      };
      const {pyodide, writtenFiles} = makeWriteFs();

      writeSource(source, '0', '', pyodide);

      expect(writtenFiles['main.py']).toBe('print(1)');
    });

    it('creates folders and writes their nested files with qualified paths', () => {
      const source: MultiFileSource = {
        folders: {
          '1': {id: '1', name: 'pkg', parentId: '0'},
        },
        files: {
          '1': {id: '1', name: 'main.py', contents: 'a', folderId: '0'},
          '2': {id: '2', name: 'util.py', contents: 'b', folderId: '1'},
        },
      };
      const {pyodide, writtenFiles, madeDirs} = makeWriteFs();

      writeSource(source, '0', '', pyodide);

      expect(writtenFiles['main.py']).toBe('a');
      expect(writtenFiles['pkg/util.py']).toBe('b');
      expect(madeDirs).toContain('pkg');
    });
  });

  describe('getUpdatedSourceAndDeleteFiles', () => {
    // Backs the FS with a directory tree (topContents) and a path->text map for
    // readFile. Records unlink/rmdir/mkdir so tests can assert cleanup happened.
    function makeReadFs(
      topContents: Record<string, PyodidePathContent>,
      fileTextByPath: Record<string, string>
    ) {
      const unlinked: string[] = [];
      const removedDirs: string[] = [];
      const madeDirs: string[] = [];
      const pyodide = {
        FS: {
          cwd: () => '/Files',
          lookupPath: () => ({node: {contents: topContents}}),
          isFile: (mode: number) => mode === FILE_MODE,
          isDir: (mode: number) => mode === DIR_MODE,
          readFile: (path: string) => {
            if (!(path in fileTextByPath)) {
              throw new Error(`missing file ${path}`);
            }
            return fileTextByPath[path];
          },
          unlink: (path: string) => {
            unlinked.push(path);
          },
          rmdir: (path: string) => {
            removedDirs.push(path);
          },
          readdir: () => {
            throw new Error('directory does not exist');
          },
          mkdir: (path: string) => {
            madeDirs.push(path);
          },
        },
      } as unknown as PyodideInterface;
      return {pyodide, unlinked, removedDirs, madeDirs};
    }

    const noop = () => undefined;

    it('updates an existing file with its new contents and unlinks it', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'old', folderId: '0'},
        },
      };
      const {pyodide, unlinked} = makeReadFs(
        {'main.py': fileNode(1, 'main.py')},
        {'/Files/main.py': 'new'}
      );

      const result = getUpdatedSourceAndDeleteFiles(
        source,
        'run-id',
        pyodide,
        noop
      );

      expect(result.files['1'].contents).toBe('new');
      expect(unlinked).toContain('/Files/main.py');
      // Original source is cloned, not mutated.
      expect(source.files['1'].contents).toBe('old');
    });

    it('adds files that appeared in the working directory', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'a', folderId: '0'},
        },
      };
      const {pyodide} = makeReadFs(
        {'main.py': fileNode(1, 'main.py'), 'out.csv': fileNode(2, 'out.csv')},
        {'/Files/main.py': 'a', '/Files/out.csv': 'x,y\n1,2'}
      );

      const result = getUpdatedSourceAndDeleteFiles(
        source,
        'run-id',
        pyodide,
        noop
      );

      const added = Object.values(result.files).find(f => f.name === 'out.csv');
      expect(added).toBeDefined();
      expect(added?.contents).toBe('x,y\n1,2');
      expect(added?.folderId).toBe('0');
    });

    it('does not save skipped files but still unlinks them', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'a', folderId: '0'},
        },
      };
      const {pyodide, unlinked} = makeReadFs(
        {
          'main.py': fileNode(1, 'main.py'),
          'validation.py': fileNode(2, 'validation.py'),
        },
        {'/Files/main.py': 'a', '/Files/validation.py': 'asserts'}
      );

      const result = getUpdatedSourceAndDeleteFiles(
        source,
        'run-id',
        pyodide,
        noop,
        ['validation.py']
      );

      const saved = Object.values(result.files).find(
        f => f.name === 'validation.py'
      );
      expect(saved).toBeUndefined();
      expect(unlinked).toContain('/Files/validation.py');
    });

    it('records new folders and their files, then removes the directory', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'a', folderId: '0'},
        },
      };
      const {pyodide, unlinked, removedDirs} = makeReadFs(
        {
          'main.py': fileNode(1, 'main.py'),
          pkg: dirNode(2, 'pkg', {'util.py': fileNode(3, 'util.py')}),
        },
        {'/Files/main.py': 'a', '/Files/pkg/util.py': 'b'}
      );

      const result = getUpdatedSourceAndDeleteFiles(
        source,
        'run-id',
        pyodide,
        noop
      );

      const folder = Object.values(result.folders).find(f => f.name === 'pkg');
      expect(folder).toBeDefined();
      const nested = Object.values(result.files).find(
        f => f.name === 'util.py'
      );
      expect(nested?.contents).toBe('b');
      expect(nested?.folderId).toBe(folder?.id);
      expect(unlinked).toContain('/Files/pkg/util.py');
      expect(removedDirs).toContain('/Files/pkg/');
    });

    it('ignores hidden folders such as .matplotlib', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {id: '1', name: 'main.py', contents: 'a', folderId: '0'},
        },
      };
      const {pyodide, removedDirs} = makeReadFs(
        {
          'main.py': fileNode(1, 'main.py'),
          '.matplotlib': dirNode(2, '.matplotlib', {
            'cache.txt': fileNode(3, 'cache.txt'),
          }),
        },
        {'/Files/main.py': 'a'}
      );

      const result = getUpdatedSourceAndDeleteFiles(
        source,
        'run-id',
        pyodide,
        noop
      );

      expect(
        Object.values(result.folders).find(f => f.name === '.matplotlib')
      ).toBeUndefined();
      expect(removedDirs).not.toContain('/Files/.matplotlib/');
    });

    it('reports an internal error when a file cannot be read', () => {
      const source: MultiFileSource = {
        folders: {},
        files: {},
      };
      // No entry in fileTextByPath, so readFile throws.
      const {pyodide} = makeReadFs({'main.py': fileNode(1, 'main.py')}, {});
      const messages: {type: string}[] = [];

      getUpdatedSourceAndDeleteFiles(source, 'run-id', pyodide, message =>
        messages.push(message)
      );

      expect(messages.some(m => m.type === 'internal_error')).toBe(true);
    });
  });

  describe('importPackagesFromFiles', () => {
    it('loads packages only from python files', async () => {
      const source: MultiFileSource = {
        folders: {},
        files: {
          '1': {
            id: '1',
            name: 'main.py',
            contents: 'import numpy',
            folderId: '0',
          },
          '2': {id: '2', name: 'data.csv', contents: 'x,y', folderId: '0'},
        },
      };
      const loadPackagesFromImports = jest.fn().mockResolvedValue(undefined);
      const pyodide = {
        loadPackagesFromImports,
      } as unknown as PyodideInterface;

      await importPackagesFromFiles(source, pyodide);

      expect(loadPackagesFromImports).toHaveBeenCalledTimes(1);
      expect(loadPackagesFromImports).toHaveBeenCalledWith('import numpy');
    });
  });

  describe('resetGlobals', () => {
    it('deletes globals that were not present at startup, keeping the rest', () => {
      const originalGlobals = new Map<string, string>([['__builtins__', 'x']]);
      const currentGlobals = new Map<string, string>([
        ['__builtins__', 'x'],
        ['userVar', '1'],
      ]);
      const deleted: string[] = [];
      const pyodide = {
        globals: {
          toJs: () => currentGlobals,
          delete: (key: string) => {
            deleted.push(key);
          },
        },
      } as unknown as PyodideInterface;

      resetGlobals(pyodide, originalGlobals);

      expect(deleted).toEqual(['userVar']);
    });
  });
});
