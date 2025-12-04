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
  folderId: string = '0'
): ProjectFile => ({
  id,
  name,
  language: name.split('.').pop() || '',
  contents,
  folderId,
});

// Helper to create an AI code file.
const createAiCodeFile = (
  id: string,
  name: string,
  contents: string,
  folderId: string = '0'
) => ({
  id,
  name,
  contents,
  folderId,
});

describe('getMergedAiTutorCodeWithSource', () => {
  describe('creating new files (id="new")', () => {
    it('adds a new file to an empty source', () => {
      const source = createSource();
      const aiCode = [createAiCodeFile('new', 'index.html', '<html></html>')];
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
      expect(result.files['1'].isAiTutorVersionUpdated).toBe(false);
      expect(aiTutorVersionFiles).toHaveLength(1);
    });

    it('assigns incremental IDs for new files', () => {
      const source = createSource({
        '1': createProjectFile('1', 'existing.html', 'existing content'),
      });
      const aiCode = [createAiCodeFile('new', 'style.css', 'body {}')];
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
        createAiCodeFile('new', 'index.html', '<html></html>'),
        createAiCodeFile('new', 'style.css', 'body {}'),
        createAiCodeFile('new', 'script.js', 'console.log("hi")'),
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

  describe('updating existing files (name matches)', () => {
    it('updates an existing file with matching id and name', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'old content'),
      });
      const aiCode = [
        createAiCodeFile('1', 'index.html', 'new content from AI'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(1);
      expect(result.files['1'].contents).toBe('new content from AI');
      expect(result.files['1'].isAiTutorVersionUpdated).toBe(true);
      expect(result.files['1'].isAiTutorVersionCreated).toBe(false);
    });

    it('sets all original files to inactive', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'content'),
        '2': createProjectFile('2', 'style.css', 'styles'),
      });
      const aiCode = [createAiCodeFile('1', 'index.html', 'updated content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(result.files['2'].active).toBe(false);
    });
  });

  describe('name mismatch scenarios', () => {
    it('creates a new file when id exists but name differs', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'original content'),
      });
      const aiCode = [
        createAiCodeFile('1', 'different.html', 'AI generated content'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // Should have both the original and the new file
      expect(Object.keys(result.files)).toHaveLength(2);
      // Original should still exist
      expect(result.files['1'].name).toBe('index.html');
      // New file should be created with next ID
      expect(result.files['2'].name).toBe('different.html');
      expect(result.files['2'].contents).toBe('AI generated content');
    });
  });

  describe('duplicate file name handling', () => {
    it('adds numeric suffix when file name already exists', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'original'),
      });
      // AI tries to create a file with a name that already exists (different id, same name)
      const aiCode = [createAiCodeFile('2', 'index.html', 'duplicate attempt')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(2);
      // Original file should be unchanged
      expect(result.files['1'].name).toBe('index.html');
      // New file should have a numeric suffix (getNextFileId returns '2' since max existing id is '1')
      expect(result.files['2'].name).toBe('index_1.html');
    });

    it('increments suffix until a valid name is found', () => {
      const source = createSource({
        '1': createProjectFile('1', 'file.html', 'original'),
        '2': createProjectFile('2', 'file_1.html', 'first copy'),
        '3': createProjectFile('3', 'file_2.html', 'second copy'),
      });
      // AI tries to create a file with a name that already exists
      const aiCode = [createAiCodeFile('4', 'file.html', 'AI content')];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      expect(Object.keys(result.files)).toHaveLength(4);
      // Should find file_3.html as the first available name (getNextFileId returns '4' since max existing id is '3')
      expect(result.files['4'].name).toBe('file_3.html');
    });

    it('moves file to root folder before adding suffix if in subfolder', () => {
      const source = createSource(
        {
          // File '1' has a different name than what AI will provide (triggers name mismatch).
          '1': createProjectFile('1', 'original.html', 'content', 'folder1'),
          // File '2' has the name AI wants, causing a duplicate in folder1.
          '2': createProjectFile('2', 'test.html', 'content', 'folder1'),
          // File '3' has the same name in root, so suffix is needed after moving.
          '3': createProjectFile('3', 'test.html', 'content'),
        },
        {
          folder1: {id: 'folder1', name: 'subfolder', parentId: '0'},
        }
      );
      // AI provides id '1' but with a different name 'test.html' (triggers name mismatch branch).
      // 'test.html' already exists in folder1 (file '2'), so it moves to root.
      // 'test.html' also exists in root (file '3'), so a suffix is added.
      const aiCode = [
        createAiCodeFile('1', 'test.html', 'AI content', 'folder1'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      const result = getMergedAiTutorCodeWithSource(
        aiCode,
        source,
        aiTutorVersionFiles
      );

      // getNextFileId returns '4' (max existing id is '3')
      // Should have moved to root folder (folderId: '0') with numeric suffix
      expect(result.files['4'].folderId).toBe('0');
      expect(result.files['4'].name).toBe('test_1.html');
    });
  });

  describe('aiTutorVersionFiles array', () => {
    it('populates aiTutorVersionFiles with created/updated files', () => {
      const source = createSource({
        '1': createProjectFile('1', 'index.html', 'original'),
      });
      const aiCode = [
        createAiCodeFile('1', 'index.html', 'updated content'),
        createAiCodeFile('new', 'style.css', 'new styles'),
      ];
      const aiTutorVersionFiles: ProjectFile[] = [];

      getMergedAiTutorCodeWithSource(aiCode, source, aiTutorVersionFiles);

      expect(aiTutorVersionFiles).toHaveLength(2);
    });

    it('sorts aiTutorVersionFiles alphabetically by name', () => {
      const source = createSource();
      const aiCode = [
        createAiCodeFile('new', 'zebra.html', 'z content'),
        createAiCodeFile('new', 'alpha.css', 'a content'),
        createAiCodeFile('new', 'middle.js', 'm content'),
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
      const aiCode = [createAiCodeFile('1', 'index.html', 'new content')];
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
      const aiCode = [createAiCodeFile('new', 'style.css', 'styles')];
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
        createAiCodeFile('new', 'style.css', 'body {}'),
        createAiCodeFile('new', 'index.html', '<html></html>'),
        createAiCodeFile('new', 'script.js', 'console.log()'),
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
        createAiCodeFile('new', 'style.css', 'body {}'),
        createAiCodeFile('new', 'script.js', 'console.log()'),
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
      const aiCode = [createAiCodeFile('1', 'index.html', 'new content')];
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
        createAiCodeFile('new', 'index.html', '<html></html>'),
        createAiCodeFile('new', 'style.css', 'body {}'),
        createAiCodeFile('new', 'script.js', 'console.log()'),
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
