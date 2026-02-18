import {MultiFileSource, ProjectFile} from '@cdo/apps/lab2/types';
import {getMergedAiTutorCodeWithSource} from '@cdo/apps/weblab2/helpers/aiTutorStructuredResponseHelper';

// Helper to create a MultiFileSource.
const createSource = (
  files: Record<string, ProjectFile> = {},
  folders: Record<string, {id: string; name: string; parentId: string}> = {}
): MultiFileSource => ({
  files,
  folders,
  openFiles: [],
});

// Helper to create a ProjectFile.
const createProjectFile = (
  id: string,
  name: string,
  contents: string,
  folderId: string = '0',
  active: boolean = false
): ProjectFile => ({
  id,
  name,
  language: name.split('.').pop() || '',
  contents,
  folderId,
  active,
});

// Helper to create an AI code file.
const createAiCodeFile = (name: string, contents: string) => ({
  name,
  contents,
});

describe('getMergedAiTutorCodeWithSource', () => {
  describe('creating new files', () => {
    it('adds a new file to an empty source', () => {
      const source = createSource();
      const aiCode = [createAiCodeFile('index.html', '<html></html>')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(1);
      expect(result.files['1']).toBeDefined();
      expect(result.files['1'].name).toBe('index.html');
      expect(result.files['1'].contents).toBe('<html></html>');
      expect(result.files['1'].isAiTutorVersionCreated).toBe(true);
      expect(result.files['1'].isAiTutorVersionUpdated).toBeUndefined();
      expect(aiTutorVersionFiles).toHaveLength(1);
    });

    it('assigns incremental IDs for new files', () => {
      const source = createSource({
        '1': createProjectFile('1', 'existing.html', 'existing content'),
      });
      const aiCode = [createAiCodeFile('style.css', 'body {}')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(2);
      expect(result.files['2']).toBeDefined();
      expect(result.files['2'].name).toBe('style.css');
    });

    it('creates multiple new files with correct IDs', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('index.html', '<html></html>'),
        createAiCodeFile('style.css', 'body {}'),
        createAiCodeFile('script.js', 'console.log("hi")'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(3);
      expect(result.files['1'].name).toBe('index.html');
      expect(result.files['2'].name).toBe('style.css');
      expect(result.files['3'].name).toBe('script.js');
    });
  });

  describe('updating existing files by name', () => {
    it('updates an existing file with matching name', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'old content'),
      });
      const aiCode = [createAiCodeFile('index.html', 'new content from AI')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(1);
      expect(result.files['1'].contents).toBe('new content from AI');
      expect(result.files['1'].isAiTutorVersionUpdated).toBe(true);
      expect(result.files['1'].isAiTutorVersionCreated).toBeUndefined();
    });

    it('updates active file when name matches', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'content', '0', true),
        '2': createProjectFile('2', 'style.css', 'styles'),
      });
      const aiCode = [createAiCodeFile('index.html', 'updated content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(result.files['1'].contents).toBe('updated content');
      expect(result.files['1'].isAiTutorVersionUpdated).toBe(true);
    });

    it('sets all original files to inactive', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'content', '0', true),
        '2': createProjectFile('2', 'style.css', 'styles'),
      });
      const aiCode = [createAiCodeFile('index.html', 'updated content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // File '2' should be inactive since all files are set inactive before processing
      expect(result.files['2'].active).toBe(false);
    });
  });

  describe('multiple files with same name handling', () => {
    it('creates new file when multiple files have the same name in subfolders', () => {
      const source = createSource(
        {
          '1': createProjectFile(
            '1',
            'index.html',
            'content in folder1',
            'folder1'
          ),
          '2': createProjectFile(
            '2',
            'index.html',
            'content in folder2',
            'folder2'
          ),
        },
        {
          folder1: {id: 'folder1', name: 'folder1', parentId: '0'},
          folder2: {id: 'folder2', name: 'folder2', parentId: '0'},
        }
      );
      const aiCode = [createAiCodeFile('index.html', 'AI content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // Should create a new file since multiple files have the same name.
      // No suffix needed since there's no index.html in the root folder.
      expect(Object.keys(result.files)).toHaveLength(3);
      expect(result.files['3'].folderId).toBe('0');
      expect(result.files['3'].name).toBe('index.html');
      expect(result.files['3'].isAiTutorVersionCreated).toBe(true);
    });

    it('adds numeric suffix when new file name conflicts with existing in root', () => {
      const source = createSource(
        {
          '1': createProjectFile(
            '1',
            'file.html',
            'content in folder1',
            'folder1'
          ),
          '2': createProjectFile(
            '2',
            'file.html',
            'content in folder2',
            'folder2'
          ),
          '3': createProjectFile('3', 'file.html', 'content in root', '0'),
        },
        {
          folder1: {id: 'folder1', name: 'folder1', parentId: '0'},
          folder2: {id: 'folder2', name: 'folder2', parentId: '0'},
        }
      );
      const aiCode = [createAiCodeFile('file.html', 'AI content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // Multiple files named file.html exist, so a new file is created.
      // file.html exists in root, so suffix is added.
      expect(Object.keys(result.files)).toHaveLength(4);
      expect(result.files['4'].name).toBe('file_1.html');
      expect(result.files['4'].folderId).toBe('0');
    });
  });

  describe('aiTutorVersionFiles array', () => {
    it('populates aiTutorVersionFiles with created/updated files', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'original'),
      });
      const aiCode = [
        createAiCodeFile('index.html', 'updated content'),
        createAiCodeFile('style.css', 'new styles'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      getMergedAiTutorCodeWithSource(aiCode, source, aiTutorVersionFiles);

      expect(aiTutorVersionFiles).toHaveLength(2);
    });

    it('sorts aiTutorVersionFiles alphabetically by name', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('zebra.html', 'z content'),
        createAiCodeFile('alpha.css', 'a content'),
        createAiCodeFile('middle.js', 'm content'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      getMergedAiTutorCodeWithSource(aiCode, source, aiTutorVersionFiles);

      expect(aiTutorVersionFiles[0].name).toBe('alpha.css');
      expect(aiTutorVersionFiles[1].name).toBe('middle.js');
      expect(aiTutorVersionFiles[2].name).toBe('zebra.html');
    });
  });

  describe('source immutability', () => {
    it('does not modify the original source object', () => {
      const originalFiles = {
        '1': createProjectFile('1', 'index.html', 'original content'),
      };
      const source = createSource(originalFiles);
      const aiCode = [createAiCodeFile('index.html', 'new content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      getMergedAiTutorCodeWithSource(aiCode, source, aiTutorVersionFiles);

      // Original source should be unchanged
      expect(source.files['1'].contents).toBe('original content');
    });

    it('preserves existing openFiles after AI files', () => {
      const source: MultiFileSource = {
        files: {'1': createProjectFile('1', 'index.html', 'content')},
        folders: {},
        openFiles: ['1'],
      };
      const aiCode = [createAiCodeFile('style.css', 'styles')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // AI file comes first, then existing openFiles
      expect(result.openFiles).toEqual(['2', '1']);
    });
  });

  describe('openFiles prioritization', () => {
    it('puts first HTML file first in openFiles and sets it active', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('style.css', 'body {}'),
        createAiCodeFile('index.html', '<html></html>'),
        createAiCodeFile('script.js', 'console.log()'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // HTML file should be first and active.
      expect(result.openFiles?.[0]).toBe('2'); // index.html has id '2'
      expect(result.files['2'].active).toBe(true);
      // Other AI files follow
      expect(result.openFiles).toContain('1'); // style.css
      expect(result.openFiles).toContain('3'); // script.js
    });

    it('uses first AI file if no HTML file exists', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('style.css', 'body {}'),
        createAiCodeFile('script.js', 'console.log()'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // First AI file (alphabetically sorted) should be active.
      // aiTutorVersionFiles is sorted alphabetically: script.js, style.css.
      expect(result.files[aiTutorVersionFiles[0].id].active).toBe(true);
      expect(result.openFiles?.[0]).toBe(aiTutorVersionFiles[0].id);
    });

    it('removes duplicate AI file ids from existing openFiles', () => {
      const source: MultiFileSource = {
        files: {
          '1': createProjectFile('1', 'index.html', 'old content'),
          '2': createProjectFile('2', 'other.html', 'other content'),
        },
        folders: {},
        openFiles: ['1', '2'],
      };
      // Update file '1'.
      const aiCode = [createAiCodeFile('index.html', 'new content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // File '1' should appear only once (as AI file), '2' preserved.
      expect(result.openFiles).toEqual(['1', '2']);
      expect(result.openFiles?.filter(id => id === '1')).toHaveLength(1);
    });

    it('does not modify openFiles when no AI files are provided', () => {
      const source: MultiFileSource = {
        files: {'1': createProjectFile('1', 'index.html', 'content')},
        folders: {},
        openFiles: ['1'],
      };
      const aiCode: ReturnType<typeof createAiCodeFile>[] = [];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(result.openFiles).toEqual(['1']);
    });
  });

  describe('file language detection', () => {
    it('sets language based on file extension', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('index.html', '<html></html>'),
        createAiCodeFile('style.css', 'body {}'),
        createAiCodeFile('script.js', 'console.log()'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(result.files['1'].language).toBe('html');
      expect(result.files['2'].language).toBe('css');
      expect(result.files['3'].language).toBe('js');
    });
  });
});
