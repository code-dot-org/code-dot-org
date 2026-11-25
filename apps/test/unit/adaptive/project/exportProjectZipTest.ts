import JSZip from 'jszip';

import {
  buildProjectZip,
  exportName,
} from '@cdo/apps/adaptive/project/exportProjectZip';
import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

const source: MultiFileSource = {
  folders: {
    '1': {id: '1', name: 'css', parentId: '0'},
    '2': {id: '2', name: 'images', parentId: '0'},
  },
  files: {
    '1': {id: '1', name: 'index.html', contents: '<h1>Hi</h1>', folderId: '0'},
    '2': {
      id: '2',
      name: 'style.css',
      contents: 'h1 {}',
      folderId: '1',
      type: ProjectFileType.STARTER,
    },
    '3': {
      id: '3',
      name: 'cat.png',
      contents: '',
      folderId: '2',
      url: '/v3/files/abc/cat.png',
    },
    '4': {
      id: '4',
      name: 'validation.js',
      contents: 'check()',
      folderId: '0',
      type: ProjectFileType.VALIDATION,
    },
    '5': {
      id: '5',
      name: 'support.js',
      contents: 'help()',
      folderId: '0',
      type: ProjectFileType.SUPPORT,
    },
  },
};

const okFetch = jest.fn(async () => ({
  ok: true,
  blob: async () => new Blob(['PNG']),
})) as unknown as typeof fetch;

const readZip = async (blob: Blob) => {
  const zip = await JSZip.loadAsync(blob);
  const files: Record<string, string> = {};
  for (const [path, entry] of Object.entries(zip.files)) {
    if (!entry.dir) {
      files[path] = await entry.async('string');
    }
  }
  return files;
};

describe('buildProjectZip', () => {
  it("zips the student's files under one folder, keeping subfolders", async () => {
    const files = await readZip(
      await buildProjectZip(source, 'My Site', okFetch)
    );
    expect(files).toEqual({
      'My Site/index.html': '<h1>Hi</h1>',
      'My Site/css/style.css': 'h1 {}',
      'My Site/images/cat.png': 'PNG',
    });
    expect(okFetch).toHaveBeenCalledWith('/v3/files/abc/cat.png');
  });

  it('rejects without naming the file when an upload cannot be fetched', async () => {
    const failingFetch = jest.fn(async () => ({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })) as unknown as typeof fetch;
    const error = await buildProjectZip(source, 'My Site', failingFetch).catch(
      e => e
    );
    expect(error.message).toBe(
      'Failed to fetch an uploaded file: 404 Not Found'
    );
  });
});

describe('exportName', () => {
  it('drops characters a file name cannot hold', () => {
    expect(exportName(' My: Site/2? ')).toBe('My Site2');
  });

  it('falls back when nothing is left', () => {
    expect(exportName(undefined)).toBe('my-project');
    expect(exportName('/?*')).toBe('my-project');
  });
});
