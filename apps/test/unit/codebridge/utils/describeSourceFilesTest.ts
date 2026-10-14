import {describeSourceFiles} from '@codebridge/utils/describeSourceFiles';

import {MultiFileSource, ProjectFileType} from '@cdo/apps/lab2/types';

const source: MultiFileSource = {
  folders: {f1: {id: 'f1', name: 'css', parentId: '0'}},
  files: {
    a: {id: 'a', name: 'index.html', contents: '<p>hi</p>', folderId: '0'},
    b: {id: 'b', name: 'style.css', contents: 'p{}', folderId: 'f1'},
    c: {
      id: 'c',
      name: 'check.js',
      contents: 'x',
      folderId: '0',
      type: ProjectFileType.VALIDATION,
    },
    d: {id: 'd', name: 'cat.png', contents: '', folderId: '0', url: 'http://i'},
    e: {id: 'e', name: 'notes.txt', contents: 'n', folderId: '0'},
  },
};

describe('describeSourceFiles', () => {
  it('fences each readable file under its path and names images by path', () => {
    expect(describeSourceFiles(source)).toBe(
      [
        'filename: index.html\n```\n<p>hi</p>\n```',
        'filename: /css/style.css\n```\np{}\n```',
        'image: cat.png',
        'filename: notes.txt\n```\nn\n```',
      ].join('\n\n')
    );
  });

  it('fences nothing for an empty file', () => {
    const empty: MultiFileSource = {
      folders: {},
      files: {a: {id: 'a', name: 'blank.css', contents: '', folderId: '0'}},
    };
    expect(describeSourceFiles(empty)).toBe('filename: blank.css\n');
  });

  it('always leaves out validation and support files', () => {
    expect(describeSourceFiles(source)).not.toContain('check.js');
  });

  it('leaves out excluded extensions', () => {
    expect(
      describeSourceFiles(source, {excludeExtensions: ['txt']})
    ).not.toContain('notes.txt');
  });

  it('truncates each file and stops at the total budget', () => {
    const out = describeSourceFiles(source, {
      maxFileChars: 3,
      maxTotalChars: 60,
    });
    expect(out).toContain('```\n<p>\n```');
    expect(out).not.toContain('style.css');
  });
});
