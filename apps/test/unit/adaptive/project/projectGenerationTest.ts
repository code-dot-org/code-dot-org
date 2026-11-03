import {
  GENERATION_TRACE_KEY,
  applyGeneratedFiles,
  editableFiles,
  generationTraceId,
} from '@cdo/apps/adaptive/project/projectGeneration';
import {Channel, ProjectFileType, ProjectSources} from '@cdo/apps/lab2/types';

const sources: ProjectSources = {
  source: {
    folders: {},
    files: {
      '1': {
        id: '1',
        name: 'index.html',
        contents: '<h1>Hi</h1>',
        folderId: '0',
      },
      '2': {id: '2', name: 'style.css', contents: 'h1 {}', folderId: '0'},
      '3': {
        id: '3',
        name: 'logo.png',
        contents: '',
        folderId: '0',
        url: 'https://example.com/logo.png',
      },
      '4': {
        id: '4',
        name: 'check.js',
        contents: 'check()',
        folderId: '0',
        type: ProjectFileType.VALIDATION,
      },
      '5': {
        id: '5',
        name: 'helper.js',
        contents: 'help()',
        folderId: '0',
        type: ProjectFileType.SUPPORT,
      },
      '6': {
        id: '6',
        name: 'about.html',
        contents: '<p>About</p>',
        folderId: '0',
        type: ProjectFileType.LOCKED_STARTER,
      },
    },
  },
};

describe('editableFiles', () => {
  it('lists the files the student edits, locked or not, and no asset or hidden file', () => {
    expect(editableFiles(sources).map(file => file.name)).toEqual([
      'index.html',
      'style.css',
      'about.html',
    ]);
  });

  it('is empty for a single-source project', () => {
    expect(editableFiles({source: 'print(1)'})).toEqual([]);
    expect(editableFiles(undefined)).toEqual([]);
  });
});

describe('applyGeneratedFiles', () => {
  it('replaces matching text files and keeps the rest', () => {
    const seeded = applyGeneratedFiles(sources, [
      {name: 'index.html', contents: '<h1>Dogs</h1>'},
      {name: 'check.js', contents: 'nope()'},
      {name: 'helper.js', contents: 'nope()'},
      {name: 'extra.html', contents: '<p>no</p>'},
    ]);
    expect(seeded).toEqual({
      source: {
        folders: {},
        files: {
          ...((sources.source as {files: unknown}).files as object),
          '1': {
            id: '1',
            name: 'index.html',
            contents: '<h1>Dogs</h1>',
            folderId: '0',
          },
        },
      },
    });
    expect(sources.source).toMatchObject({
      files: {'1': {contents: '<h1>Hi</h1>'}},
    });
  });

  it('is undefined when no file matched', () => {
    expect(
      applyGeneratedFiles(sources, [{name: 'extra.html', contents: ''}])
    ).toBeUndefined();
    expect(
      applyGeneratedFiles({source: 'print(1)'}, [
        {name: 'index.html', contents: ''},
      ])
    ).toBeUndefined();
  });
});

describe('generationTraceId', () => {
  it('reads the trace off the channel', () => {
    const channel = {
      labConfig: {adaptive: {[GENERATION_TRACE_KEY]: 'ab'.repeat(16)}},
    } as unknown as Channel;
    expect(generationTraceId(channel)).toBe('ab'.repeat(16));
    expect(generationTraceId({} as Channel)).toBeUndefined();
    expect(generationTraceId(undefined)).toBeUndefined();
  });
});
