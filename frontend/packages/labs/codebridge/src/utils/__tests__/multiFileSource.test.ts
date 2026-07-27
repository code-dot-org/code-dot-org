import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  activateFile,
  closeFile,
  createNewFile,
  createExternalFile,
  createNewFolder,
  deleteFile,
  deleteFolder,
  getActiveFileForSource,
  getNextFileId,
  getOpenFileIds,
  renameFile,
  saveFileContents,
  shouldShowFile,
  toggleFolderOpen,
} from '../multiFileSource';

// A two-file project: a.py (active) and b.py, both open.
const source = (): MultiFileSource => ({
  folders: {},
  files: {
    '1': {
      id: '1',
      name: 'a.py',
      language: 'python',
      contents: 'a',
      folderId: '0',
      active: true,
    },
    '2': {
      id: '2',
      name: 'b.py',
      language: 'python',
      contents: 'b',
      folderId: '0',
    },
  },
  openFiles: ['1', '2'],
});

describe('getActiveFileForSource', () => {
  it('returns the active file', () => {
    expect(getActiveFileForSource(source())?.id).toBe('1');
  });
  it('hides support/validation files', () => {
    const s = source();
    s.files['1'].type = 'support';
    expect(shouldShowFile(s.files['1'])).toBe(false);
  });
});

describe('saveFileContents', () => {
  it('updates contents', () => {
    expect(saveFileContents(source(), '1', 'x').files['1'].contents).toBe('x');
  });
  it('is a no-op (same ref) when unchanged', () => {
    const s = source();
    expect(saveFileContents(s, '1', 'a')).toBe(s);
  });
});

describe('activateFile', () => {
  it('activates the target and deactivates the previous', () => {
    const next = activateFile(source(), '2');
    expect(next.files['2'].active).toBe(true);
    expect(next.files['1'].active).toBe(false);
  });
  it('is a no-op when already active', () => {
    const s = source();
    expect(activateFile(s, '1')).toBe(s);
  });
});

describe('closeFile', () => {
  it('closes the active file and activates a neighbor', () => {
    const next = closeFile(source(), '1');
    expect(next.openFiles).toEqual(['2']);
    expect(next.files['2'].active).toBe(true);
    expect(next.files['1'].active).toBe(false);
  });
});

describe('createNewFile', () => {
  it('adds an active file with the next id', () => {
    const next = createNewFile({
      source: source(),
      fileName: 'c.py',
      language: 'python',
    });
    const id = getNextFileId(Object.values(source().files)); // '3'
    expect(next.files[id]).toMatchObject({
      name: 'c.py',
      language: 'python',
      active: true,
    });
    expect(next.files['1'].active).toBe(false);
    expect(getOpenFileIds(next)).toContain(id);
  });
});

describe('createExternalFile', () => {
  it('adds an active url-referenced file with empty contents', () => {
    const next = createExternalFile({
      source: source(),
      fileName: 'hero.png',
      language: 'png',
      url: '/v3/assets/chan/abc.png',
      mimeType: 'image/png',
    });
    const id = getNextFileId(Object.values(source().files));
    expect(next.files[id]).toMatchObject({
      name: 'hero.png',
      language: 'png',
      contents: '',
      url: '/v3/assets/chan/abc.png',
      mimeType: 'image/png',
      active: true,
    });
    expect(getOpenFileIds(next)).toContain(id);
  });
});

describe('deleteFile', () => {
  it('removes the file and reactivates a neighbor', () => {
    const next = deleteFile(source(), '1');
    expect(next.files['1']).toBeUndefined();
    expect(next.openFiles).toEqual(['2']);
    expect(next.files['2'].active).toBe(true);
  });
});

describe('renameFile', () => {
  it('changes the name only', () => {
    const next = renameFile(source(), '1', 'z.py');
    expect(next.files['1'].name).toBe('z.py');
    expect(next.files['1'].contents).toBe('a');
  });
});

describe('folders', () => {
  it('creates, toggles, and recursively deletes', () => {
    let s = createNewFolder(source(), 'src'); // folder id '1'
    expect(s.folders['1']).toMatchObject({name: 'src', parentId: '0'});

    s = toggleFolderOpen(s, '1');
    expect(s.folders['1'].open).toBe(true);

    // Put a file inside the folder, then delete the folder.
    s = {
      ...s,
      files: {
        ...s.files,
        '9': {
          id: '9',
          name: 'in.py',
          language: 'python',
          contents: '',
          folderId: '1',
        },
      },
    };
    const deleted = deleteFolder(s, '1');
    expect(deleted.folders['1']).toBeUndefined();
    expect(deleted.files['9']).toBeUndefined();
    expect(deleted.files['1']).toBeDefined(); // root file untouched
  });
});
