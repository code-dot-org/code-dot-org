// Putting the tutor's rewritten files into the project.
//
// The package decides an answer is a proposal; this is the lab's half, and the
// thing it must not do is lose a student's file or quietly create one they did
// not ask for.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {mergeProposedFiles} from '../proposals';

const file = (over: Partial<ProjectFile>): ProjectFile =>
  ({
    id: '1',
    name: 'index.html',
    language: 'html',
    contents: '<p>old</p>',
    folderId: '0',
    ...over,
  }) as ProjectFile;

const project = (files: ProjectFile[], folders = {}): MultiFileSource =>
  ({
    files: Object.fromEntries(files.map(f => [f.id, f])),
    folders,
  }) as MultiFileSource;

describe('mergeProposedFiles', () => {
  it('rewrites a file that already exists, keeping its id', () => {
    // The id is what every open tab and the editor's own state refer to.
    const source = project([file({})]);

    const {source: merged, changed} = mergeProposedFiles(source, [
      {path: '/index.html', contents: '<p>new</p>'},
    ]);

    expect(Object.keys(merged.files)).toEqual(['1']);
    expect(merged.files['1'].contents).toBe('<p>new</p>');
    expect(changed).toEqual([expect.objectContaining({id: '1'})]);
  });

  it('leaves the files it was not asked about alone', () => {
    const source = project([
      file({id: '1', name: 'index.html'}),
      file({id: '2', name: 'style.css', contents: 'p {}'}),
    ]);

    const {source: merged} = mergeProposedFiles(source, [
      {path: '/index.html', contents: '<p>new</p>'},
    ]);

    expect(merged.files['2'].contents).toBe('p {}');
  });

  it('finds a file inside a folder by its full path', () => {
    const source = project([file({folderId: '7'})], {
      '7': {id: '7', name: 'pages', parentId: '0'},
    });

    const {source: merged} = mergeProposedFiles(source, [
      {path: '/pages/index.html', contents: '<p>new</p>'},
    ]);

    expect(Object.keys(merged.files)).toEqual(['1']);
    expect(merged.files['1'].contents).toBe('<p>new</p>');
  });

  it('adds a file the project did not have', () => {
    const source = project([file({})]);

    const {source: merged, changed} = mergeProposedFiles(source, [
      {path: 'script.js', contents: 'let x = 1;'},
    ]);

    expect(Object.values(merged.files)).toHaveLength(2);
    expect(changed[0]).toMatchObject({
      name: 'script.js',
      language: 'javascript',
      folderId: '0',
      open: true,
    });
  });

  it('puts a new file in the root, whatever path the model invented', () => {
    // The model is asked for the files it changed, not for a directory layout;
    // a path it made up would create a folder the student never made.
    const {source: merged} = mergeProposedFiles(project([]), [
      {path: 'src/deep/main.js', contents: 'x'},
    ]);

    expect(Object.values(merged.files)[0]).toMatchObject({
      name: 'main.js',
      folderId: '0',
    });
  });

  it('gives two new files two different ids', () => {
    // Both would otherwise be "one past the max id in the untouched project",
    // and the second would silently replace the first.
    const {source: merged} = mergeProposedFiles(project([file({})]), [
      {path: 'a.js', contents: 'a'},
      {path: 'b.js', contents: 'b'},
    ]);

    expect(Object.values(merged.files)).toHaveLength(3);
    expect(new Set(Object.keys(merged.files)).size).toBe(3);
  });

  it('does not touch the source it was given', () => {
    // The host keeps the original to put back on Reject.
    const source = project([file({})]);
    const before = JSON.stringify(source);

    mergeProposedFiles(source, [{path: '/index.html', contents: '<p>new</p>'}]);

    expect(JSON.stringify(source)).toBe(before);
  });
});
